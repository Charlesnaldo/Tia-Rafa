import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getPaymentOwner, matchesPaymentOwner } from "@/lib/payment-owner";

export const dynamic = "force-dynamic";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function GET(request: NextRequest) {
  try {
    const owner = getPaymentOwner(request);
    if (!owner) return NextResponse.json({ error: "Consulta nao autorizada." }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    if (!paymentId || !/^\d{1,30}$/.test(paymentId)) {
      return NextResponse.json({ error: "ID do pagamento nao informado." }, { status: 400 });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Configuracao do Mercado Pago invalida." }, { status: 500 });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });
    if (!matchesPaymentOwner(owner, paymentData.metadata?.payment_status_owner)) {
      return NextResponse.json({ error: "Pagamento indisponivel." }, { status: 404 });
    }

    return NextResponse.json({
      id: String(paymentData.id),
      status: paymentData.status || "pending",
      payment_method_id: paymentData.payment_method_id || null,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error: unknown) {
    console.error("Falha ao consultar pagamento:", error);
    return NextResponse.json({ error: "Pagamento indisponivel." }, { status: 404 });
  }
}
