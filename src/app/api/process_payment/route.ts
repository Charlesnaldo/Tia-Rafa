import { NextResponse } from "next/server";

type ProcessPaymentCartItem = {
  id: string;
  quantity?: number;
};

type PointOfInteraction = {
  type?: string;
  transaction_data?: {
    qr_code?: string;
    qr_code_base64?: string;
    ticket_url?: string;
  };
};

type MercadoPagoPaymentResult = {
  id: string;
  status: string;
  status_detail?: string;
  payment_method_id?: string;
  point_of_interaction?: PointOfInteraction;
};

type ProcessPaymentResponse = {
  id: string;
  status: string;
  status_detail?: string;
  payment_method_id?: string;
  order_id: string;
  point_of_interaction?: PointOfInteraction;
};

type ProcessedOrderTransactionPayment = {
  id: string;
  status: string;
  status_detail?: string;
  payment_method_id?: string;
  payment_method?: {
    id?: string;
  };
  point_of_interaction?: PointOfInteraction;
};

type ProcessedOrderTransaction = {
  payments?: ProcessedOrderTransactionPayment[];
};

type ProcessOrderResult = {
  id: string;
  status?: string;
  status_detail?: string;
  transactions?: ProcessedOrderTransaction[];
  point_of_interaction?: PointOfInteraction;
};

type ProcessPaymentRequest = {
  cartItems?: ProcessPaymentCartItem[];
  cartTotal?: number;
  customerInfo?: {
    email?: string;
    nome?: string;
    telefone?: string;
    cpf?: string;
  };
  orderId?: string;
  payment_method_id?: string;
};

export async function POST(request: Request) {
  try {
    const body: ProcessPaymentRequest = await request.json();
    const orderId = String(body.orderId || "").trim();
    console.log("[MP PROCESS] orderId recebido no endpoint:", orderId);

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

    const processOrderResponse = await fetch(`https://api.mercadopago.com/v1/orders/${orderId}/process`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `order_process_${orderId}_${Date.now()}`
      },
      body: JSON.stringify({})
    });

    const processResult: ProcessOrderResult = await processOrderResponse.json();

    if (!processOrderResponse.ok) {
      console.error("[MP ERROR] Falha ao processar a order:", processResult);
      return NextResponse.json({
        error: "Erro ao processar a order.",
        details: processResult
      }, { status: processOrderResponse.status });
    }

    const payments = processResult.transactions?.[0]?.payments ?? [];
    const transaction = payments[0];

    const paymentId = transaction?.id ?? processResult.id;
    const status = transaction?.status ?? processResult.status ?? "pending";
    const paymentMethodId = transaction?.payment_method_id ?? transaction?.payment_method?.id;
    let pointOfInteraction = transaction?.point_of_interaction ?? processResult.point_of_interaction;

    const fetchOrderWithPayments = async () => {
      const response = await fetch(`https://api.mercadopago.com/v1/orders/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn("[MP PROCESS] Falha ao reconsultar order após processar:", errorData);
        return null;
      }
      return response.json();
    };

    if (!pointOfInteraction) {
      const refreshedOrder = await fetchOrderWithPayments();
      const paymentFromOrder =
        refreshedOrder?.transactions?.[0]?.payments?.[0];
      if (paymentFromOrder) {
        pointOfInteraction = paymentFromOrder.point_of_interaction;
      }
    }

    if (!pointOfInteraction) {
      if (paymentId) {
        console.log("[MP PROCESS] Buscando detalhes do pagamento para QR:", paymentId);
        const paymentDetailsResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (paymentDetailsResponse.ok) {
          const paymentDetails = await paymentDetailsResponse.json();
          pointOfInteraction = paymentDetails.point_of_interaction;
        } else {
          const paymentDetailsError = await paymentDetailsResponse.json().catch(() => ({}));
          console.warn("[MP PROCESS] Falha ao buscar ponto de interação:", paymentDetailsError);
        }
      }

      if (!pointOfInteraction) {
        console.log("[MP PROCESS] Buscando payment associado à order para QR");
        const paymentsSearchResponse = await fetch(`https://api.mercadopago.com/v1/payments/search?order.id=${orderId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (paymentsSearchResponse.ok) {
          const paymentsSearchResult = await paymentsSearchResponse.json();
          const firstPayment = paymentsSearchResult.results?.[0];
          if (firstPayment) {
            pointOfInteraction = firstPayment.point_of_interaction;
          }
        } else {
          const searchError = await paymentsSearchResponse.json().catch(() => ({}));
          console.warn("[MP PROCESS] Falha ao buscar pagamentos da order:", searchError);
        }
      }
    }

    console.log("[MP PROCESS] Order processada com sucesso:", paymentId);
    console.log("[MP PROCESS] Status:", status);

    const response: ProcessPaymentResponse = {
      id: paymentId,
      status,
      status_detail: transaction?.status_detail ?? processResult.status_detail,
      payment_method_id: paymentMethodId,
      order_id: orderId,
      point_of_interaction: pointOfInteraction
    };

    if (paymentMethodId === 'pix' && pointOfInteraction) {
      console.log("[MP PROCESS] PIX QR Code pronto", paymentId);
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
