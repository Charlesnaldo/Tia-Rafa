import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { Resend } from "resend";

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // O Mercado Pago envia apenas o ID do pagamento no Webhook
    const paymentId = body.data?.id;

    if (body.type === "payment" && paymentId) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      // VERIFICAÇÃO: O pagamento foi aprovado?
      if (paymentData.status === "approved") {
        const emailCliente = paymentData.payer?.email;
        const nomeProduto = paymentData.description;

        // DISPARO DO E-MAIL REAL COM O MATERIAL
        await resend.emails.send({
          from: "Tia Rafa <contato@seudominio.com>", // Troque pelo seu verificado no Resend
          to: emailCliente!,
          subject: `✨ Seu material chegou: ${nomeProduto}!`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h1>Parabéns pela compra! 🧡</h1>
              <p>O seu material <b>${nomeProduto}</b> já está disponível.</p>
              <a href="LINK_DO_SEU_PDF_AQUI" style="background: #f97316; color: white; padding: 15px; text-decoration: none; border-radius: 10px;">
                BAIXAR MEU PDF AGORA
              </a>
            </div>
          `
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Erro no Webhook:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}