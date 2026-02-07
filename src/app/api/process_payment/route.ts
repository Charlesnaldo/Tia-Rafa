import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { preferenceId, ...formData } = body;

    console.log("BACKEND: Recebido Preference ID:", preferenceId);

    if (!preferenceId || preferenceId === "undefined") {
      console.error("BACKEND ERROR: Preference ID está ausente ou é a string 'undefined'");
      return NextResponse.json({ error: "Preference ID inválido ou ausente." }, { status: 400 });
    }

    const preferenceClient = new Preference(client);
    const preferenceDetails = await preferenceClient.get(preferenceId);

    if (!preferenceDetails || !preferenceDetails.items || preferenceDetails.items.length === 0) {
      console.error("BACKEND ERROR: Detalhes da preferência não encontrados para o ID:", preferenceId);
      return NextResponse.json({ error: "Detalhes da compra não encontrados no Mercado Pago." }, { status: 404 });
    }

    // Sum up items to get the total expected amount
    let expectedAmount = 0;
    if (preferenceDetails.items) {
      for (const item of preferenceDetails.items) {
        expectedAmount += Number(item.unit_price || 0) * Number(item.quantity || 1);
      }
    }

    // Arredondar para 2 casas decimais para evitar erros de ponto flutuante
    expectedAmount = Math.round(expectedAmount * 100) / 100;
    const transactionAmountFromClient = Math.round(Number(formData.transaction_amount) * 100) / 100;

    console.log(`Validando valores: Esperado ${expectedAmount}, Recebido ${transactionAmountFromClient}`);

    if (Math.abs(expectedAmount - transactionAmountFromClient) > 0.1) {
      console.warn(`Price mismatch: Expected ${expectedAmount}, received ${transactionAmountFromClient}`);
      return NextResponse.json({ error: "Transaction amount mismatch." }, { status: 403 });
    }

    const payment = new Payment(client);

    // Estrutura do pagamento otimizada
    const paymentBody: any = {
      transaction_amount: transactionAmountFromClient,
      token: formData.token,
      description: formData.description || "Compra em Tia Rafaela",
      installments: Number(formData.installments),
      payment_method_id: formData.payment_method_id,
      issuer_id: formData.issuer_id,
      payer: {
        email: formData.payer.email,
        identification: formData.payer.identification,
      },
    };

    // Adiciona nomes se disponíveis
    if (formData.payer.first_name) {
      paymentBody.payer.first_name = formData.payer.first_name;
      paymentBody.payer.last_name = formData.payer.last_name;
    }

    const result = await payment.create({ body: paymentBody });

    return NextResponse.json({
      status: result.status,
      status_detail: result.status_detail,
      id: result.id,
    });

  } catch (error: any) {
    console.error("ERRO DETALHADO NO BACKEND (Process Payment):");
    console.error("- Mensagem:", error.message);
    if (error.cause) {
      console.error("- Causa:", JSON.stringify(error.cause, null, 2));
    }
    // Se o erro vier da API do Mercado Pago, ele geralmente tem um campo 'body' ou 'api_response'
    if (error.api_response) {
      console.error("- Resposta da API MP:", JSON.stringify(error.api_response, null, 2));
    }

    return NextResponse.json(
      {
        error: "Erro interno no servidor ao processar pagamento.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
