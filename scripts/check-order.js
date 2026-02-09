#!/usr/bin/env node

const [,, orderId] = process.argv;

if (!orderId) {
  console.error("Uso: node scripts/check-order.js <ORDER_ID>");
  process.exit(1);
}

const token = process.env.MP_ACCESS_TOKEN;

if (!token) {
  console.error("A variável MP_ACCESS_TOKEN precisa estar definida.");
  process.exit(1);
}

const url = `https://api.mercadopago.com/v1/orders/${orderId}`;

(async function () {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar order:", JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log("Order encontrada:", data);
  } catch (error) {
    console.error("Falha ao se comunicar com o Mercado Pago:", error);
    process.exit(1);
  }
})();
