import { NextResponse } from "next/server";
import { PRODUTOS_LISTA } from "@/constants/produtos";

// Regex for basic email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cartItems, emailCliente, nomeCliente, cpfCliente } = body;

    if (!emailCliente || !emailRegex.test(emailCliente)) {
      return NextResponse.json({ error: "E-mail do cliente inválido." }, { status: 400 });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Carrinho de compras vazio ou inválido." }, { status: 400 });
    }

    if (!cpfCliente || cpfCliente.replace(/\D/g, '').length < 11) {
      return NextResponse.json({ error: "CPF é obrigatório para pagamentos." }, { status: 400 });
    }

    // Validar produtos e calcular total
    let totalAmount = 0;

    for (const item of cartItems) {
      const produto = PRODUTOS_LISTA[item.id];
      if (!produto) {
        return NextResponse.json({ error: `Produto com ID ${item.id} não encontrado.` }, { status: 404 });
      }
      if (item.quantity <= 0) {
        return NextResponse.json({ error: `Quantidade inválida para o produto ${produto.nome}.` }, { status: 400 });
      }

      const valorNumerico = produto.preco / 100; // Assuming preco is in cents

      totalAmount += valorNumerico * item.quantity;
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("[MP ERROR] Access Token não configurado");
      return NextResponse.json({ error: "Configuração do Mercado Pago inválida." }, { status: 500 });
    }

    // Criar Order usando a nova API (total_amount/transações aceitam strings)
    const finalAmount = Number(totalAmount.toFixed(2));

    const amountString = finalAmount.toFixed(2);

    const orderBody = {
      type: "online",
      total_amount: amountString,
      external_reference: `order_${Date.now()}`,
      description: `Compra - Tia Rafaela`,
      transactions: {
        payments: [
          {
            amount: amountString,
            payment_method: {
              id: "pix",
              type: "bank_transfer"
            }
          }
        ]
      },
      payer: {
        email: emailCliente,
        first_name: nomeCliente || "Cliente",
        identification: {
          type: "CPF",
          number: cpfCliente.replace(/\D/g, '')
        }
      }
    };

    console.log("[MP CHECKOUT] Criando order com total:", finalAmount);
    console.log("[MP CHECKOUT] Body:", JSON.stringify(orderBody, null, 2));

    // Fazer requisição para criar a order
    const response = await fetch("https://api.mercadopago.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-Idempotency-Key": `idemp_${Date.now()}`
      },
      body: JSON.stringify(orderBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[MP ERROR] Status:", response.status);
      console.error("[MP ERROR] Detalhes:", JSON.stringify(data, null, 2));
      return NextResponse.json({
        error: "Erro ao criar order no Mercado Pago.",
        details: data,
        status: response.status
      }, { status: response.status });
    }

    console.log("[MP CHECKOUT] Order criada com sucesso:", data.id);

    // Retornar o ID da order e informações adicionais
    return NextResponse.json({
      orderId: data.id,
      totalAmount: finalAmount,
      externalReference: orderBody.external_reference
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("ERRO COMPLETO MP (Checkout):", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao iniciar o checkout. Por favor, tente novamente.", details: errorMessage },
      { status: 500 }
    );
  }
}
