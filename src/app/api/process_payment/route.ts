import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const payment = new Payment(client);
    
    const result = await payment.create({
      body: {
        transaction_amount: body.transaction_amount,
        token: body.token,
        description: body.description,
        installments: body.installments,
        payment_method_id: body.payment_method_id,
        payer: {
          email: body.payer.email,
          first_name: body.payer.first_name,
          last_name: body.payer.last_name,
          identification: {
            type: body.payer.identification.type,
            number: body.payer.identification.number,
          },
        },
      },
    });

    return NextResponse.json({
      status: result.status,
      status_detail: result.status_detail,
      id: result.id,
    });

  } catch (error) {
    console.error("ERRO COMPLETO MP:", error);
    // It's important to send a response that the frontend can understand.
    // The Mercado Pago SDK might throw errors with a 'cause' property.
    const errorMessage = (error as any)?.cause?.message || (error as Error).message || "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
