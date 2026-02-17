import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { Resend } from "resend";
import { PRODUTOS_LISTA } from "@/constants/produtos";

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
        const idsProdutosRaw = paymentData.metadata.id_produtos;
        const idsProdutos: string[] = JSON.parse(idsProdutosRaw || "[]");
        const enderecoEntrega = paymentData.metadata.endereco_entrega;

        console.log(`✅ Pagamento aprovado! Itens: ${idsProdutos.join(", ")} para: ${emailCliente}`);

        for (const produtoId of idsProdutos) {
          const produto = PRODUTOS_LISTA[produtoId];
          if (!produto) continue;

          if (produto.tipo === 'digital') {
            // ENVIAR E-MAIL COM O MATERIAL DIGITAL
            const resend = getResend();
            if (resend) {
              await resend.emails.send({
                from: 'Tia Rafa <pedidos@seudominio.com>',
                to: emailCliente,
                subject: `🎉 Seu material "${produto.nome}" chegou!`,
                html: `
                  <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #7c3aed;">Olá! Ficamos felizes com sua compra.</h2>
                    <p>O seu material <strong>${produto.nome}</strong> já está disponível para download.</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${produto.downloadUrl || '#'}" style="background: #7c3aed; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; display: inline-block; font-weight: bold; font-size: 18px;">BAIXAR MEU MATERIAL</a>
                    </div>
                    <p style="font-size: 14px; color: #666;">Se o botão acima não funcionar, copie e cole este link no seu navegador: ${produto.downloadUrl}</p>
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
                from: 'Tia Rafa <pedidos@seudominio.com>',
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