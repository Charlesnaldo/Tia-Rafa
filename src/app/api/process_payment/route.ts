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
};

type MercadoPagoCreatePaymentResponse = {
  id: string;
  status?: string;
  status_detail?: string;
  payment_method_id?: string;
  point_of_interaction?: PointOfInteraction;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body: ProcessPaymentRequest = await request.json();
    const cartItems = body.cartItems ?? [];
    const emailCliente = body.emailCliente?.trim() ?? "";
    const nomeCliente = body.nomeCliente?.trim() ?? "Cliente";
    const cpfLimpo = (body.cpfCliente ?? "").replace(/\D/g, "");

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

    const createPaymentBody = {
      transaction_amount: Number(totalAmount.toFixed(2)),
      description: "Compra - Tia Rafaela",
      payment_method_id: "pix",
      payer: {
        email: emailCliente,
        first_name: nomeCliente,
        identification: {
          type: "CPF",
          number: cpfLimpo,
        },
      },
      metadata: {
        email_comprador: emailCliente,
        id_produtos: JSON.stringify(idsProdutos),
      },
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
