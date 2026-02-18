import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type CartItem = { id: string; quantity: number };
type ProductSnapshot = { id: string; nome: string; preco: number };

type PersistApprovedSaleInput = {
  mpPaymentId: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  email: string;
  nome?: string;
  telefone?: string;
  cpf?: string;
  cartItems: CartItem[];
  rawPayload?: unknown;
};

export async function persistApprovedSale(input: PersistApprovedSaleInput) {
  const supabase = getSupabaseAdminClient();

  const customerUpsert = await supabase
    .from("customers")
    .upsert(
      {
        email: input.email,
        nome: input.nome || "Cliente",
        telefone: input.telefone || null,
        cpf: input.cpf || null,
      },
      { onConflict: "email" }
    )
    .select("id")
    .single();

  if (customerUpsert.error || !customerUpsert.data?.id) {
    throw new Error(`Falha ao salvar cliente no Supabase: ${customerUpsert.error?.message || "sem id de cliente"}`);
  }

  const orderUpsert = await supabase
    .from("orders")
    .upsert(
      {
        mp_payment_id: input.mpPaymentId,
        customer_id: customerUpsert.data.id,
        status: input.status,
        payment_method: input.paymentMethod,
        total_amount: input.totalAmount,
        currency: "BRL",
        metadata: input.rawPayload ?? null,
      },
      { onConflict: "mp_payment_id" }
    )
    .select("id")
    .single();

  if (orderUpsert.error || !orderUpsert.data?.id) {
    throw new Error(`Falha ao salvar pedido no Supabase: ${orderUpsert.error?.message || "sem id de pedido"}`);
  }

  const orderId = orderUpsert.data.id;

  const deleteItemsResult = await supabase.from("order_items").delete().eq("order_id", orderId);
  if (deleteItemsResult.error) {
    throw new Error(`Falha ao limpar itens do pedido no Supabase: ${deleteItemsResult.error.message}`);
  }

  const snapshots = new Map<string, ProductSnapshot>();

  const ids = Array.from(new Set(input.cartItems.map((item) => item.id)));
  if (ids.length > 0) {
    const { data } = await supabase
      .from("products")
      .select("id, nome, preco_cents, is_active")
      .in("id", ids);

    for (const row of data || []) {
      if (!row?.id || row?.is_active === false) continue;
      snapshots.set(row.id, {
        id: row.id,
        nome: row.nome || row.id,
        preco: Number.isFinite(row.preco_cents) ? Number(row.preco_cents) : 0,
      });
    }
  }

  const normalizedItems = input.cartItems
    .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0 && snapshots.has(item.id))
    .map((item) => {
      const product = snapshots.get(item.id) as ProductSnapshot;
      const lineTotal = product.preco * item.quantity;
      return {
        order_id: orderId,
        product_id: item.id,
        product_name: product.nome,
        quantity: item.quantity,
        unit_price_cents: product.preco,
        line_total_cents: lineTotal,
      };
    });

  if (normalizedItems.length > 0) {
    const insertItemsResult = await supabase.from("order_items").insert(normalizedItems);
    if (insertItemsResult.error) {
      throw new Error(`Falha ao salvar itens do pedido no Supabase: ${insertItemsResult.error.message}`);
    }
  }
}
