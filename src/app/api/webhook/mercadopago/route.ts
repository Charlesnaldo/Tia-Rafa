import { NextResponse } from "next/server";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  // 1. Só instancia o Resend quando a função é chamada
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Validação de segurança para garantir que a chave existe
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not defined");
    }

    const body = await request.json();
    // ... lógica de verificação do Mercado Pago (resourceId, etc)

    // 2. Localizar e ler o PDF da pasta public
    const filePath = path.join(process.cwd(), "public", "alfabetizacao.pdf");
    const pdfBuffer = fs.readFileSync(filePath);

    // 3. Enviar o e-mail
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'charles.naldo@gmail.com', // No futuro, pegue o e-mail do body/cliente
      subject: 'Seu PDF Chegou! ✨ Alfabetização Mágica',
      html: '<p>Obrigado pela compra! Seu material está em anexo.</p>',
      attachments: [
        {
          filename: 'Alfabetizacao-Magica.pdf',
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erro no Webhook:", error.message);
    // Retornamos 200 mesmo no erro para o Mercado Pago parar de tentar reenviar o webhook
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}