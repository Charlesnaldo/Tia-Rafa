"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useAdminSupabase } from "@/lib/admin/useAdminSupabase";
import { formatCurrency } from "@/lib/utils";
import { Badge, Button, Card, EmptyState, MigrationNotice, PageHeader, inputClass } from "@/components/admin/ui";

type Product = { id: string; nome: string; preco_cents: number; is_active: boolean; material_path: string | null };
type KitItem = { kit_id: string; product_id: string; position: number };

export default function AdminKitsPage() {
  const { supabase, ready, error: sessionError } = useAdminSupabase();
  const [products, setProducts] = useState<Product[]>([]);
  const [kitItems, setKitItems] = useState<KitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ code?: string; message?: string } | null>(null);
  const [kitId, setKitId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const [productsResult, kitsResult] = await Promise.all([
      supabase.from("products").select("id, nome, preco_cents, is_active, material_path").order("nome"),
      supabase.from("kit_items").select("kit_id, product_id, position").order("position"),
    ]);
    setLoadError(productsResult.error ?? kitsResult.error);
    setProducts((productsResult.data as Product[] | null) ?? []);
    setKitItems((kitsResult.data as KitItem[] | null) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const byId = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const kits = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const item of kitItems) map.set(item.kit_id, [...(map.get(item.kit_id) ?? []), item.product_id]);
    return map;
  }, [kitItems]);

  const chooseKit = (id: string) => {
    setKitId(id);
    setSelected(kits.get(id) ?? []);
  };
  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const separateCents = selected.reduce((sum, id) => sum + (byId.get(id)?.preco_cents ?? 0), 0);
  const kitPrice = byId.get(kitId)?.preco_cents ?? 0;
  const savingsPct = separateCents > 0 && kitPrice < separateCents ? Math.round((1 - kitPrice / separateCents) * 100) : 0;

  const save = async () => {
    if (!supabase || !kitId) return;
    if (selected.length === 1) return toast.error("Um kit precisa de pelo menos 2 materiais (ou nenhum, para desfazer o kit).");
    const missingPdf = selected.filter((id) => !byId.get(id)?.material_path).map((id) => byId.get(id)?.nome ?? id);
    if (missingPdf.length > 0 && !window.confirm(`Estes materiais não têm PDF cadastrado e não serão entregues:\n${missingPdf.join("\n")}\n\nSalvar mesmo assim?`)) return;

    setSaving(true);
    const { error: deleteError } = await supabase.from("kit_items").delete().eq("kit_id", kitId);
    const { error: insertError } = deleteError || selected.length === 0
      ? { error: null }
      : await supabase.from("kit_items").insert(selected.map((productId, position) => ({ kit_id: kitId, product_id: productId, position })));
    setSaving(false);
    const error = deleteError ?? insertError;
    if (error) return toast.error(error.message);
    toast.success(selected.length ? "Kit salvo. A vitrine atualiza em até 1 minuto." : "Kit desfeito.");
    void load();
  };

  if (!ready) return <p className="text-sm text-slate-500">Validando login...</p>;
  if (sessionError) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{sessionError}</p>;

  const candidates = products.filter((product) => product.id !== kitId && !kits.has(product.id));

  return (
    <>
      <PageHeader title="Kits" description="Um kit é um produto que entrega vários materiais em uma compra." />
      <MigrationNotice error={loadError} />
      <p className="mb-6 rounded-xl bg-violet-50 p-3 text-sm text-violet-900">
        Como criar: 1) em <Link href="/admin/materiais" className="font-semibold underline">Materiais</Link>, cadastre o kit como um produto
        (nome, preço, fotos — não precisa de PDF); 2) aqui, escolha esse produto e marque os materiais que ele entrega.
      </p>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Montar kit" className="xl:col-span-2">
          {loading ? <p className="text-sm text-slate-500">Carregando...</p> : (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-500">Produto do kit
                <select value={kitId} onChange={(e) => chooseKit(e.target.value)} className={`${inputClass} mt-1`}>
                  <option value="">Escolha um produto…</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.nome} — {formatCurrency(product.preco_cents)}{kits.has(product.id) ? " (kit)" : ""}</option>
                  ))}
                </select>
              </label>
              {kitId ? (
                <>
                  <fieldset>
                    <legend className="mb-2 text-xs font-semibold text-slate-500">Materiais incluídos</legend>
                    <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
                      {candidates.map((product) => (
                        <label key={product.id} className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border p-3 text-sm ${selected.includes(product.id) ? "border-violet-300 bg-violet-50" : "border-slate-200"}`}>
                          <span className="flex items-center gap-2">
                            <input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggle(product.id)} />
                            <span className="font-semibold text-slate-800">{product.nome}</span>
                          </span>
                          <span className="shrink-0 text-xs text-slate-500">{formatCurrency(product.preco_cents)}{product.material_path ? "" : " · sem PDF"}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
                    <p className="text-slate-600">
                      Separados: <strong>{formatCurrency(separateCents)}</strong> · Kit: <strong>{formatCurrency(kitPrice)}</strong>
                      {savingsPct > 0 ? <> · <Badge tone="green">{savingsPct}% de economia</Badge></> : null}
                    </p>
                    <Button variant="primary" onClick={() => void save()} disabled={saving}>
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar kit
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </Card>

        <Card title="Kits cadastrados">
          {kits.size === 0 ? <EmptyState>Nenhum kit ainda.</EmptyState> : (
            <ul className="space-y-4">
              {[...kits.entries()].map(([id, componentIds]) => {
                const kit = byId.get(id);
                return (
                  <li key={id}>
                    <button type="button" onClick={() => chooseKit(id)} className="w-full rounded-xl border border-slate-200 p-3 text-left hover:border-violet-300">
                      <p className="flex items-center gap-2 font-semibold text-slate-900"><Boxes size={16} /> {kit?.nome ?? id}</p>
                      <p className="text-xs text-slate-500">{componentIds.length} materiais · {formatCurrency(kit?.preco_cents ?? 0)}{kit && !kit.is_active ? " · inativo" : ""}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
