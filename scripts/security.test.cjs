/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { createHmac } = require("node:crypto");
const ts = require("typescript");
const { NextRequest } = require("next/server");

// Load the actual TypeScript handlers with mocked external services, without a dev server.
function load(relative, mocks = {}) {
  const cache = new Map();
  function read(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const source = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const localRequire = (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id.startsWith("@/")) return read(path.resolve("src", `${id.slice(2)}.ts`));
      return require(id);
    };
    new Function("require", "module", "exports", source)(localRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return read(path.resolve(relative));
}

function jsonRequest(value) {
  return new Request("https://example.com/api/chat/evolution", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value),
  });
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

test("JSON reader limits actual UTF-8 bytes even without Content-Length", async () => {
  const { readLimitedJson } = load("src/lib/limited-json.ts");
  await assert.rejects(readLimitedJson(jsonRequest({ text: "😀".repeat(20) }), 40), (error) => error.status === 413);
  await assert.rejects(readLimitedJson(new Request("https://example.com", { method: "POST", body: "{}" }), 40), (error) => error.status === 415);
  assert.deepEqual(await readLimitedJson(jsonRequest({ text: "oi" }), 100), { text: "oi" });
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
    "@/lib/supabase/admin": { getSupabaseAdminClient: () => ({ from: () => ({ select: () => ({ in: () => ({ eq: async () => ({ data: [{ id: "product", nome: "Produto", preco_cents: 1000, tipo: "digital" }] }) }) }) }) }) },
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

test("chat rejects oversized input and rate-limited requests before contacting n8n", async () => {
  let calls = 0;
  const { POST } = load("src/app/api/chat/evolution/route.ts", { "@/lib/chat-rate-limit": { allowChatRequest: async () => { calls++; return false; } } });
  assert.equal((await POST(jsonRequest({ text: "a".repeat(2001) }))).status, 400);
  assert.equal(calls, 0);
  const response = await POST(jsonRequest({ text: "oi" }));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "60");
  assert.equal(calls, 1);
});

test("chat strips raw automation data and upstream error details", async (t) => {
  const { POST } = load("src/app/api/chat/evolution/route.ts", { "@/lib/chat-rate-limit": { allowChatRequest: async () => true } });
  t.mock.method(global, "fetch", async () => Response.json({ reply: "Ola", internalSecret: "do-not-expose" }));
  const body = await (await POST(jsonRequest({ text: "oi" }))).json();
  assert.equal(body.messages[0].text, "Ola");
  assert.equal(JSON.stringify(body).includes("do-not-expose"), false);
  global.fetch = async () => Response.json({ secret: "do-not-expose" }, { status: 500 });
  const response = await POST(jsonRequest({ text: "oi" }));
  assert.equal(response.status, 502);
  assert.equal(JSON.stringify(await response.json()).includes("do-not-expose"), false);
});

test("chat limiter uses shared durable RPC quotas and fails closed on database errors", async () => {
  const calls = [];
  const { allowChatRequest } = load("src/lib/chat-rate-limit.ts", {
    "@/lib/supabase/admin": { getSupabaseAdminClient: () => ({ rpc: async (name, args) => { calls.push({ name, args }); return { data: true }; } }) },
  });
  assert.equal(await allowChatRequest(jsonRequest({ sessionId: "arbitrary" })), true);
  assert.equal(calls.length, 3);
  assert.deepEqual(calls.map((call) => call.args.p_limit), [10, 100, 1000]);
  const blocked = load("src/lib/chat-rate-limit.ts", {
    "@/lib/supabase/admin": { getSupabaseAdminClient: () => ({ rpc: async () => ({ error: { message: "database unavailable" } }) }) },
  });
  await assert.rejects(blocked.allowChatRequest(jsonRequest({})));
});

test("image proxy rejects inactive products and unpublished paths before privileged download", async () => {
  let product = null;
  let downloads = 0;
  const chain = { select() { return this; }, eq() { return this; }, async maybeSingle() { return { data: product }; } };
  const { GET } = load("src/app/api/product-image/route.ts", {
    "@/lib/supabase/admin": { getSupabaseAdminClient: () => ({ from: () => chain, storage: { from: () => ({ download: async () => { downloads++; return { data: new Blob(["test"], { type: "image/png" }) }; } }) } }) },
    "@/lib/supabase/storage-images": { listProductImagePaths: async () => ["product/imagens/public.png"] },
  });
  const request = (value) => new NextRequest(`https://example.com/api/product-image?path=${encodeURIComponent(value)}`);
  assert.equal((await GET(request("product/imagens/public.png"))).status, 404);
  product = { id: "product", imagem_url: "product/imagens/public.png" };
  assert.equal((await GET(request("product/imagens/private.png"))).status, 404);
  assert.equal((await GET(request("product/imagens/../file.png"))).status, 400);
  assert.equal(downloads, 0);
  const response = await GET(request("product/imagens/public.png"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(downloads, 1);
});

test("public catalog excludes paid material paths", async () => {
  const product = { id: "product", nome: "Produto", is_active: true, material_path: "secret/paid.pdf", preco_cents: 100 };
  const { GET } = load("src/app/api/products/route.ts", {
    "@/lib/supabase/admin": { getSupabaseAdminClient: () => ({ from: () => ({ select: () => ({ eq: async () => ({ data: [product] }) }) }) }) },
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
