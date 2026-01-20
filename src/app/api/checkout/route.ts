import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { Resend } from "resend";

// 1. Configurações Iniciais
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || "SEU_ACCESS_TOKEN_AQUI" 
});

const resend = new Resend(process.env.RESEND_API_KEY || "SUA_RESEND_KEY_AQUI");

export async function POST(request: Request) {
  try {
    // 2. Receber dados do Checkout
    const body = await request.json();
    const { id, nome, preco, emailCliente } = body;

    // Verificação de segurança básica
    if (!emailCliente || !nome) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 3. Criar a preferência no Mercado Pago
    const preference = new Preference(client);
    
    // Convertendo o preço de string "27,90" para número 27.90
    const precoNumerico = parseFloat(preco.replace(",", "."));

    const result = await preference.create({
      body: {
        items: [
          {
            id: id,
            title: nome,
            quantity: 1,
            unit_price: precoNumerico,
            currency_id: "BRL",
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/erro`,
        },
        auto_return: "approved",
      },
    });

    // 4. (Opcional) Enviar e-mail de "Processando"
    // Nota: O e-mail com o PDF deve ser enviado no Webhook após a aprovação real.
    // Mas para teste, podemos disparar um e-mail aqui:
    /*
    await resend.emails.send({
      from: "Tia Rafa <contato@seudominio.com>",
      to: emailCliente,
      subject: `Recebemos seu pedido: ${nome}`,
      html: `<p>Olá! Seu pagamento está sendo processado. Assim que aprovado, você receberá o link de download.</p>`
    });
    */

    return NextResponse.json({ init_point: result.init_point });

  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}