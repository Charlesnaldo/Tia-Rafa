import { NextResponse } from "next/server";

type ProcessPaymentCartItem = {
  id: string;
  quantity?: number;
};

type ProcessPaymentCustomerInfo = {
  email?: string;
  nome?: string;
  telefone?: string;
  cpf?: string;
};

type ProcessPaymentRequest = {
  cartItems?: ProcessPaymentCartItem[];
  cartTotal?: number;
  customerInfo?: ProcessPaymentCustomerInfo;
  orderId?: string;
  payment_method_id?: string;
  transaction_amount?: number | string;
  description?: string;
  payer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type?: string;
      number?: string;
    };
  };
  token?: string;
  issuer_id?: string;
  installments?: number | string;
};

type PaymentData = {
  transaction_amount: number;
  description: string;
  payment_method_id?: string;
  payer: {
    email?: string;
    first_name: string;
    last_name: string;
    identification?: {
      type?: string;
      number?: string;
    };
  };
  token?: string;
  issuer_id?: string;
  installments?: number;
  external_reference?: string;
  metadata?: Record<string, string>;
};

export async function POST(request: Request) {
  try {
    const body: ProcessPaymentRequest = await request.json();
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

    const cartItemsPayload = Array.isArray(body.cartItems) ? body.cartItems : [];
    const productIds = cartItemsPayload
      .map((item) => (item?.id ? item.id : ""))
      .filter(Boolean);

    const clientCartTotal = typeof body.cartTotal === "number" && Number.isFinite(body.cartTotal) ? body.cartTotal : 0;
    const customerInfo = body.customerInfo || {};
    const payerEmail = customerInfo.email || body.payer?.email || orderData.payer?.email;
    const payerPhone = customerInfo.telefone || "";
    const payerCpf =
      customerInfo.cpf ||
      body.payer?.identification?.number ||
      orderData.payer?.identification?.number ||
      "";
    const payerFirstName = customerInfo.nome || body.payer?.first_name || orderData.payer?.first_name || "Cliente";
    const payerLastName = body.payer?.last_name || orderData.payer?.last_name || "Tia Rafaela";

    const expectedAmount = Number(orderData.total_amount ?? orderData.transactions?.[0]?.amount ?? 0);
    const parsedTransactionAmount = Number(body.transaction_amount ?? orderData.total_amount ?? 0);
    const transactionAmount = Number.isFinite(parsedTransactionAmount) ? parsedTransactionAmount : expectedAmount;

    if (!Number.isFinite(parsedTransactionAmount)) {
      console.warn("[MP PROCESS] transaction_amount inválido ou ausente, usando total da order", expectedAmount);
    }

    if (Math.abs(expectedAmount - transactionAmount) > 0.5) {
      console.warn(`[MP WARN] Diferença de preço detectada: Esperado ${expectedAmount}, Recebido ${transactionAmount}`);
    }

    const paymentData: PaymentData = {
      transaction_amount: transactionAmount,
      description: body.description || orderData.description || "Compra em Tia Rafaela",
      payment_method_id: body.payment_method_id,
      payer: {
        email: payerEmail,
        first_name: payerFirstName,
        last_name: payerLastName,
      }
    };

    if (body.payer?.identification) {
      paymentData.payer.identification = body.payer.identification;
    } else if (orderData.payer?.identification) {
      paymentData.payer.identification = orderData.payer.identification;
    }

    if (body.payment_method_id === 'pix') {
      console.log("[MP PROCESS] Processando pagamento PIX");
    } else {
      if (body.token) paymentData.token = body.token;
      if (body.issuer_id) paymentData.issuer_id = body.issuer_id;
      if (body.installments) paymentData.installments = Number(body.installments);
      console.log("[MP PROCESS] Processando pagamento com cartão");
    }

    if (orderData.external_reference) {
      paymentData.external_reference = orderData.external_reference;
    }

    const orderAmountString = orderData.total_amount ?? (expectedAmount ? expectedAmount.toFixed(2) : "0");
    const cartTotalString = clientCartTotal > 0 ? (clientCartTotal / 100).toFixed(2) : orderAmountString;
    const metadataExtras: Record<string, string> = {
      id_produtos: JSON.stringify(productIds),
      cart_total: cartTotalString,
    };

    if (payerEmail) metadataExtras.email_comprador = payerEmail;
    if (payerPhone) metadataExtras.telefone_comprador = payerPhone;
    if (payerCpf) metadataExtras.cpf_comprador = payerCpf;

    paymentData.metadata = {
      order_id: orderId,
      ...(orderData.metadata || {}),
      ...metadataExtras,
    };

    console.log("[MP PROCESS] Criando pagamento...");

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

    const response: Record<string, any> = {
      id: paymentResult.id,
      status: paymentResult.status,
      status_detail: paymentResult.status_detail,
      payment_method_id: paymentResult.payment_method_id,
      order_id: orderId
    };

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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("ERRO DETALHADO NO BACKEND (Process Payment):");
    console.error("- Mensagem:", errorMessage);
    console.error("- Stack:", error instanceof Error ? error.stack : "sem stack");

    return NextResponse.json(
      {
        error: "Erro interno no servidor ao processar pagamento.",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
