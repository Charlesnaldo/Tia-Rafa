import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cartItems, emailCliente, nomeCliente, cpfCliente } = body;

    if (!emailCliente || !emailRegex.test(emailCliente)) {
      return NextResponse.json({ error: "E-mail do cliente invalido." }, { status: 400 });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Carrinho de compras vazio ou invalido." }, { status: 400 });
    }

    if (!cpfCliente || cpfCliente.replace(/\D/g, "").length < 11) {
      return NextResponse.json({ error: "CPF e obrigatorio para pagamentos." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const ids = Array.from(new Set(cartItems.map((item: { id: string }) => item.id).filter(Boolean)));
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, nome, preco_cents, is_active")
      .in("id", ids)
      .eq("is_active", true);

    if (productsError) {
      return NextResponse.json({ error: "Falha ao validar produtos no Supabase." }, { status: 500 });
    }

    const productsById = new Map((products || []).map((product) => [product.id, product]));

    let totalAmount = 0;
    for (const item of cartItems) {
      const produto = productsById.get(item.id);
      if (!produto) {
        return NextResponse.json({ error: `Produto com ID ${item.id} nao encontrado.` }, { status: 404 });
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ error: `Quantidade invalida para o produto ${produto.nome || item.id}.` }, { status: 400 });
      }
      totalAmount += (Number(produto.preco_cents || 0) / 100) * item.quantity;
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Configuracao do Mercado Pago invalida." }, { status: 500 });
    }

    const finalAmount = Number(totalAmount.toFixed(2));
    const amountString = finalAmount.toFixed(2);
    const orderBody = {
      type: "online",
      processing_mode: "manual",
      total_amount: amountString,
      external_reference: `order_${Date.now()}`,
      description: "Compra - Tia Rafaela",
      transactions: {
        payments: [
          {
            amount: amountString,
            payment_method: {
              id: "pix",
              type: "bank_transfer",
            },
          },
        ],
      },
      payer: {
        email: emailCliente,
        first_name: nomeCliente || "Cliente",
        identification: {
          type: "CPF",
          number: cpfCliente.replace(/\D/g, ""),
        },
      },
    };

    const response = await fetch("https://api.mercadopago.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Idempotency-Key": `idemp_${Date.now()}`,
      },
      body: JSON.stringify(orderBody),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Erro ao criar order no Mercado Pago.",
          details: data,
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      orderId: data.id,
      totalAmount: finalAmount,
      externalReference: orderBody.external_reference,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao iniciar o checkout. Tente novamente.", details: errorMessage },
      { status: 500 }
    );
  }
}
