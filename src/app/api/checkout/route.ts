import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { PRODUTOS_LISTA } from "@/constants/produtos";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, emailCliente, endereco } = body;

    const produto = PRODUTOS_LISTA[id];
    if (!produto) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    const baseUrl = (process.env.NEXT_PUBLIC_URL || "http://localhost:3000").replace(/\/$/, "");
    const valorNumerico = produto.preco / 100;

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: produto.id,
            title: produto.nome,
            unit_price: valorNumerico,
            quantity: 1,
            currency_id: "BRL",
          },
        ],
        payer: {
          email: emailCliente,
        },
        metadata: {
          id_produto: id,
          email_comprador: emailCliente,
          tipo_produto: produto.tipo,
          ...(endereco && { endereco_entrega: JSON.stringify(endereco) })
        },
        back_urls: {
          success: `${baseUrl}/sucesso`,
          failure: `${baseUrl}/erro`,
          pending: `${baseUrl}/pendente`,
        },
        // --- ESTA É A LINHA QUE CONECTA COM O SEU WEBHOOK ---
        notification_url: `${baseUrl}/api/webhook/mercadopago`,
        // ----------------------------------------------------
      },
    });

    return NextResponse.json({ url: result.init_point });

  } catch (error) {
    console.error("ERRO COMPLETO MP:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}