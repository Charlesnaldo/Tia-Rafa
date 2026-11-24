import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingSchema } from "@/lib/supabase/missing-schema";

// Map of kit id -> component product ids, in display order. Empty before the migration runs.
export async function loadKitComponents(supabase: SupabaseClient, kitIds?: string[]) {
  const map = new Map<string, string[]>();
  if (kitIds && kitIds.length === 0) return map;
  let query = supabase.from("kit_items").select("kit_id, product_id, position").order("position");
  if (kitIds) query = query.in("kit_id", kitIds);
  const { data, error } = await query;
  if (error) {
    if (isMissingSchema(error)) return map;
    throw new Error("Falha ao consultar kits.");
  }
  for (const row of data || []) {
    const list = map.get(row.kit_id) || [];
    list.push(row.product_id);
    map.set(row.kit_id, list);
  }
  return map;
}

// Products to deliver for a purchase: kits are replaced by their components, duplicates removed.
export function expandKits(productIds: string[], kits: Map<string, string[]>) {
  const result: string[] = [];
  for (const id of productIds) {
    for (const deliverable of kits.get(id) ?? [id]) {
      if (!result.includes(deliverable)) result.push(deliverable);
    }
  }
  return result;
}
