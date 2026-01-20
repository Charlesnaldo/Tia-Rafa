import { NextResponse } from "next/server";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not defined");
    }

    // Pega os parâmetros da URL que o Mercado Pago envia
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("data.id");

    // SÓ ENVIA O E-MAIL SE FOR UM EVENTO DE PAGAMENTO
    if (type === "payment") {
      // 1. Localizar e ler o PDF da pasta public
      // Certifique-se que o arquivo em public se chama exatamente: alfabetizacao.pdf
      const filePath = path.join(process.cwd(), "public", "alfabetizacao.pdf");
      
      if (!fs.existsSync(filePath)) {
        console.error("Arquivo PDF não encontrado no caminho:", filePath);
        return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 200 });
      }

      const pdfBuffer = fs.readFileSync(filePath);

      // 2. Enviar o e-mail
      await resend.emails.send({
        from: 'onboarding@resend.dev', 
        to: 'charles.naldo@gmail.com', // Mude para o e-mail do cliente quando validar o domínio
        subject: 'Seu PDF Chegou! ✨ Alfabetização Mágica',
        html: `
          <h1 style="color: #ff6600;">Seu pagamento foi aprovado!</h1>
          <p>Obrigado pela compra da <strong>Alfabetização Mágica</strong>.</p>
          <p>O seu material em PDF está anexado a este e-mail.</p>
          <br />
          <p>Bons estudos!</p>
        `,
        attachments: [
          {
            filename: 'Alfabetizacao-Magica.pdf',
            content: pdfBuffer,
          },
        ],
      });

      console.log(`E-mail enviado com sucesso para o pagamento: ${id}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error("Erro no Webhook:", error.message);
    // Retornamos 200 para o Mercado Pago não ficar tentando reenviar infinitamente
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}