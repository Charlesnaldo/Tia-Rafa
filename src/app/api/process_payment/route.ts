import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("BACKEND: Payload Recebido:", JSON.stringify(body));

    const { preferenceId, preference_id, ...formData } = body;
    const id = preferenceId || preference_id;

    if (!id || id === "undefined" || id === "null") {
      console.error("BACKEND ERROR: Preference ID inválido:", id);
      return NextResponse.json({
        error: "ID de preferência inválido ou ausente.",
        received: String(id)
      }, { status: 400 });
    }

    const preferenceClient = new Preference(client);
    // Correção Vital: Na v2 o método get espera um OBJETO { preferenceId: id }
    const preferenceDetails = await preferenceClient.get({ preferenceId: String(id) });

    if (!preferenceDetails || !preferenceDetails.items || preferenceDetails.items.length === 0) {
      console.error("BACKEND ERROR: Detalhes da preferência não encontrados para o ID:", id);
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

    // Estrutura do pagamento otimizada para PIX e Cartão
    const paymentBody: any = {
      transaction_amount: transactionAmountFromClient,
      description: formData.description || "Compra em Tia Rafaela",
      payment_method_id: formData.payment_method_id,
      payer: {
        email: formData.payer?.email || "cliente@tiarafaela.com.br",
        first_name: formData.payer?.first_name || "Cliente",
        last_name: formData.payer?.last_name || "Tia Rafaela",
      },
    };

    // O PIX exige identificação (CPF/CNPJ)
    if (formData.payer?.identification) {
      paymentBody.payer.identification = formData.payer.identification;
    } else if (formData.identification) {
      paymentBody.payer.identification = formData.identification;
    }

    // Se no formulário o usuário não preencheu e estamos em Produção, 
    // o Mercado Pago vai exigir o CPF. 
    // Vamos garantir que os installments sejam sempre válidos (mínimo 1)
    paymentBody.installments = formData.installments ? Number(formData.installments) : 1;

    // Apenas adiciona token se for cartão
    if (formData.token) {
      paymentBody.token = formData.token;
    }

    // Apenas adiciona issuer_id se existir
    if (formData.issuer_id) {
      paymentBody.issuer_id = formData.issuer_id;
    }

    console.log("MERCADO PAGO: Tentando criar pagamento com corpo:", JSON.stringify(paymentBody));

    const result = await payment.create({ body: paymentBody });

    return NextResponse.json({
      status: result.status,
      status_detail: result.status_detail,
      id: result.id,
      // Dados extras para PIX (QR Code) se o Brick precisar
      point_of_interaction: result.point_of_interaction
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
