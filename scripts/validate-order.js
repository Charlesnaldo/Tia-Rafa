#!/usr/bin/env node

const [,, orderId, paymentId] = process.argv;

if (!orderId) {
  console.error("Uso: node scripts/validate-order.js <ORDER_ID> [PAYMENT_ID]");
  process.exit(1);
}

const token = process.env.MP_ACCESS_TOKEN;

if (!token) {
  console.error("Defina MP_ACCESS_TOKEN antes de executar o script.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function fetchJson(url) {
  const response = await fetch(url, { headers });
  const payload = await response.json();
  if (!response.ok) {
    const errorText = JSON.stringify(payload, null, 2);
    throw new Error(`Status ${response.status} - ${errorText}`);
  }
  return payload;
}

(async function main() {
  try {
    console.log(`Consultando order ${orderId}...`);
    const order = await fetchJson(`https://api.mercadopago.com/v1/orders/${orderId}`);
    console.log("Order encontrada:", {
      id: order.id,
      status: order.status,
      processing_mode: order.processing_mode,
      total_amount: order.total_amount,
      external_reference: order.external_reference,
    });

    const payments = order.transactions?.[0]?.payments || [];
    if (payments.length === 0) {
      console.warn("Nenhum pagamento associado à order foi encontrado ainda.");
    } else {
      console.log("Pagamentos já processados na order:", payments.map((p) => ({
        id: p.id,
        status: p.status,
        payment_method_id: p.payment_method_id,
        status_detail: p.status_detail,
      })));
    }

    if (paymentId) {
      console.log(`\nConsultando payment ${paymentId}...`);
      const payment = await fetchJson(`https://api.mercadopago.com/v1/payments/${paymentId}`);
      console.log("Payment encontrado:", {
        id: payment.id,
        status: payment.status,
        payment_method_id: payment.payment_method_id,
        point_of_interaction: payment.point_of_interaction,
      });
    }
  } catch (error) {
    console.error("Falha na validação:", error);
    process.exit(1);
  }
})();
