import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Inicialização segura das credenciais
const MP_TOKEN = process.env.MP_ACCESS_TOKEN;

const client = new MercadoPagoConfig({ 
  accessToken: MP_TOKEN || "" 
});

export async function POST(request: Request) {
  try {
    // 1. Validar se o Token existe antes de começar
    if (!MP_TOKEN || MP_TOKEN === "SEU_ACCESS_TOKEN_AQUI") {
      console.error("ERRO: MP_ACCESS_TOKEN não configurado no .env.local");
      return NextResponse.json({ error: "Configuração de servidor incompleta" }, { status: 500 });
    }

    // 2. Receber e Logar os dados brutos
    const body = await request.json();
    console.log("--- PROCESSANDO CHECKOUT ---", body);

    const { id, nomeProduto, preco, emailCliente } = body;

    // 3. Verificação de Campos Obrigatórios
    if (!emailCliente || !nomeProduto || !preco) {
      return NextResponse.json({ 
        error: "Dados incompletos", 
        recebido: { emailCliente, nomeProduto, preco } 
      }, { status: 400 });
    }

    // 4. Tratamento do Preço (Essencial para o Mercado Pago)
    // Converte "27,90" -> 27.90
    const precoNumerico = parseFloat(preco.toString().replace(",", "."));

    // 5. Configuração da URL Base
    // Remove barras extras no final para evitar URLs como http://localhost:3000//sucesso
    const baseUrl = (process.env.NEXT_PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, "");

    // 6. Criar Preferência no Mercado Pago
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: id,
            title: nomeProduto,
            quantity: 1,
            unit_price: precoNumerico,
            currency_id: "BRL",
          },
        ],
        payer: {
          email: emailCliente,
        },
        back_urls: {
          success: `${baseUrl}/sucesso`,
          failure: `${baseUrl}/erro`,
          pending: `${baseUrl}/pendente`,
        },
        // Desativamos o auto_return para testes em localhost (evita o erro 400 do MP)
        // auto_return: "approved", 
        
        // Garante que o pagamento via Pix seja priorizado/exibido
        payment_methods: {
          excluded_payment_types: [],
          installments: 12
        },
        
        // Identificador da transação para seu controle futuro
        external_reference: id,
      },
    });

    console.log("✅ Preferência criada com sucesso:", result.id);

    // 7. Retornar o link de pagamento
    return NextResponse.json({ init_point: result.init_point });

  } catch (error: any) {
    // Log detalhado para identificar se o erro é no Token ou nos Dados
    console.error("❌ ERRO DETALHADO NA API:");
    if (error.response) {
      console.error("Dados da Resposta do MP:", error.response);
    } else {
      console.error("Mensagem:", error.message);
    }

    return NextResponse.json({ 
      error: "Erro interno no servidor", 
      detalhe: error.message 
    }, { status: 500 });
  }
}