import { NextResponse } from "next/server";

type PointOfInteraction = {
  type?: string;
  transaction_data?: {
    qr_code?: string;
    qr_code_base64?: string;
    ticket_url?: string;
  };
};

type ProcessOrderResult = {
  id: string;
  status?: string;
  status_detail?: string;
  point_of_interaction?: PointOfInteraction;
};

type PaymentsSearchResult = {
  results?: {
    id?: string;
    status?: string;
    status_detail?: string;
    payment_method_id?: string;
    point_of_interaction?: PointOfInteraction;
  }[];
};

type ProcessPaymentResponse = {
  id: string;
  status: string;
  status_detail?: string;
  payment_method_id?: string;
  order_id: string;
  point_of_interaction?: PointOfInteraction;
};

type ProcessPaymentRequest = {
  orderId?: string;
};

export async function POST(request: Request) {
  try {
    const body: ProcessPaymentRequest = await request.json();
    const orderId = body.orderId?.trim();
    if (!orderId) {
      return NextResponse.json({ error: "ID da order inválido." }, { status: 400 });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Configuração do Mercado Pago inválida." }, { status: 500 });
    }

    const processOrderResponse = await fetch(`https://api.mercadopago.com/v1/orders/${orderId}/process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `order_process_${orderId}_${Date.now()}`
      },
      body: JSON.stringify({})
    });

    if (!processOrderResponse.ok) {
      const errorBody = await processOrderResponse.json().catch(() => ({}));
      return NextResponse.json({
        error: "Erro ao processar a order.",
        details: errorBody
      }, { status: processOrderResponse.status });
    }

    const processResult: ProcessOrderResult = await processOrderResponse.json();

    const paymentsSearchResponse = await fetch(`https://api.mercadopago.com/v1/payments/search?order.id=${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const paymentsResult: PaymentsSearchResult = paymentsSearchResponse.ok
      ? await paymentsSearchResponse.json()
      : {};

    const firstPayment = paymentsResult.results?.[0];

    const response: ProcessPaymentResponse = {
      id: firstPayment?.id ?? processResult.id,
      status: firstPayment?.status ?? processResult.status ?? "pending",
      status_detail: firstPayment?.status_detail ?? processResult.status_detail,
      payment_method_id: firstPayment?.payment_method_id ?? "pix",
      order_id: orderId,
      point_of_interaction: firstPayment?.point_of_interaction ?? processResult.point_of_interaction,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar pagamento.", details: message },
      { status: 500 }
    );
  }
}
