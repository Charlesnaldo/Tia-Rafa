import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { PRODUTOS_LISTA } from "@/constants/produtos";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

// Regex for basic email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cartItems, emailCliente, nomeCliente, telefoneCliente, cpfCliente } = body;

    if (!emailCliente || !emailRegex.test(emailCliente)) {
      return NextResponse.json({ error: "E-mail do cliente inválido." }, { status: 400 });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Carrinho de compras vazio ou inválido." }, { status: 400 });
    }

    const processedItems: {
      id: string;
      title: string;
      unit_price: number;
      quantity: number;
      currency_id: string;
    }[] = [];
    let totalAmount = 0;
    const metadataProductIds: string[] = [];

    for (const item of cartItems) {
      const produto = PRODUTOS_LISTA[item.id];
      if (!produto) {
        return NextResponse.json({ error: `Produto com ID ${item.id} não encontrado.` }, { status: 404 });
      }
      if (item.quantity <= 0) {
        return NextResponse.json({ error: `Quantidade inválida para o produto ${produto.nome}.` }, { status: 400 });
      }

      const valorNumerico = produto.preco / 100; // Assuming preco is in cents

      processedItems.push({
        id: produto.id,
        title: produto.nome,
        unit_price: valorNumerico,
        quantity: item.quantity,
        currency_id: "BRL",
      });
      totalAmount += valorNumerico * item.quantity;
      metadataProductIds.push(produto.id);
    }

    const baseUrl = (process.env.NEXT_PUBLIC_URL || "http://localhost:3000").replace(/\/$/, "");

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: processedItems, // Use the processed multiple items
        payer: {
          email: emailCliente,
          name: nomeCliente ? nomeCliente.split(' ')[0] : "Cliente",
          surname: nomeCliente ? (nomeCliente.split(' ').slice(1).join(' ') || "Checkout") : "Checkout",
          identification: {
            type: 'CPF',
            number: cpfCliente ? cpfCliente.replace(/\D/g, '') : '',
          },
          phone: {
            area_code: '',
            number: telefoneCliente ? telefoneCliente.replace(/\D/g, '') : '',
          }
        },
        metadata: {
          id_produtos: JSON.stringify(metadataProductIds), // Store array of product IDs
          email_comprador: emailCliente,
          // Removed tipo_produto and single id_produto as they are now multi-item
          // endereco_entrega (if needed, would be handled here based on body)
        },
        back_urls: {
          success: `${baseUrl}/sucesso`,
          failure: `${baseUrl}/erro`,
          pending: `${baseUrl}/pendente`,
        },
        notification_url: `${baseUrl}/api/webhook/mercadopago`,
        purpose: 'wallet_purchase',
      },
    });

    return NextResponse.json({ preferenceId: result.id });

  } catch (error) {
    console.error("ERRO COMPLETO MP (Checkout):", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao iniciar o checkout. Por favor, tente novamente." },
      { status: 500 }
    );
  }
}