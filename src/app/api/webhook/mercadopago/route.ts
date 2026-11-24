import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { persistApprovedSale } from "@/lib/supabase/sales";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isMissingSchema } from "@/lib/supabase/missing-schema";
import { verifyMercadoPagoWebhook } from "@/lib/mercadopago-webhook";
import { sendPaymentEmailOnce } from "@/lib/payment-email";
import { formatShippingAddress, parseShippingAddress, type ShippingAddress } from "@/lib/shipping-address";
import { expandKits, loadKitComponents } from "@/lib/products/kits";
import {
  buildDigitalDeliveryEmail, buildPhysicalConfirmationEmail, emailLayout, getPurchasedProducts, getResend,
  resendFrom, type PurchasedProduct,
} from "@/lib/email/delivery";
import { escapeHtml } from "@/lib/html";
import { contact } from "@/config/contact";
import { sendMetaPurchase } from "@/lib/meta/capi";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

function parseMetadataList(value: unknown): string[] {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseCartItems(value: unknown): { id: string; quantity: number }[] {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is { id: string; quantity: number } => {
      if (!item || typeof item !== "object") return false;
      const id = (item as { id?: unknown }).id;
      const quantity = (item as { quantity?: unknown }).quantity;
      return typeof id === "string" && typeof quantity === "number" && Number.isInteger(quantity) && quantity > 0;
    });
  } catch {
    return [];
  }
}

function parseAddress(value: unknown): ShippingAddress | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const parsed = parseShippingAddress(JSON.parse(value));
    return "address" in parsed ? parsed.address : null;
  } catch {
    return null;
  }
}

// Growth features (coupons, funnel, fulfillment). Before the migration runs they are skipped;
// any other failure throws so Mercado Pago retries the webhook.
async function recordGrowthData(paymentId: string, couponCode: string | null, discountCents: number, hasPhysical: boolean) {
  const supabase = getSupabaseAdminClient();
  const tolerate = (error: { code?: string; message?: string } | null, what: string) => {
    if (error && !isMissingSchema(error)) throw new Error(`Falha ao registrar ${what}.`);
  };

  const pending = await supabase.from("pending_payments")
    .update({ status: "approved", paid_at: new Date().toISOString() })
    .eq("mp_payment_id", paymentId);
  tolerate(pending.error, "pagamento no funil");

  const orderUpdate: Record<string, unknown> = {};
  if (couponCode) Object.assign(orderUpdate, { coupon_code: couponCode, discount_cents: discountCents });
  if (Object.keys(orderUpdate).length > 0) {
    const { error } = await supabase.from("orders").update(orderUpdate).eq("mp_payment_id", paymentId);
    tolerate(error, "cupom no pedido");
  }
  if (hasPhysical) {
    // Only the first time: never move an order that was already shipped back to "pendente".
    const { error } = await supabase.from("orders").update({ fulfillment_status: "pendente" })
      .eq("mp_payment_id", paymentId).is("fulfillment_status", null);
    tolerate(error, "status de envio");
  }
  if (couponCode) {
    const { error } = await supabase.rpc("redeem_coupon", {
      p_code: couponCode, p_payment_id: paymentId, p_discount_cents: discountCents,
    });
    tolerate(error, "uso do cupom");
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const webhookSecret = process.env.MP_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook indisponivel." }, { status: 503 });
    }
    const id = verifyMercadoPagoWebhook(request, webhookSecret);
    if (!id) {
      return NextResponse.json({ error: "Webhook nao autorizado." }, { status: 401 });
    }

    if (searchParams.get("type") !== "payment") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const paymentData = await new Payment(client).get({ id });
    if (paymentData.status !== "approved") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const metadata = paymentData.metadata || {};
    const emailCliente = metadata.email_comprador;
    const nomeCliente = metadata.nome_comprador;
    const telefoneCliente = metadata.telefone_comprador;
    const paymentId = String(paymentData.id);
    const idsProdutos = [...new Set(parseMetadataList(metadata.id_produtos))];
    const cartItems = parseCartItems(metadata.cart_items);
    const enderecoEntrega = parseAddress(metadata.endereco_entrega);
    const couponCode = typeof metadata.coupon_code === "string" && metadata.coupon_code ? metadata.coupon_code : null;
    const discountCents = Number.isInteger(Number(metadata.discount_cents)) ? Number(metadata.discount_cents) : 0;

    if (typeof emailCliente !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCliente)) {
      throw new Error("Pagamento sem destinatario valido.");
    }
    const resend = getResend();
    if (!resend) throw new Error("Provedor de e-mail indisponivel.");

    try {
      await persistApprovedSale({
        mpPaymentId: paymentId,
        status: paymentData.status || "approved",
        paymentMethod: paymentData.payment_method_id || "pix",
        totalAmount: Number(paymentData.transaction_amount || 0),
        email: emailCliente,
        nome: nomeCliente ? String(nomeCliente) : undefined,
        telefone: telefoneCliente ? String(telefoneCliente) : undefined,
        cpf: metadata.cpf_comprador ? String(metadata.cpf_comprador) : undefined,
        cartItems,
        rawPayload: paymentData,
      });
    } catch (dbError) {
      console.error("Falha ao persistir venda no Supabase:", dbError);
      throw new Error("Falha ao persistir venda.");
    }

    // A kit delivers its components; everything else delivers itself.
    const kits = await loadKitComponents(getSupabaseAdminClient(), idsProdutos);
    const entregaveis = expandKits(idsProdutos, kits);
    const purchasedProducts = await getPurchasedProducts(entregaveis);
    const missingProducts = entregaveis.filter((produtoId) => !purchasedProducts.has(produtoId));
    if (missingProducts.length > 0) {
      console.error(`Pagamento ${paymentId}: produtos nao encontrados para entrega:`, missingProducts);
      throw new Error("Produto pago nao encontrado para entrega.");
    }

    const quantidadeDe = (produtoId: string) => cartItems
      .filter((item) => item.id === produtoId || kits.get(item.id)?.includes(produtoId))
      .reduce((total, item) => total + item.quantity, 0) || 1;
    const physicalProducts = entregaveis
      .map((produtoId) => purchasedProducts.get(produtoId))
      .filter((produto): produto is PurchasedProduct => produto?.tipo === "fisico");

    await recordGrowthData(paymentId, couponCode, discountCents, physicalProducts.length > 0);

    if (physicalProducts.length > 0) {
      const enderecoTexto = enderecoEntrega ? formatShippingAddress(enderecoEntrega) : "ENDERECO NAO INFORMADO - contate o cliente";
      await sendPaymentEmailOnce(resend, paymentId, "loja:pedido-fisico", {
        from: resendFrom,
        to: contact.email,
        subject: `📦 Novo pedido fisico pago (#${paymentId})`,
        html: emailLayout(`
          <h2 style="color: #f97316;">Novo pedido fisico para enviar</h2>
          <p><strong>Pagamento:</strong> ${escapeHtml(paymentId)}</p>
          <p><strong>Cliente:</strong> ${escapeHtml(String(nomeCliente || "Cliente"))} - ${escapeHtml(emailCliente)}${telefoneCliente ? ` - ${escapeHtml(String(telefoneCliente))}` : ""}</p>
          <ul>${physicalProducts.map((produto) => `<li>${escapeHtml(produto.nome)} x ${quantidadeDe(produto.id)}</li>`).join("")}</ul>
          <p><strong>Entrega:</strong> ${escapeHtml(enderecoTexto)}</p>
          <p>Marque como enviado no painel (Pedidos) para o cliente receber o rastreio.</p>
        `),
      });
    }

    const origin = new URL(request.url).origin;
    for (const produtoId of entregaveis) {
      const produto = purchasedProducts.get(produtoId);
      if (!produto) continue;
      const email = produto.tipo === "digital"
        ? await buildDigitalDeliveryEmail(origin, emailCliente, produto)
        : buildPhysicalConfirmationEmail(emailCliente, produto, enderecoEntrega);
      await sendPaymentEmailOnce(resend, paymentId, produto.id, email);
    }

    const text = (value: unknown) => (typeof value === "string" ? value : undefined);
    // Report to Meta only when the buyer accepted advertising cookies at checkout (LGPD).
    if (metadata.meta_consent === "1") await sendMetaPurchase({
      paymentId,
      value: Number(paymentData.transaction_amount || 0),
      email: emailCliente,
      phone: text(telefoneCliente),
      firstName: text(nomeCliente),
      contentIds: idsProdutos,
      fbp: text(metadata.meta_fbp),
      fbc: text(metadata.meta_fbc),
      clientIp: text(metadata.client_ip),
      userAgent: text(metadata.client_ua),
      eventSourceUrl: `${getSiteUrl()}/sucesso`,
      eventTime: paymentData.date_approved ? Math.floor(new Date(paymentData.date_approved).getTime() / 1000) : undefined,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Erro no Webhook:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
