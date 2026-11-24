"use client";

// E-commerce events for GA4 (gtag) and the Meta Pixel (fbq).
// Each call is a no-op when its script is not loaded (dev, blocked, not configured).
type Item = { id: string; nome: string; preco: number; quantity?: number };

const toGaItems = (items: Item[]) => items.map((item) => ({
  item_id: item.id, item_name: item.nome, price: item.preco / 100, quantity: item.quantity ?? 1,
}));
const valueOf = (items: Item[]) => items.reduce((total, item) => total + (item.preco / 100) * (item.quantity ?? 1), 0);
const toMeta = (items: Item[]) => ({
  currency: "BRL",
  value: Number(valueOf(items).toFixed(2)),
  content_type: "product",
  content_ids: items.map((item) => item.id),
  contents: items.map((item) => ({ id: item.id, quantity: item.quantity ?? 1, item_price: item.preco / 100 })),
  num_items: items.reduce((total, item) => total + (item.quantity ?? 1), 0),
});

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

// eventId lets Meta deduplicate a browser event against the same event sent by the server.
function trackMeta(name: string, params: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (eventId) window.fbq("track", name, params, { eventID: eventId });
  else window.fbq("track", name, params);
}

export const analytics = {
  viewItem: (item: Item) => {
    trackEvent("view_item", { currency: "BRL", value: valueOf([item]), items: toGaItems([item]) });
    trackMeta("ViewContent", toMeta([item]));
  },
  addToCart: (item: Item) => {
    trackEvent("add_to_cart", { currency: "BRL", value: valueOf([item]), items: toGaItems([item]) });
    trackMeta("AddToCart", toMeta([item]));
  },
  beginCheckout: (items: Item[]) => {
    trackEvent("begin_checkout", { currency: "BRL", value: valueOf(items), items: toGaItems(items) });
    trackMeta("InitiateCheckout", toMeta(items));
  },
  addPaymentInfo: (items: Item[], method: string, coupon?: string) => {
    trackEvent("add_payment_info", { currency: "BRL", value: valueOf(items), payment_type: method, coupon, items: toGaItems(items) });
    trackMeta("AddPaymentInfo", { ...toMeta(items), payment_method: method });
  },
  // Deduplicated per payment: reloading the success page must not count a second sale.
  // Meta needs a value, so without it the browser stays silent and the server event
  // (Conversions API, same event id) reports the purchase alone.
  purchase: (paymentId: string, valueCents: number | null) => {
    const key = `ga_purchase_${paymentId}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      // Storage blocked: still report once for this page view.
    }
    trackEvent("purchase", { transaction_id: paymentId, currency: "BRL", ...(valueCents !== null ? { value: valueCents / 100 } : {}) });
    if (valueCents !== null) trackMeta("Purchase", { currency: "BRL", value: valueCents / 100 }, `purchase_${paymentId}`);
  },
  generateLead: (source: string) => {
    trackEvent("generate_lead", { lead_source: source });
    trackMeta("Lead", { content_name: source });
  },
};
