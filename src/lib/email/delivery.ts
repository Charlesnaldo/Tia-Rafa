import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { Resend } from "resend";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { escapeHtml } from "@/lib/html";
import { formatShippingAddress, type ShippingAddress } from "@/lib/shipping-address";

type EmailPayload = Parameters<Resend["emails"]["send"]>[0];
type Attachment = { filename: string; content: Buffer; contentType: string };

export type PurchasedProduct = {
  id: string;
  nome: string;
  tipo: "digital" | "fisico";
  materialPath?: string | null;
};

let resendInstance: Resend | null = null;
export function getResend() {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export const resendFrom = process.env.RESEND_FROM || "Tia Rafa <onboarding@resend.dev>";

// Shared frame for every customer e-mail.
export function emailLayout(body: string) {
  return `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      ${body}
      <hr style="border: none; border-top: 1px solid #eee; margin-top: 32px;" />
      <p style="font-size: 12px; color: #999;">Tia Rafa - Transformando a educação com amor.</p>
    </div>`;
}

export function emailButton(href: string, label: string, color = "#7c3aed") {
  return `<div style="text-align: center; margin: 30px 0;">
    <a href="${escapeHtml(href)}" style="background: ${color}; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; display: inline-block; font-weight: bold; font-size: 18px;">${escapeHtml(label)}</a>
  </div>`;
}

// No is_active filter: a paid product must be delivered even if it was deactivated after checkout.
export async function getPurchasedProducts(ids: string[]) {
  const map = new Map<string, PurchasedProduct>();
  if (ids.length === 0) return map;
  const { data, error } = await getSupabaseAdminClient()
    .from("products")
    .select("id, nome, tipo, material_path")
    .in("id", ids);
  if (error) throw new Error("Falha ao consultar materiais comprados.");
  for (const row of data || []) {
    if (!row?.id) continue;
    map.set(row.id, {
      id: row.id,
      nome: row.nome || row.id,
      tipo: row.tipo === "fisico" ? "fisico" : "digital",
      materialPath: row.material_path ?? null,
    });
  }
  return map;
}

async function getDownloadLink(origin: string, produto: PurchasedProduct) {
  if (!produto.materialPath) return "";
  if (produto.materialPath.startsWith("/")) return `${origin}${produto.materialPath}`;
  try {
    const signed = await getSupabaseAdminClient().storage
      .from("materiais")
      .createSignedUrl(produto.materialPath, 60 * 60 * 24 * 7);
    return signed.data?.signedUrl || "";
  } catch {
    return "";
  }
}

async function getDigitalAttachment(produto: PurchasedProduct): Promise<Attachment | null> {
  if (!produto.materialPath) return null;

  if (produto.materialPath.startsWith("/")) {
    const semQuery = decodeURIComponent(produto.materialPath.split("?")[0].split("#")[0]).replace(/^\/+/, "");
    if (!semQuery || semQuery.includes("..")) return null;
    const caminho = join(process.cwd(), "public", semQuery);
    try {
      return { filename: basename(caminho), content: await readFile(caminho), contentType: "application/pdf" };
    } catch (error) {
      console.error(`Arquivo digital nao encontrado para o produto ${produto.id}:`, error);
      return null;
    }
  }

  try {
    const signed = await getSupabaseAdminClient().storage.from("materiais").createSignedUrl(produto.materialPath, 60 * 5);
    if (!signed.data?.signedUrl) return null;
    const response = await fetch(signed.data.signedUrl);
    if (!response.ok) return null;
    const fileName = produto.materialPath.split("/").pop() || `${produto.id}.pdf`;
    return {
      filename: decodeURIComponent(fileName),
      content: Buffer.from(await response.arrayBuffer()),
      contentType: "application/pdf",
    };
  } catch (error) {
    console.error(`Arquivo digital nao encontrado para o produto ${produto.id}:`, error);
    return null;
  }
}

// Builds the delivery e-mail for one digital material. Throws when there is nothing to deliver,
// so the webhook fails and Mercado Pago retries instead of silently skipping the customer.
export async function buildDigitalDeliveryEmail(origin: string, to: string, produto: PurchasedProduct): Promise<EmailPayload> {
  const downloadLink = await getDownloadLink(origin, produto);
  const attachment = await getDigitalAttachment(produto);
  if (!attachment && !downloadLink) throw new Error(`Material indisponivel para entrega: ${produto.id}.`);
  const nome = escapeHtml(produto.nome);
  return {
    from: resendFrom,
    to,
    subject: `🎉 Seu material "${produto.nome}" chegou!`,
    attachments: attachment ? [attachment] : undefined,
    html: emailLayout(`
      <h2 style="color: #7c3aed;">Olá! Ficamos felizes com sua compra.</h2>
      <p>O seu material <strong>${nome}</strong> já está disponível.</p>
      ${attachment ? "<p>O arquivo foi enviado em anexo neste e-mail. Guarde-o para usar quando quiser.</p>" : ""}
      ${downloadLink ? emailButton(downloadLink, "BAIXAR MEU MATERIAL") : ""}
      <p style="font-size: 14px; color: #666;">O link de download vale por 7 dias. Precisa de um novo envio? É só responder este e-mail.</p>
    `),
  };
}

export function buildPhysicalConfirmationEmail(to: string, produto: PurchasedProduct, address: ShippingAddress | null): EmailPayload {
  return {
    from: resendFrom,
    to,
    subject: "📦 Seu pedido está sendo preparado!",
    html: emailLayout(`
      <h2 style="color: #f97316;">Oba! Seu pedido foi confirmado.</h2>
      <p>Estamos preparando o seu produto <strong>${escapeHtml(produto.nome)}</strong> com muito carinho.</p>
      <p>Em breve você receberá o código de rastreio por este e-mail.</p>
      ${address ? `<div style="background: #fff7ed; padding: 20px; border-radius: 12px; border: 1px solid #fed7aa;">
        <h4 style="margin-top: 0;">Dados de entrega:</h4>
        <p style="font-size: 14px; margin-bottom: 0;">${escapeHtml(formatShippingAddress(address))}</p>
      </div>` : ""}
      <p style="font-size: 12px; color: #999;">Dúvidas? Entre em contato conosco pelo WhatsApp.</p>
    `),
  };
}

export function buildShippedEmail(to: string, nomeCliente: string, trackingCode: string): EmailPayload {
  const rastreio = `https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(trackingCode)}`;
  return {
    from: resendFrom,
    to,
    subject: "🚚 Seu pedido foi enviado!",
    html: emailLayout(`
      <h2 style="color: #f97316;">${escapeHtml(nomeCliente)}, seu pedido está a caminho!</h2>
      <p>Código de rastreio: <strong>${escapeHtml(trackingCode)}</strong></p>
      ${emailButton(rastreio, "ACOMPANHAR ENTREGA", "#f97316")}
    `),
  };
}
