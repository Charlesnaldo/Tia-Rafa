import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const url = new URL(request.url);
  const resourceId = url.searchParams.get("data.id") || url.searchParams.get("id");
  const type = url.searchParams.get("type");

  // O Mercado Pago avisa que houve uma atualização no pagamento
  if (type === "payment" && resourceId) {
    
    // 1. Aqui o sistema verificaria no Mercado Pago se o status é 'approved'
    // (Vou pular a validação da API do MP para focar no seu envio de e-mail)

    try {
      // 2. DISPARAR O E-MAIL COM O PDF
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'charles.naldo@gmail.com', // Mude para o e-mail do cliente após validar domínio
        subject: 'Seu Material: Alfabetização Mágica ✨',
        html: `
          <h1>Oba! Seu material chegou!</h1>
          <p>Obrigado por comprar a <strong>Alfabetização Mágica</strong>.</p>
          <p>Clique no botão abaixo para baixar seu PDF:</p>
          <a href="LINK_DO_SEU_GOOGLE_DRIVE_AQUI" 
             style="background: #ff6600; color: white; padding: 15px 25px; text-decoration: none; border-radius: 10px;">
             BAIXAR PDF AGORA
          </a>
        `
      });

      return NextResponse.json({ status: "success" });
    } catch (error) {
      return NextResponse.json({ error: "Erro ao enviar e-mail" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}