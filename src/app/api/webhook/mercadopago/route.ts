import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { Resend } from "resend";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { persistApprovedSale } from "@/lib/supabase/sales";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// Force dynamic rendering - não gerar estaticamente
export const dynamic = 'force-dynamic';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

// Lazy initialization - só cria quando realmente for usar
let resendInstance: Resend | null = null;
function getResend() {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

type PurchasedProduct = {
  id: string;
  nome: string;
  tipo: "digital" | "fisico";
  materialPath?: string | null;
};

async function getDownloadLink(
  request: Request,
  produto: { materialPath?: string | null }
) {
  const origin = new URL(request.url).origin;
  if (!produto.materialPath) return "";
  if (produto.materialPath.startsWith("http://") || produto.materialPath.startsWith("https://")) {
    return produto.materialPath;
  }
  if (produto.materialPath.startsWith("/")) {
    return `${origin}${produto.materialPath}`;
  }

  try {
    const supabase = getSupabaseAdminClient();
    const signed = await supabase.storage
      .from("materiais")
      .createSignedUrl(produto.materialPath, 60 * 60 * 24 * 7);
    return signed.data?.signedUrl || "";
  } catch {
    return "";
  }
}

async function getPurchasedProducts(idsProdutos: string[]) {
  const map = new Map<string, PurchasedProduct>();
  if (idsProdutos.length === 0) return map;

  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("products")
      .select("id, nome, tipo, material_path, is_active")
      .in("id", idsProdutos)
      .eq("is_active", true);

    for (const row of data || []) {
      if (!row?.id) continue;
      map.set(row.id, {
        id: row.id,
        nome: row.nome || row.id,
        tipo: row.tipo === "fisico" ? "fisico" : "digital",
        materialPath: row.material_path ?? null,
      });
    }
  } catch {
    return map;
  }

  return map;
}

async function getDigitalAttachment(produto: { id: string; materialPath?: string | null }) {
  if (!produto.materialPath) {
    return null;
  }

  if (produto.materialPath.startsWith("/")) {
    const arquivoSemQuery = produto.materialPath.split("?")[0].split("#")[0];
    const arquivoDecodificado = decodeURIComponent(arquivoSemQuery);
    const caminhoRelativo = arquivoDecodificado.startsWith("/")
      ? arquivoDecodificado.slice(1)
      : arquivoDecodificado;

    if (!caminhoRelativo || caminhoRelativo.includes("..")) {
      return null;
    }

    const caminhoAbsoluto = join(process.cwd(), "public", caminhoRelativo);

    try {
      const content = await readFile(caminhoAbsoluto);
      return {
        filename: basename(caminhoAbsoluto),
        content,
        contentType: "application/pdf",
      };
    } catch (error) {
      console.error(`Arquivo digital nao encontrado para o produto ${produto.id}:`, error);
      return null;
    }
  }

  if (produto.materialPath.startsWith("http://") || produto.materialPath.startsWith("https://")) {
    try {
      const response = await fetch(produto.materialPath);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      const fileBytes = Buffer.from(arrayBuffer);
      const pathname = new URL(produto.materialPath).pathname;
      const fileName = pathname.split("/").pop() || `${produto.id}.pdf`;
      return {
        filename: decodeURIComponent(fileName),
        content: fileBytes,
        contentType: "application/pdf",
      };
    } catch {
      return null;
    }
  }

  try {
    const supabase = getSupabaseAdminClient();
    const signed = await supabase.storage
      .from("materiais")
      .createSignedUrl(produto.materialPath, 60 * 5);
    const signedUrl = signed.data?.signedUrl;
    if (!signedUrl) return null;

    const fileResponse = await fetch(signedUrl);
    if (!fileResponse.ok) return null;
    const arrayBuffer = await fileResponse.arrayBuffer();
    const fileBytes = Buffer.from(arrayBuffer);
    const fileName = produto.materialPath.split("/").pop() || `${produto.id}.pdf`;

    return {
      filename: decodeURIComponent(fileName),
      content: fileBytes,
      contentType: "application/pdf",
    };
  } catch (error) {
    console.error(`Arquivo digital nao encontrado para o produto ${produto.id}:`, error);
    return null;
  }
}
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("data.id") || searchParams.get("id");
    const type = searchParams.get("type");

    // Só processamos se for um evento de pagamento
    if (type === "payment" && id) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id });

      // VERIFICAÇÃO: O pagamento foi aprovado?
      if (paymentData.status === "approved") {
        // Pegamos os da
        // dos que guardamos no 'metadata' lá no checkout
        const emailCliente = paymentData.metadata.email_comprador;
        const nomeCliente = paymentData.metadata.nome_comprador;
        const cpfCliente = paymentData.metadata.cpf_comprador;
        const telefoneCliente = paymentData.metadata.telefone_comprador;
        const idsProdutosRaw = paymentData.metadata.id_produtos;
        const cartItemsRaw = paymentData.metadata.cart_items;
        const idsProdutos: string[] = JSON.parse(idsProdutosRaw || "[]");
        const cartItems: { id: string; quantity: number }[] = JSON.parse(cartItemsRaw || "[]");
        const enderecoEntrega = paymentData.metadata.endereco_entrega;

        console.log(`✅ Pagamento aprovado! Itens: ${idsProdutos.join(", ")} para: ${emailCliente}`);

        try {
          await persistApprovedSale({
            mpPaymentId: String(paymentData.id),
            status: paymentData.status || "approved",
            paymentMethod: paymentData.payment_method_id || "pix",
            totalAmount: Number(paymentData.transaction_amount || 0),
            email: String(emailCliente || ""),
            nome: nomeCliente ? String(nomeCliente) : undefined,
            telefone: telefoneCliente ? String(telefoneCliente) : undefined,
            cpf: cpfCliente ? String(cpfCliente) : undefined,
            cartItems: Array.isArray(cartItems) ? cartItems : [],
            rawPayload: paymentData,
          });
        } catch (dbError) {
          console.error("Falha ao persistir venda no Supabase:", dbError);
        }

        const purchasedProducts = await getPurchasedProducts(idsProdutos);
        for (const produtoId of idsProdutos) {
          const produto = purchasedProducts.get(produtoId);
          if (!produto) continue;

          if (produto.tipo === 'digital') {
            // ENVIAR E-MAIL COM O MATERIAL DIGITAL
            const resend = getResend();
            const downloadLink = await getDownloadLink(request, produto);
            const attachment = await getDigitalAttachment(produto);
            if (resend) {
              await resend.emails.send({
                from: 'Tia Rafa <charles.naldo@gmail.com>',
                to: emailCliente,
                subject: `🎉 Seu material "${produto.nome}" chegou!`,
                attachments: attachment ? [attachment] : undefined,
                html: `
                  <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #7c3aed;">Olá! Ficamos felizes com sua compra.</h2>
                    <p>O seu material <strong>${produto.nome}</strong> já está disponível.</p>
                    ${attachment ? `<p>O arquivo foi enviado em anexo neste e-mail.</p>` : ""}
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${downloadLink || '#'}" style="background: #7c3aed; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; display: inline-block; font-weight: bold; font-size: 18px;">BAIXAR MEU MATERIAL</a>
                    </div>
                    <p style="font-size: 14px; color: #666;">Se o botão acima não funcionar, copie e cole este link no seu navegador: ${downloadLink || "Link indisponível no momento. Entre em contato com o suporte."}</p>
                    <br/>
                    <hr style="border: none; border-top: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #999;">Tia Rafa - Transformando a educação com amor.</p>
                  </div>
                `
              });
            }
          } else if (produto.tipo === 'fisico') {
            // ENVIAR E-MAIL DE CONFIRMAÇÃO PARA O CLIENTE (FÍSICO)
            const resend = getResend();
            if (resend) {
              await resend.emails.send({
                from: 'Tia Rafa <charles.naldo@gmail.com>',
                to: emailCliente,
                subject: '📦 Seu pedido está sendo preparado!',
                html: `
                  <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f97316;">Oba! Seu pedido foi confirmado.</h2>
                    <p>Estamos preparando o seu produto <strong>${produto.nome}</strong> com muito carinho.</p>
                    <p>Em breve você receberá o código de rastreio por este e-mail.</p>
                    ${enderecoEntrega ? `
                    <div style="background: #fff7ed; padding: 20px; border-radius: 12px; border: 1px solid #fed7aa;">
                      <h4 style="margin-top: 0;">Dados de Entrega:</h4>
                      <pre style="font-family: inherit; font-size: 14px; margin-bottom: 0;">${JSON.parse(enderecoEntrega || '{}').rua}, ${JSON.parse(enderecoEntrega || '{}').numero}</pre>
                    </div>` : ''}
                    <br/>
                    <p style="font-size: 12px; color: #999;">Dúvidas? Entre em contato conosco pelo WhatsApp.</p>
                  </div>
                `
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Erro no Webhook:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}


