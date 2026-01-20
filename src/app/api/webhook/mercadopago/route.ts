import { NextResponse } from "next/server";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

// Garante que o Next.js não tente transformar isso em uma página estática
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Inicializa o Resend dentro da função para evitar erro de API Key no build
  const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "payment") {
      // Caminho absoluto para o arquivo na pasta public
      const filePath = path.join(process.cwd(), "public", "alfabetizacao.pdf");
      
      // VERIFICAÇÃO CRUCIAL: Só tenta ler se o arquivo existir
      if (fs.existsSync(filePath)) {
        const pdfBuffer = fs.readFileSync(filePath);

        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: 'charles.naldo@gmail.com',
          subject: 'Seu PDF Chegou! ✨ Alfabetização Mágica',
          html: '<p>O seu pagamento foi aprovado! O material está em anexo.</p>',
          attachments: [
            {
              filename: 'Alfabetizacao-Magica.pdf',
              content: pdfBuffer,
            },
          ],
        });
      } else {
        console.error("Arquivo não encontrado no build/runtime:", filePath);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}