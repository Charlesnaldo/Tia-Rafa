"use client";

// GA4 recommended e-commerce events. No-op when Analytics is not loaded (dev, blocked, not configured).
type Item = { id: string; nome: string; preco: number; quantity?: number };

const toGaItems = (items: Item[]) => items.map((item) => ({
  item_id: item.id, item_name: item.nome, price: item.preco / 100, quantity: item.quantity ?? 1,
}));
const valueOf = (items: Item[]) => items.reduce((total, item) => total + (item.preco / 100) * (item.quantity ?? 1), 0);

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export const analytics = {
  addToCart: (item: Item) => trackEvent("add_to_cart", { currency: "BRL", value: valueOf([item]), items: toGaItems([item]) }),
  beginCheckout: (items: Item[]) => trackEvent("begin_checkout", { currency: "BRL", value: valueOf(items), items: toGaItems(items) }),
  addPaymentInfo: (items: Item[], method: string, coupon?: string) =>
    trackEvent("add_payment_info", { currency: "BRL", value: valueOf(items), payment_type: method, coupon, items: toGaItems(items) }),
  // Deduplicated per payment: reloading the success page must not count a second sale.
  purchase: (paymentId: string, valueCents: number | null) => {
    const key = `ga_purchase_${paymentId}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      // Storage blocked: still report once for this page view.
    }
    trackEvent("purchase", { transaction_id: paymentId, currency: "BRL", ...(valueCents !== null ? { value: valueCents / 100 } : {}) });
  },
  generateLead: (source: string) => trackEvent("generate_lead", { lead_source: source }),
};
