import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

export const dynamic = "force-dynamic";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json({ error: "ID do pagamento nao informado." }, { status: 400 });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Configuracao do Mercado Pago invalida." }, { status: 500 });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    return NextResponse.json({
      id: String(paymentData.id),
      status: paymentData.status || "pending",
      payment_method_id: paymentData.payment_method_id || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Falha ao consultar pagamento.", details: message }, { status: 500 });
  }
}
