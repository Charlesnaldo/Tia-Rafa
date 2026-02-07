import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { preferenceId, ...formData } = body; // Extract preferenceId and rest of formData
    
    if (!preferenceId) {
        return NextResponse.json({ error: "Preference ID is missing." }, { status: 400 });
    }

    const preferenceClient = new Preference(client);
    const preferenceDetails = await preferenceClient.get({ id: preferenceId });

    if (!preferenceDetails || !preferenceDetails.items || preferenceDetails.items.length === 0) {
        return NextResponse.json({ error: "Preference details not found or invalid." }, { status: 404 });
    }

    const expectedAmount = preferenceDetails.items[0].unit_price; // Assuming single item per preference
    const transactionAmountFromClient = formData.transaction_amount;

    if (expectedAmount !== transactionAmountFromClient) {
        console.warn(`Price mismatch: Expected ${expectedAmount}, received ${transactionAmountFromClient} from client for preference ${preferenceId}`);
        // This is a critical security check. Reject if amounts don't match.
        return NextResponse.json({ error: "Transaction amount mismatch. Possible tampering detected." }, { status: 403 });
    }

    const payment = new Payment(client);
    
    const result = await payment.create({
      body: {
        transaction_amount: expectedAmount, // Use the server-validated amount
        token: formData.token,
        description: formData.description,
        installments: formData.installments,
        payment_method_id: formData.payment_method_id,
        payer: {
          email: formData.payer.email,
          first_name: formData.payer.first_name,
          last_name: formData.payer.last_name,
          identification: {
            type: formData.payer.identification.type,
            number: formData.payer.identification.number,
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
    console.error("ERRO COMPLETO MP (Process Payment):", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao processar o pagamento. Por favor, tente novamente." },
      { status: 500 }
    );
  }
}
