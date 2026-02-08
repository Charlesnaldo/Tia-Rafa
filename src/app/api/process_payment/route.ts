import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = String(body.orderId || "").trim();

    console.log(`[MP PROCESS] Iniciando processamento da Order: "${orderId}"`);
    console.log(`[MP PROCESS] Método de pagamento:`, body.payment_method_id);

    if (!orderId || orderId === "undefined" || orderId === "null") {
      return NextResponse.json({ error: "ID da order inválido." }, { status: 400 });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("[MP ERROR] Access Token não configurado");
      return NextResponse.json({ error: "Configuração do Mercado Pago inválida." }, { status: 500 });
    }

    // 1. Buscar detalhes da order para validação
    console.log("[MP PROCESS] Buscando detalhes da order...");
    const orderResponse = await fetch(`https://api.mercadopago.com/v1/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error("[MP ERROR] Falha ao buscar order:", errorData);
      return NextResponse.json({
        error: "Order não encontrada ou expirada.",
        details: errorData
      }, { status: 404 });
    }

    const orderData = await orderResponse.json();
    console.log("[MP PROCESS] Order encontrada. Status:", orderData.status);

    const expectedAmount = parseFloat(orderData.total_amount);
    const transactionAmount = parseFloat(body.transaction_amount);

    // Validação de segurança básica de preço
    if (Math.abs(expectedAmount - transactionAmount) > 0.5) {
      console.warn(`[MP WARN] Diferença de preço detectada: Esperado ${expectedAmount}, Recebido ${transactionAmount}`);
    }

    // 2. Preparar dados do pagamento
    const paymentData: any = {
      transaction_amount: transactionAmount,
      description: body.description || orderData.description || "Compra em Tia Rafaela",
      payment_method_id: body.payment_method_id,
      payer: {
        email: body.payer?.email || orderData.payer?.email,
        first_name: body.payer?.first_name || orderData.payer?.first_name || "Cliente",
        last_name: body.payer?.last_name || orderData.payer?.last_name || "Tia Rafaela",
      }
    };

    // PIX e outros métodos de transferência bancária exigem identificação (CPF)
    if (body.payer?.identification) {
      paymentData.payer.identification = body.payer.identification;
    } else if (orderData.payer?.identification) {
      paymentData.payer.identification = orderData.payer.identification;
    }

    // Configurações específicas por método de pagamento
    if (body.payment_method_id === 'pix') {
      // PIX não precisa de token nem parcelas
      console.log("[MP PROCESS] Processando pagamento PIX");
    } else {
      // Cartão de crédito/débito precisa de token e pode ter parcelas
      if (body.token) paymentData.token = body.token;
      if (body.issuer_id) paymentData.issuer_id = body.issuer_id;
      if (body.installments) paymentData.installments = Number(body.installments);
      console.log("[MP PROCESS] Processando pagamento com cartão");
    }

    // Adicionar external_reference da order
    if (orderData.external_reference) {
      paymentData.external_reference = orderData.external_reference;
    }

    // Adicionar metadata
    paymentData.metadata = {
      order_id: orderId,
      ...(orderData.metadata || {})
    };

    console.log("[MP PROCESS] Criando pagamento...");

    // 3. Criar o pagamento
    const paymentResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `payment_${orderId}_${Date.now()}`
      },
      body: JSON.stringify(paymentData)
    });

    const paymentResult = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error("[MP ERROR] Erro ao criar pagamento:", paymentResult);
      return NextResponse.json({
        error: "Erro ao processar pagamento.",
        details: paymentResult
      }, { status: paymentResponse.status });
    }

    console.log("[MP PROCESS] Pagamento criado com sucesso:", paymentResult.id);
    console.log("[MP PROCESS] Status:", paymentResult.status);

    // 4. Retornar resposta com informações do pagamento
    const response: any = {
      id: paymentResult.id,
      status: paymentResult.status,
      status_detail: paymentResult.status_detail,
      payment_method_id: paymentResult.payment_method_id,
      order_id: orderId
    };

    // Para PIX, incluir informações do QR Code
    if (paymentResult.payment_method_id === 'pix' && paymentResult.point_of_interaction) {
      response.point_of_interaction = {
        transaction_data: {
          qr_code: paymentResult.point_of_interaction?.transaction_data?.qr_code,
          qr_code_base64: paymentResult.point_of_interaction?.transaction_data?.qr_code_base64,
          ticket_url: paymentResult.point_of_interaction?.transaction_data?.ticket_url
        }
      };
      console.log("[MP PROCESS] PIX QR Code gerado com sucesso");
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("ERRO DETALHADO NO BACKEND (Process Payment):");
    console.error("- Mensagem:", error.message);
    console.error("- Stack:", error.stack);

    return NextResponse.json(
      {
        error: "Erro interno no servidor ao processar pagamento.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
