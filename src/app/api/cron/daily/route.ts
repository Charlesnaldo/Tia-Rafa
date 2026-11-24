import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isMissingSchema } from "@/lib/supabase/missing-schema";
import { sendPaymentEmailOnce } from "@/lib/payment-email";
import { emailButton, emailLayout, getResend, resendFrom } from "@/lib/email/delivery";
import { escapeHtml } from "@/lib/html";
import { getCatalogProducts } from "@/lib/products/catalog-server";
import { getSiteUrl } from "@/lib/site-url";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HOUR = 60 * 60 * 1000;
const BATCH = 50;
// Proxy widths browsers actually request for cards, gallery and modal (see product-image-loader).
const WARM_WIDTHS = [192, 256, 320, 384, 480, 640, 828, 1080, 1600];
const WARM_CONCURRENCY = 8;

// Vercel Cron sends "Authorization: Bearer $CRON_SECRET". Without the secret the route stays closed.
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization") || "";
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

// Link that refills the cart on any device (see /carrinho).
function restoreCartLink(items: unknown) {
  const list = Array.isArray(items) ? items as { id?: unknown; quantity?: unknown }[] : [];
  const param = list
    .filter((item) => typeof item.id === "string" && Number.isInteger(item.quantity))
    .map((item) => `${encodeURIComponent(String(item.id))}:${item.quantity}`)
    .join(",");
  return `${getSiteUrl()}/carrinho${param ? `?itens=${param}` : ""}`;
}

async function sendPixReminders(now: number) {
  const supabase = getSupabaseAdminClient();
  const resend = getResend();
  const { data, error } = await supabase.from("pending_payments")
    .select("mp_payment_id, email, nome, total_amount, items, status")
    .is("reminder_sent_at", null)
    .is("paid_at", null)
    .lt("created_at", new Date(now - HOUR).toISOString())
    .gt("created_at", new Date(now - 72 * HOUR).toISOString())
    .order("created_at", { ascending: false })
    .limit(BATCH);
  if (error) {
    if (isMissingSchema(error)) return { skipped: true, sent: 0 };
    throw new Error("Falha ao listar Pix pendentes.");
  }
  if (!resend) return { skipped: true, sent: 0 };

  const payments = new Payment(new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || "" }));
  let sent = 0;
  for (const row of data || []) {
    // The webhook may have been missed: never remind someone who already paid.
    const status = await payments.get({ id: row.mp_payment_id }).then((payment) => payment.status || "pending").catch(() => null);
    if (status === null) continue;
    if (status === "approved") {
      await supabase.from("pending_payments").update({ status }).eq("mp_payment_id", row.mp_payment_id);
      continue;
    }
    const nome = escapeHtml(String(row.nome || "professora"));
    await sendPaymentEmailOnce(resend, String(row.mp_payment_id), "lembrete-pix", {
      from: resendFrom,
      to: row.email,
      subject: "Seus materiais estão esperando por você 💜",
      html: emailLayout(`
        <h2 style="color: #7c3aed;">Oi, ${nome}! Faltou só o pagamento.</h2>
        <p>Você separou materiais no valor de <strong>${formatCurrency(Math.round(Number(row.total_amount) * 100))}</strong>, mas o Pix não foi concluído.</p>
        <p>O código Pix expira em 30 minutos, então é só voltar ao carrinho e gerar um novo. Seus itens já estão lá.</p>
        ${emailButton(restoreCartLink(row.items), "FINALIZAR MINHA COMPRA")}
        <p style="font-size: 14px; color: #666;">Teve algum problema para pagar? Responda este e-mail que a gente te ajuda.</p>
      `),
    });
    await supabase.from("pending_payments")
      .update({ reminder_sent_at: new Date().toISOString(), status })
      .eq("mp_payment_id", row.mp_payment_id);
    sent += 1;
  }
  return { skipped: false, sent };
}

async function sendFollowUps(now: number) {
  const supabase = getSupabaseAdminClient();
  const resend = getResend();
  const { data, error } = await supabase.from("orders")
    .select("id, mp_payment_id, customers(nome, email), order_items(product_id)")
    .eq("status", "approved")
    .is("followup_sent_at", null)
    .lt("created_at", new Date(now - 72 * HOUR).toISOString())
    .gt("created_at", new Date(now - 240 * HOUR).toISOString())
    .limit(BATCH);
  if (error) {
    if (isMissingSchema(error)) return { skipped: true, sent: 0 };
    throw new Error("Falha ao listar pedidos para pos-venda.");
  }
  if (!resend) return { skipped: true, sent: 0 };

  const catalog = await getCatalogProducts().catch(() => []);
  const site = getSiteUrl();
  let sent = 0;
  for (const order of data || []) {
    const customer = (Array.isArray(order.customers) ? order.customers[0] : order.customers) as { nome?: string; email?: string } | null;
    if (!customer?.email) continue;
    const comprados = new Set(((order.order_items || []) as { product_id: string }[]).map((item) => item.product_id));
    const sugestoes = catalog.filter((produto) => !comprados.has(produto.id)).slice(0, 2);
    const lista = sugestoes.map((produto) =>
      `<li style="margin-bottom: 8px;"><a href="${escapeHtml(`${site}/produto/${encodeURIComponent(produto.id)}`)}">${escapeHtml(produto.nome)}</a> - ${formatCurrency(produto.preco)}</li>`).join("");

    await sendPaymentEmailOnce(resend, String(order.mp_payment_id), "pos-venda", {
      from: resendFrom,
      to: customer.email,
      subject: "Como foi usar o material com a turma? 🍎",
      html: emailLayout(`
        <h2 style="color: #7c3aed;">Oi, ${escapeHtml(customer.nome || "professora")}! Deu tudo certo?</h2>
        <p>Queremos saber como foi usar o material com seus alunos. <strong>Responda este e-mail</strong> contando, ou mande uma foto da atividade pronta: ela pode aparecer no nosso Instagram (só com sua autorização).</p>
        ${lista ? `<p>Separamos estes materiais que combinam com o que você levou:</p><ul>${lista}</ul>` : ""}
        ${emailButton(`${site}/#catalogo`, "VER TODOS OS MATERIAIS")}
      `),
    });
    await supabase.from("orders").update({ followup_sent_at: new Date().toISOString() }).eq("id", order.id);
    sent += 1;
  }
  return { skipped: false, sent };
}

// Requests every product image through the public CDN so the cache never goes cold.
// Images are cached 1h and served stale-while-revalidate for a day, so one pass a day
// keeps every visitor on a cache hit. Stops starting new requests near the deadline.
async function warmProductImages(deadline: number) {
  const catalog = await getCatalogProducts().catch(() => []);
  const paths = new Set<string>();
  for (const produto of catalog) {
    for (const src of [produto.imagem, ...(produto.imagens || [])]) {
      if (!src?.startsWith("/api/product-image?")) continue;
      const path = new URLSearchParams(src.slice(src.indexOf("?") + 1)).get("path");
      if (path) paths.add(path);
    }
  }
  const site = getSiteUrl();
  const queue = [...paths].flatMap((path) => WARM_WIDTHS.map((width) =>
    `${site}/api/product-image?${new URLSearchParams({ path, w: String(width) })}`));
  let warmed = 0;
  let skipped = 0;
  const worker = async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      if (Date.now() > deadline) {
        skipped += 1;
        continue;
      }
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) }).catch(() => null);
      if (response?.ok) warmed += 1;
      await response?.arrayBuffer().catch(() => null);
    }
  };
  await Promise.all(Array.from({ length: WARM_CONCURRENCY }, worker));
  return { images: paths.size, warmed, skipped };
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  try {
    const now = Date.now();
    const pix = await sendPixReminders(now);
    const followUps = await sendFollowUps(now);
    // Last and best-effort: a slow image never blocks the e-mails above.
    const images = await warmProductImages(now + 45_000).catch(() => null);
    return NextResponse.json({ pix, followUps, images });
  } catch (error) {
    console.error("Falha na rotina diaria:", error);
    return NextResponse.json({ error: "Falha na rotina diaria." }, { status: 500 });
  }
}
