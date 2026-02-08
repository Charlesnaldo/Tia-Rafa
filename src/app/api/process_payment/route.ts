import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.preferenceId || body.preference_id || "").trim();

    console.log(`[MP BACKEND] Iniciando processamento do ID: "${id}"`);
    console.log(`[MP BACKEND] Credenciais: Token inicia com "${process.env.MP_ACCESS_TOKEN?.substring(0, 8)}"`);

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ error: "ID de preferência inválido." }, { status: 400 });
    }

    // 1. Buscar detalhes da preferência para validar o valor (Segurança)
    const preferenceClient = new Preference(client);
    let expectedAmount = 0;

    try {
      // Usamos a chave preferenceId conforme exigido pelo SDK v2
      // e fazemos cast para any para o TypeScript aceitar (visto que o tipo PreferenceGetData varia)
      const preferenceDetails: any = await preferenceClient.get({
        preferenceId: id
      } as any);

      console.log(`[MP BACKEND] Preferência encontrada. Detalhes: ${JSON.stringify(preferenceDetails?.items?.[0] || {})}`);

      if (preferenceDetails.items) {
        for (const item of preferenceDetails.items) {
          expectedAmount += Number(item.unit_price || 0) * Number(item.quantity || 1);
        }
      }
      expectedAmount = Math.round(expectedAmount * 100) / 100;
      console.log(`[MP BACKEND] Preferência encontrada. Valor total esperado: ${expectedAmount}`);
    } catch (err: any) {
      console.error("[MP ERROR] Falha ao buscar preferência:", err.message);
      return NextResponse.json({
        error: "ID de compra expirado ou inválido no MP.",
        details: err.message,
        id_received: id
      }, { status: 404 });
    }

    // 2. Criar o Pagamento
    const payment = new Payment(client);
    const transactionAmount = Math.round(Number(body.transaction_amount) * 100) / 100;

    // Validação de segurança básica de preço
    if (Math.abs(expectedAmount - transactionAmount) > 0.5) {
      console.warn(`[MP WARN] Diferença de preço detectada: Esperado ${expectedAmount}, Recebido ${transactionAmount}`);
    }

    const paymentBody: any = {
      transaction_amount: transactionAmount,
      description: body.description || "Compra em Tia Rafaela",
      payment_method_id: body.payment_method_id,
      installments: body.installments ? Number(body.installments) : 1,
      payer: {
        email: body.payer?.email,
        first_name: body.payer?.first_name || "Cliente",
        last_name: body.payer?.last_name || "Tia Rafaela",
      }
    };

    // PIX exige identificação (CPF)
    if (body.payer?.identification) {
      paymentBody.payer.identification = body.payer.identification;
    } else if (body.identification) {
      paymentBody.payer.identification = body.identification;
    }

    // Token é obrigatório apenas para Cartão
    if (body.token) paymentBody.token = body.token;
    if (body.issuer_id) paymentBody.issuer_id = body.issuer_id;

    console.log("[MP BACKEND] Criando pagamento...");
    const result = await payment.create({ body: paymentBody });

    return NextResponse.json({
      status: result.status,
      status_detail: result.status_detail,
      id: result.id,
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
