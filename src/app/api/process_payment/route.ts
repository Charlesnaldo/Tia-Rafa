import { NextResponse } from "next/server";
import { PRODUTOS_LISTA } from "@/constants/produtos";

type PointOfInteraction = {
  type?: string;
  transaction_data?: {
    qr_code?: string;
    qr_code_base64?: string;
    ticket_url?: string;
  };
};

type ProcessPaymentRequest = {
  cartItems?: { id: string; quantity: number }[];
  emailCliente?: string;
  nomeCliente?: string;
  cpfCliente?: string;
  paymentMethod?: "pix" | "credit_card";
};

type MercadoPagoCreatePaymentResponse = {
  id: string;
  status?: string;
  status_detail?: string;
  payment_method_id?: string;
  point_of_interaction?: PointOfInteraction;
};

type MercadoPagoCreatePreferenceResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isPublicHost = (hostname: string) =>
  hostname !== "localhost"
  && hostname !== "127.0.0.1"
  && hostname !== "::1";

export async function POST(request: Request) {
  try {
    const body: ProcessPaymentRequest = await request.json();
    const cartItems = body.cartItems ?? [];
    const emailCliente = body.emailCliente?.trim() ?? "";
    const nomeCliente = body.nomeCliente?.trim() ?? "Cliente";
    const cpfLimpo = (body.cpfCliente ?? "").replace(/\D/g, "");
    const paymentMethod = body.paymentMethod === "credit_card" ? "credit_card" : "pix";

    if (!emailRegex.test(emailCliente)) {
      return NextResponse.json({ error: "E-mail do cliente invalido." }, { status: 400 });
    }
    if (cpfLimpo.length !== 11) {
      return NextResponse.json({ error: "CPF invalido." }, { status: 400 });
    }
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio ou invalido." }, { status: 400 });
    }

    let totalAmount = 0;
    const idsProdutos: string[] = [];
    for (const item of cartItems) {
      const produto = PRODUTOS_LISTA[item.id];
      if (!produto) {
        return NextResponse.json({ error: `Produto com ID ${item.id} nao encontrado.` }, { status: 404 });
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ error: `Quantidade invalida para o produto ${item.id}.` }, { status: 400 });
      }
      totalAmount += (produto.preco / 100) * item.quantity;
      idsProdutos.push(item.id);
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Configuracao do Mercado Pago invalida." }, { status: 500 });
    }

    const payer = {
      email: emailCliente,
      first_name: nomeCliente,
      identification: {
        type: "CPF",
        number: cpfLimpo,
      },
    };
    const metadata = {
      email_comprador: emailCliente,
      id_produtos: JSON.stringify(idsProdutos),
    };
    const baseUrl = process.env.NEXT_PUBLIC_URL?.trim();
    let notificationUrl: string | undefined;
    if (baseUrl) {
      try {
        const parsed = new URL(baseUrl);
        if ((parsed.protocol === "https:" || parsed.protocol === "http:") && isPublicHost(parsed.hostname)) {
          notificationUrl = `${parsed.origin}/api/webhook/mercadopago`;
        }
      } catch {
        notificationUrl = undefined;
      }
    }

    if (paymentMethod === "credit_card") {
      const requestOrigin = new URL(request.url).origin;
      const preferenceBody = {
        items: cartItems.map((item) => {
          const produto = PRODUTOS_LISTA[item.id];
          return {
            id: item.id,
            title: produto.nome,
            quantity: item.quantity,
            currency_id: "BRL",
            unit_price: Number((produto.preco / 100).toFixed(2)),
          };
        }),
        payer,
        external_reference: `card_${Date.now()}`,
        metadata,
        ...(notificationUrl ? { notification_url: notificationUrl } : {}),
        back_urls: {
          success: `${requestOrigin}/sucesso`,
          pending: `${requestOrigin}/sucesso`,
          failure: `${requestOrigin}/checkout`,
        },
      };

      const preferenceResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        },
        body: JSON.stringify(preferenceBody),
      });

      const preferenceData = await preferenceResponse.json();
      if (!preferenceResponse.ok) {
        return NextResponse.json(
          { error: "Erro ao iniciar checkout de cartao.", details: preferenceData },
          { status: preferenceResponse.status }
        );
      }

      const typedPreferenceData = preferenceData as MercadoPagoCreatePreferenceResponse;
      const checkoutUrl = typedPreferenceData.init_point ?? typedPreferenceData.sandbox_init_point;
      if (!checkoutUrl) {
        return NextResponse.json({ error: "Checkout de cartao sem URL de redirecionamento." }, { status: 500 });
      }

      return NextResponse.json({
        id: typedPreferenceData.id,
        status: "pending",
        payment_method_id: "credit_card",
        checkout_url: checkoutUrl,
      });
    }

    const createPaymentBody = {
      transaction_amount: Number(totalAmount.toFixed(2)),
      description: "Compra - Tia Rafaela",
      payment_method_id: "pix",
      payer,
      metadata,
      ...(notificationUrl ? { notification_url: notificationUrl } : {}),
    };

    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `pix_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      },
      body: JSON.stringify(createPaymentBody),
    });

    const paymentData = await mpResponse.json();
    if (!mpResponse.ok) {
      return NextResponse.json(
        { error: "Erro ao gerar o Pix.", details: paymentData },
        { status: mpResponse.status }
      );
    }

    const typedPaymentData = paymentData as MercadoPagoCreatePaymentResponse;

    return NextResponse.json({
      id: typedPaymentData.id,
      status: typedPaymentData.status ?? "pending",
      status_detail: typedPaymentData.status_detail,
      payment_method_id: typedPaymentData.payment_method_id ?? "pix",
      order_id: String(typedPaymentData.id),
      point_of_interaction: typedPaymentData.point_of_interaction,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar pagamento.", details: message },
      { status: 500 }
    );
  }
}
