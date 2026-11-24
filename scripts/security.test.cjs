/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { createHmac } = require("node:crypto");
const ts = require("typescript");
const sharp = require("sharp");
const { NextRequest } = require("next/server");

// Load the actual TypeScript handlers with mocked external services, without a dev server.
function load(relative, mocks = {}) {
  const cache = new Map();
  function read(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const source = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const localRequire = (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id.startsWith("@/")) return read(path.resolve("src", `${id.slice(2)}.ts`));
      if (id.startsWith(".")) return read(path.resolve(path.dirname(filename), `${id}.ts`));
      return require(id);
    };
    new Function("require", "module", "exports", source)(localRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return read(path.resolve(relative));
}

// Supabase stand-in: every filter chains, awaiting resolves to the table's rows.
// Tables set to an error object simulate a missing migration or a failure.
function fakeSupabase(tables = {}, extra = {}) {
  const inserts = [];
  const query = (table) => {
    const result = () => {
      const value = tables[table];
      if (value && value.error) return { data: null, error: value.error };
      return { data: value ?? [], error: null };
    };
    const builder = new Proxy({}, {
      get(_target, prop) {
        if (prop === "then") return (resolve, reject) => Promise.resolve(result()).then(resolve, reject);
        if (prop === "maybeSingle" || prop === "single") return async () => ({ data: result().data?.[0] ?? null, error: result().error });
        if (prop === "insert" || prop === "upsert") return (row) => { inserts.push({ table, row }); return builder; };
        return () => builder;
      },
    });
    return builder;
  };
  return { from: query, rpc: async () => ({ data: true, error: null }), inserts, ...extra };
}

function signedWebhook({ id = "123456", timestamp = String(Math.floor(Date.now() / 1000)), requestId = "request-123", secret = "test-signing-key" } = {}) {
  const hash = createHmac("sha256", secret).update(`id:${id};request-id:${requestId};ts:${timestamp};`).digest("hex");
  return new Request(`https://example.com/api/webhook/mercadopago?type=payment&data.id=${id}`, {
    method: "POST", headers: { "x-request-id": requestId, "x-signature": `ts=${timestamp},v1=${hash}` },
  });
}

test("webhook accepts valid signatures and rejects tampering, wrong secrets and stale requests", () => {
  const { verifyMercadoPagoWebhook: verify } = load("src/lib/mercadopago-webhook.ts");
  const request = signedWebhook();
  assert.equal(verify(request, "test-signing-key"), "123456");
  assert.equal(verify(request, "wrong"), null);
  assert.equal(verify(new Request(request.url.replace("123456", "987654"), request), "test-signing-key"), null);
  assert.equal(verify(signedWebhook({ timestamp: "1704908010" }), "test-signing-key"), null);
  assert.equal(verify(new Request(`${request.url}&data.id=123456`, request), "test-signing-key"), null);
  assert.equal(verify(new Request(request.url, { method: "POST" }), "test-signing-key"), null);
  assert.equal(verify(signedWebhook({ timestamp: String(Date.now()) }), "test-signing-key"), "123456");
});

test("webhook fails closed when its signing secret is absent or a URL secret is used", async (t) => {
  const previous = process.env.MP_WEBHOOK_SECRET;
  t.after(() => { if (previous === undefined) delete process.env.MP_WEBHOOK_SECRET; else process.env.MP_WEBHOOK_SECRET = previous; });
  const { POST } = load("src/app/api/webhook/mercadopago/route.ts", {
    mercadopago: { MercadoPagoConfig: class {}, Payment: class { get() { assert.fail("Unauthenticated provider lookup"); } } },
  });
  delete process.env.MP_WEBHOOK_SECRET;
  assert.equal((await POST(signedWebhook())).status, 503);
  process.env.MP_WEBHOOK_SECRET = "test-signing-key";
  assert.equal((await POST(new Request("https://example.com/api/webhook/mercadopago?type=payment&data.id=123456&secret=test-signing-key", { method: "POST" }))).status, 401);
});

test("payment ownership is opaque, HttpOnly and scoped to the buyer's cookie", () => {
  const owner = load("src/lib/payment-owner.ts");
  const token = owner.createPaymentOwner(new NextRequest("https://example.com/api/process_payment"));
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.equal(owner.matchesPaymentOwner(token, owner.hashPaymentOwner(token)), true);
  assert.equal(owner.matchesPaymentOwner("0".repeat(64), owner.hashPaymentOwner(token)), false);
  assert.equal(owner.matchesPaymentOwner(token, undefined), false);
  const response = owner.setPaymentOwner(require("next/server").NextResponse.json({ ok: true }), token);
  assert.match(response.headers.get("set-cookie"), /HttpOnly/i);
  assert.match(response.headers.get("set-cookie"), /SameSite=lax/i);
  assert.match(response.headers.get("cache-control"), /no-store/);
});

test("payment status denies anonymous and other buyers, and permits only the matching owner", async (t) => {
  const previous = process.env.MP_ACCESS_TOKEN;
  process.env.MP_ACCESS_TOKEN = "test";
  t.after(() => { if (previous === undefined) delete process.env.MP_ACCESS_TOKEN; else process.env.MP_ACCESS_TOKEN = previous; });
  const owner = load("src/lib/payment-owner.ts");
  const token = "a".repeat(64);
  let calls = 0;
  const { GET } = load("src/app/api/payment_status/route.ts", {
    mercadopago: { MercadoPagoConfig: class {}, Payment: class {
      async get() { calls++; return { id: "123", status: "approved", metadata: { payment_status_owner: owner.hashPaymentOwner(token) } }; }
    } },
  });
  const request = (cookie) => new NextRequest("https://example.com/api/payment_status?id=123", { headers: cookie ? { cookie: `payment_owner=${cookie}` } : {} });
  assert.equal((await GET(request())).status, 401);
  assert.equal(calls, 0);
  assert.equal((await GET(request("b".repeat(64)))).status, 404);
  const response = await GET(request(token));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.equal((await response.json()).status, "approved");
});

test("Pix and card creation both bind payment metadata to the browser without leaking a webhook secret", async (t) => {
  const previous = { token: process.env.MP_ACCESS_TOKEN, url: process.env.NEXT_PUBLIC_URL };
  process.env.MP_ACCESS_TOKEN = "test";
  process.env.NEXT_PUBLIC_URL = "https://example.com";
  t.after(() => {
    if (previous.token === undefined) delete process.env.MP_ACCESS_TOKEN; else process.env.MP_ACCESS_TOKEN = previous.token;
    if (previous.url === undefined) delete process.env.NEXT_PUBLIC_URL; else process.env.NEXT_PUBLIC_URL = previous.url;
  });
  const owner = load("src/lib/payment-owner.ts");
  const captures = [];
  t.mock.method(global, "fetch", async (url, options) => {
    captures.push(JSON.parse(options.body));
    return Response.json(String(url).includes("preferences")
      ? { id: "preference-123", init_point: "https://mercadopago.com/checkout/test" }
      : { id: "123", status: "pending", payment_method_id: "pix" });
  });
  const { POST } = load("src/app/api/process_payment/route.ts", {
    "@/lib/supabase/admin": { getSupabaseAdminClient: () => fakeSupabase({ products: [{ id: "product", nome: "Produto", preco_cents: 1000, tipo: "digital" }], kit_items: { error: { code: "PGRST205" } } }) },
  });
  for (const paymentMethod of ["pix", "credit_card"]) {
    const response = await POST(new NextRequest("https://example.com/api/process_payment", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ cartItems: [{ id: "product", quantity: 1 }], emailCliente: "buyer@example.com", nomeCliente: "Cliente", cpfCliente: "12345678901", telefoneCliente: "11999999999", paymentMethod }),
    }));
    assert.equal(response.status, 200);
    const cookie = response.cookies.get("payment_owner").value;
    const payment = captures.at(-1);
    assert.equal(payment.metadata.payment_status_owner, owner.hashPaymentOwner(cookie));
    assert.equal(payment.notification_url, "https://example.com/api/webhook/mercadopago");
    assert.equal(payment.metadata.payment_status_owner.includes(cookie), false);
  }
});

test("image proxy rejects inactive products and unpublished paths before privileged download", async () => {
  const sourceImage = await sharp({ create: { width: 1000, height: 600, channels: 3, background: "#8b5cf6" } }).png().toBuffer();
  let product = null;
  let downloads = 0;
  const chain = { select() { return this; }, eq() { return this; }, async maybeSingle() { return { data: product }; } };
  const { GET } = load("src/app/api/product-image/route.ts", {
    "@/lib/supabase/admin": { getSupabaseAdminClient: () => ({ from: () => chain, storage: { from: () => ({ download: async () => { downloads++; return { data: new Blob([sourceImage], { type: "image/png" }) }; } }) } }) },
    "@/lib/supabase/storage-images": { listProductImagePaths: async () => ["product/imagens/public.png"] },
  });
  const request = (value, width = 64) => new NextRequest(`https://example.com/api/product-image?path=${encodeURIComponent(value)}&w=${width}`);
  assert.equal((await GET(request("product/imagens/public.png"))).status, 404);
  product = { id: "product", imagem_url: "product/imagens/public.png" };
  assert.equal((await GET(request("product/imagens/private.png"))).status, 404);
  assert.equal((await GET(request("product/imagens/../file.png"))).status, 400);
  assert.equal((await GET(request("product/imagens/public.png", 99999))).status, 400);
  assert.equal((await GET(request("product/pdf/private.pdf"))).status, 400);
  assert.equal(downloads, 0);
  const response = await GET(request("product/imagens/public.png"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400");
  assert.equal(response.headers.get("content-type"), "image/webp");
  const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
  assert.equal(metadata.width, 64);
  assert.equal(metadata.format, "webp");
  assert.equal(downloads, 1);
});

test("responsive product images bypass Vercel's incompatible optimizer without disabling resizing", () => {
  const { productImageLoader } = load("src/lib/product-image-loader.ts");
  const src = "/api/product-image?path=product%2Fimagens%2Fphoto.png";
  const thumbnail = new URL(productImageLoader({ src, width: 64 }), "https://example.com");
  assert.equal(thumbnail.searchParams.get("path"), "product/imagens/photo.png");
  assert.equal(thumbnail.searchParams.get("w"), "64");
  assert.equal(new URL(productImageLoader({ src, width: 3840 }), "https://example.com").searchParams.get("w"), "1600");
  const FallbackImage = load("src/components/FallbackImage.tsx").default;
  const markup = require("react-dom/server").renderToStaticMarkup(require("react").createElement(FallbackImage, {
    src, alt: "Produto", width: 64, height: 64,
  }));
  assert.match(markup, /srcSet="\/api\/product-image\?/);
  assert.equal(markup.includes("/_next/image"), false);
});

test("public catalog excludes paid material paths", async () => {
  const product = { id: "product", nome: "Produto", is_active: true, material_path: "secret/paid.pdf", preco_cents: 100 };
  const { GET } = load("src/app/api/products/route.ts", {
    "server-only": {},
    "next/cache": { unstable_cache: (fn) => fn },
    "@/lib/supabase/admin": { getSupabaseAdminClient: () => fakeSupabase({ products: [product] }) },
    "@/lib/supabase/storage-images": { resolveProductImageUrls: async () => [], buildProductImageProxyUrl: () => null, resolveStorageImageUrl: async () => null },
  });
  const body = await (await GET()).json();
  assert.equal(Object.hasOwn(body.products[0], "material_path"), false);
  assert.equal(JSON.stringify(body).includes("paid.pdf"), false);
});

test("email delivery suppresses completed and concurrent attempts, preserving the stored retry payload", async () => {
  let state = "claimed";
  let savedPayload;
  let sends = 0;
  const supabase = {
    async rpc(name, args) {
      savedPayload ||= JSON.parse(JSON.stringify(args.p_payload));
      return { data: state === "claimed" ? { state, token: "claim", payload: savedPayload } : { state } };
    },
    from: () => ({ update: () => ({ eq() { return this; }, select() { return this; }, async single() { state = "sent"; return { data: { payment_id: "123" } }; } }) }),
  };
  const { sendPaymentEmailOnce } = load("src/lib/payment-email.ts", { "@/lib/supabase/admin": { getSupabaseAdminClient: () => supabase } });
  const resend = { emails: { async send(payload, options) { sends++; assert.equal(payload.html, "original"); assert.match(options.idempotencyKey, /^payment\/[a-f0-9]{64}$/); return { data: { id: "email-123" } }; } } };
  const payload = { from: "test@example.com", to: "buyer@example.com", subject: "Material", html: "original", attachments: [{ filename: "test.pdf", content: Buffer.from("pdf") }] };
  state = "busy";
  await assert.rejects(sendPaymentEmailOnce(resend, "123", "product", payload));
  assert.equal(sends, 0);
  state = "claimed";
  await sendPaymentEmailOnce(resend, "123", "product", { ...payload, html: "changed" });
  assert.equal(savedPayload.attachments[0].content, Buffer.from("pdf").toString("base64"));
  await sendPaymentEmailOnce(resend, "123", "product", payload);
  assert.equal(sends, 1);
  state = "manual_review";
  await assert.rejects(sendPaymentEmailOnce(resend, "123", "product", payload));
  assert.equal(sends, 1);
});

test("email errors are never recorded as successful deliveries", async () => {
  let updated = false;
  const { sendPaymentEmailOnce } = load("src/lib/payment-email.ts", {
    "@/lib/supabase/admin": { getSupabaseAdminClient: () => ({ rpc: async () => ({ data: { state: "claimed", token: "claim", payload: { html: "test" } } }), from: () => { updated = true; assert.fail("Must not mark rejected mail as sent"); } }) },
  });
  await assert.rejects(sendPaymentEmailOnce({ emails: { send: async () => ({ error: { message: "timeout" } }) } }, "123", "product", { from: "a@example.com", to: "b@example.com", subject: "test", html: "test" }));
  assert.equal(updated, false);
});

test("physical items require a valid shipping address, which is stored in payment metadata", async (t) => {
  const previous = process.env.MP_ACCESS_TOKEN;
  process.env.MP_ACCESS_TOKEN = "test";
  t.after(() => { if (previous === undefined) delete process.env.MP_ACCESS_TOKEN; else process.env.MP_ACCESS_TOKEN = previous; });
  const captures = [];
  t.mock.method(global, "fetch", async (url, options) => {
    captures.push(JSON.parse(options.body));
    return Response.json({ id: "123", status: "pending", payment_method_id: "pix" });
  });
  const { POST } = load("src/app/api/process_payment/route.ts", {
    "@/lib/supabase/admin": { getSupabaseAdminClient: () => fakeSupabase({ products: [{ id: "kit", nome: "Kit", preco_cents: 5000, tipo: "fisico" }] }) },
  });
  const pay = (extra) => POST(new NextRequest("https://example.com/api/process_payment", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ cartItems: [{ id: "kit", quantity: 2, nome: "client-supplied" }], emailCliente: "buyer@example.com", nomeCliente: "Cliente", cpfCliente: "12345678901", telefoneCliente: "11999999999", paymentMethod: "pix", ...extra }),
  }));

  const missing = await pay({});
  assert.equal(missing.status, 400);
  assert.equal((await missing.json()).code, "ADDRESS_REQUIRED");
  assert.equal((await pay({ enderecoEntrega: { cep: "123", rua: "Rua A", numero: "1", bairro: "B", cidade: "C", uf: "CE" } })).status, 400);
  assert.equal((await pay({ enderecoEntrega: { cep: "60000-000", rua: "Rua A", numero: "1", bairro: "B", cidade: "C", uf: "XX" } })).status, 400);
  assert.equal(captures.length, 0);

  const ok = await pay({ enderecoEntrega: { cep: "60000-000", rua: "Rua A", numero: "10", complemento: "Apto 2", bairro: "Centro", cidade: "Fortaleza", uf: "ce" } });
  assert.equal(ok.status, 200);
  const metadata = captures.at(-1).metadata;
  assert.deepEqual(JSON.parse(metadata.endereco_entrega), { cep: "60000000", rua: "Rua A", numero: "10", complemento: "Apto 2", bairro: "Centro", cidade: "Fortaleza", uf: "CE" });
  assert.deepEqual(JSON.parse(metadata.cart_items), [{ id: "kit", quantity: 2 }]);
});

test("coupons: percent, fixed, minimums, expiry and limits never produce a zero or negative total", () => {
  const { computeCouponDiscount } = load("src/lib/coupons.ts");
  const base = { code: "LEVE3", description: null, percent_off: 20, amount_off_cents: null, min_items: 1, min_subtotal_cents: 0, max_uses: null, uses: 0, expires_at: null, is_active: true };
  assert.deepEqual(computeCouponDiscount(base, 1000, 1), { ok: true, code: "LEVE3", discountCents: 200, description: null });
  assert.equal(computeCouponDiscount({ ...base, percent_off: null, amount_off_cents: 5000 }, 1000, 1).discountCents, 999);
  assert.equal(computeCouponDiscount({ ...base, min_items: 3 }, 1000, 2).ok, false);
  assert.equal(computeCouponDiscount({ ...base, min_subtotal_cents: 2000 }, 1000, 5).ok, false);
  assert.equal(computeCouponDiscount({ ...base, max_uses: 5, uses: 5 }, 1000, 1).ok, false);
  assert.equal(computeCouponDiscount({ ...base, expires_at: "2020-01-01T00:00:00Z" }, 1000, 1).ok, false);
  assert.equal(computeCouponDiscount({ ...base, is_active: false }, 1000, 1).ok, false);
  assert.equal(computeCouponDiscount(null, 1000, 1).ok, false);
});

test("kits expand into their components without duplicates", () => {
  const { expandKits } = load("src/lib/products/kits.ts", { "@/lib/supabase/missing-schema": load("src/lib/supabase/missing-schema.ts") });
  const kits = new Map([["kit-folclore", ["saci", "curupira"]]]);
  assert.deepEqual(expandKits(["kit-folclore", "saci", "abayomi"], kits), ["saci", "curupira", "abayomi"]);
});

test("payment applies coupons server-side and records the Pix for the funnel", async (t) => {
  const previous = process.env.MP_ACCESS_TOKEN;
  process.env.MP_ACCESS_TOKEN = "test";
  t.after(() => { if (previous === undefined) delete process.env.MP_ACCESS_TOKEN; else process.env.MP_ACCESS_TOKEN = previous; });
  const captures = [];
  t.mock.method(global, "fetch", async (url, options) => {
    captures.push(JSON.parse(options.body));
    return Response.json({ id: "555", status: "pending", payment_method_id: "pix" });
  });
  const db = fakeSupabase({
    products: [{ id: "p", nome: "Produto", preco_cents: 1000, tipo: "digital" }],
    coupons: [{ code: "DEZ", description: null, percent_off: 10, amount_off_cents: null, min_items: 1, min_subtotal_cents: 0, max_uses: null, uses: 0, expires_at: null, is_active: true }],
  });
  const { POST } = load("src/app/api/process_payment/route.ts", { "@/lib/supabase/admin": { getSupabaseAdminClient: () => db } });
  const pay = (couponCode) => POST(new NextRequest("https://example.com/api/process_payment", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ cartItems: [{ id: "p", quantity: 2 }], emailCliente: "buyer@example.com", nomeCliente: "Cliente", cpfCliente: "12345678901", telefoneCliente: "11999999999", paymentMethod: "pix", couponCode }),
  }));

  const ok = await pay("dez");
  assert.equal(ok.status, 200);
  assert.equal(captures.at(-1).transaction_amount, 18);
  assert.equal(captures.at(-1).metadata.coupon_code, "DEZ");
  assert.equal(captures.at(-1).metadata.discount_cents, 200);
  const pending = db.inserts.find((insert) => insert.table === "pending_payments");
  assert.equal(pending.row.mp_payment_id, "555");
  assert.equal(pending.row.total_amount, 18);

  db.inserts.length = 0;
  const noCoupons = fakeSupabase({ products: [{ id: "p", nome: "Produto", preco_cents: 1000, tipo: "digital" }], coupons: [] });
  const { POST: postWithoutCoupons } = load("src/app/api/process_payment/route.ts", { "@/lib/supabase/admin": { getSupabaseAdminClient: () => noCoupons } });
  const invalid = await postWithoutCoupons(new NextRequest("https://example.com/api/process_payment", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ cartItems: [{ id: "p", quantity: 2 }], emailCliente: "buyer@example.com", nomeCliente: "Cliente", cpfCliente: "12345678901", telefoneCliente: "11999999999", paymentMethod: "pix", couponCode: "NAOEXISTE" }),
  }));
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).code, "COUPON_INVALID");
});

test("daily cron and admin order routes refuse unauthenticated calls", async () => {
  const previous = process.env.CRON_SECRET;
  delete process.env.CRON_SECRET;
  const cron = load("src/app/api/cron/daily/route.ts", {
    "@/lib/products/catalog-server": { getCatalogProducts: async () => [] },
  });
  assert.equal((await cron.GET(new Request("https://example.com/api/cron/daily", { headers: { authorization: "Bearer " } }))).status, 401);
  process.env.CRON_SECRET = "cron-test-secret";
  assert.equal((await cron.GET(new Request("https://example.com/api/cron/daily", { headers: { authorization: "Bearer wrong" } }))).status, 401);
  if (previous === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = previous;

  for (const route of ["src/app/api/admin/pedidos/[id]/envio/route.ts", "src/app/api/admin/pedidos/[id]/reenviar/route.ts"]) {
    const { POST } = load(route);
    const response = await POST(new NextRequest("https://example.com/api/admin/x", { method: "POST", body: "{}" }), { params: Promise.resolve({ id: "1" }) });
    assert.equal(response.status, 401);
  }
});

test("leads validate input before touching the database", async () => {
  let touched = false;
  const { POST } = load("src/app/api/leads/route.ts", {
    "@/lib/rate-limit": { allowRequest: async () => { touched = true; return true; } },
    "@/lib/supabase/admin": { getSupabaseAdminClient: () => { touched = true; return fakeSupabase(); } },
  });
  const post = (body) => POST(new Request("https://example.com/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
  assert.equal((await post({ nome: "Ana", email: "nao-e-email" })).status, 400);
  assert.equal((await post({ email: "ana@example.com" })).status, 400);
  assert.equal(touched, false);
});
