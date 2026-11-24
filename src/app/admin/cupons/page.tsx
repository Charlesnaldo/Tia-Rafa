"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminSupabase } from "@/lib/admin/useAdminSupabase";
import { formatDateTime } from "@/lib/admin/csv";
import type { Coupon } from "@/lib/coupons";
import { formatCurrency } from "@/lib/utils";
import { Badge, Button, Card, EmptyState, MigrationNotice, PageHeader, inputClass } from "@/components/admin/ui";

type CouponRow = Coupon & { created_at: string };

const EMPTY_FORM = {
  code: "", description: "", kind: "percent" as "percent" | "amount", value: "",
  minItems: "1", minSubtotal: "", maxUses: "", expiresAt: "",
};

const toCents = (value: string) => Math.round(Number(value.replace(",", ".")) * 100);

function couponSummary(coupon: Coupon) {
  const off = coupon.percent_off !== null ? `${coupon.percent_off}% off` : `${formatCurrency(coupon.amount_off_cents ?? 0)} off`;
  const rules = [
    coupon.min_items > 1 ? `a partir de ${coupon.min_items} itens` : null,
    coupon.min_subtotal_cents > 0 ? `compras acima de ${formatCurrency(coupon.min_subtotal_cents)}` : null,
  ].filter(Boolean);
  return rules.length ? `${off} · ${rules.join(" · ")}` : off;
}

export default function AdminCouponsPage() {
  const { supabase, ready, error: sessionError } = useAdminSupabase();
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ code?: string; message?: string } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loadedAt, setLoadedAt] = useState(0);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setLoadError(error);
    setCoupons((data as CouponRow[] | null) ?? []);
    setLoadedAt(Date.now());
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const update = (field: keyof typeof EMPTY_FORM, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    const code = form.code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return toast.error("Código: 3 a 32 letras, números, - ou _.");
    const value = Number(form.value.replace(",", "."));
    if (form.kind === "percent" && !(Number.isInteger(value) && value >= 1 && value <= 90)) return toast.error("Percentual entre 1 e 90.");
    if (form.kind === "amount" && !(value > 0)) return toast.error("Informe o valor do desconto.");

    setSaving(true);
    const { error } = await supabase.from("coupons").insert({
      code,
      description: form.description.trim() || null,
      percent_off: form.kind === "percent" ? value : null,
      amount_off_cents: form.kind === "amount" ? toCents(form.value) : null,
      min_items: Math.max(Number.parseInt(form.minItems, 10) || 1, 1),
      min_subtotal_cents: form.minSubtotal ? toCents(form.minSubtotal) : 0,
      max_uses: form.maxUses ? Math.max(Number.parseInt(form.maxUses, 10), 1) : null,
      // End of the chosen day in Brasília.
      expires_at: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59-03:00`).toISOString() : null,
      is_active: true,
    });
    setSaving(false);
    if (error) return toast.error(error.code === "23505" ? "Já existe um cupom com esse código." : error.message);
    toast.success(`Cupom ${code} criado.`);
    setForm(EMPTY_FORM);
    void load();
  };

  const toggle = async (coupon: CouponRow) => {
    if (!supabase) return;
    const { error } = await supabase.from("coupons").update({ is_active: !coupon.is_active }).eq("code", coupon.code);
    if (error) return toast.error(error.message);
    toast.success(coupon.is_active ? "Cupom desativado." : "Cupom ativado.");
    void load();
  };

  const remove = async (coupon: CouponRow) => {
    if (!supabase || !window.confirm(`Apagar o cupom ${coupon.code}? O histórico de uso também será apagado.`)) return;
    const { error } = await supabase.from("coupons").delete().eq("code", coupon.code);
    if (error) return toast.error(error.message);
    toast.success("Cupom apagado.");
    void load();
  };

  if (!ready) return <p className="text-sm text-slate-500">Validando login...</p>;
  if (sessionError) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{sessionError}</p>;

  return (
    <>
      <PageHeader title="Cupons" description="Descontos para campanhas, parceiras e combos (ex.: LEVE3 com mínimo de 3 itens)." />
      <MigrationNotice error={loadError} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Novo cupom">
          <form onSubmit={create} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-500">Código
              <input value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())} placeholder="VOLTAASAULAS" className={`${inputClass} mt-1 uppercase`} required />
            </label>
            <label className="block text-xs font-semibold text-slate-500">Descrição (interna)
              <input value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Campanha Instagram janeiro" className={`${inputClass} mt-1`} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs font-semibold text-slate-500">Tipo
                <select value={form.kind} onChange={(e) => update("kind", e.target.value)} className={`${inputClass} mt-1`}>
                  <option value="percent">Percentual (%)</option>
                  <option value="amount">Valor (R$)</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-500">{form.kind === "percent" ? "Desconto (%)" : "Desconto (R$)"}
                <input value={form.value} onChange={(e) => update("value", e.target.value)} inputMode="decimal" placeholder={form.kind === "percent" ? "15" : "5,00"} className={`${inputClass} mt-1`} required />
              </label>
              <label className="block text-xs font-semibold text-slate-500">Mínimo de itens
                <input value={form.minItems} onChange={(e) => update("minItems", e.target.value)} inputMode="numeric" className={`${inputClass} mt-1`} />
              </label>
              <label className="block text-xs font-semibold text-slate-500">Compra mínima (R$)
                <input value={form.minSubtotal} onChange={(e) => update("minSubtotal", e.target.value)} inputMode="decimal" placeholder="0,00" className={`${inputClass} mt-1`} />
              </label>
              <label className="block text-xs font-semibold text-slate-500">Limite de usos
                <input value={form.maxUses} onChange={(e) => update("maxUses", e.target.value)} inputMode="numeric" placeholder="Sem limite" className={`${inputClass} mt-1`} />
              </label>
              <label className="block text-xs font-semibold text-slate-500">Válido até
                <input type="date" value={form.expiresAt} onChange={(e) => update("expiresAt", e.target.value)} className={`${inputClass} mt-1`} />
              </label>
            </div>
            <Button type="submit" variant="primary" disabled={saving} className="w-full">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Criar cupom
            </Button>
          </form>
        </Card>

        <Card title="Cupons" className="xl:col-span-2">
          {loading ? <p className="text-sm text-slate-500">Carregando...</p> : coupons.length === 0 ? <EmptyState>Nenhum cupom criado.</EmptyState> : (
            <ul className="divide-y divide-slate-100">
              {coupons.map((coupon) => {
                const expired = coupon.expires_at !== null && new Date(coupon.expires_at).getTime() < loadedAt;
                const exhausted = coupon.max_uses !== null && coupon.uses >= coupon.max_uses;
                return (
                  <li key={coupon.code} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-base font-bold text-slate-900">{coupon.code}</span>
                        {!coupon.is_active ? <Badge>Desativado</Badge> : expired ? <Badge tone="red">Expirado</Badge> : exhausted ? <Badge tone="amber">Esgotado</Badge> : <Badge tone="green">Ativo</Badge>}
                      </div>
                      <p className="text-sm text-slate-600">{couponSummary(coupon)}</p>
                      <p className="text-xs text-slate-500">
                        {coupon.uses} {coupon.uses === 1 ? "uso" : "usos"}{coupon.max_uses ? ` de ${coupon.max_uses}` : ""}
                        {coupon.expires_at ? ` · até ${formatDateTime(coupon.expires_at)}` : ""}
                        {coupon.description ? ` · ${coupon.description}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => void toggle(coupon)}>{coupon.is_active ? "Desativar" : "Ativar"}</Button>
                      <Button variant="danger" onClick={() => void remove(coupon)} aria-label={`Apagar cupom ${coupon.code}`}><Trash2 size={14} /></Button>
                    </div>
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
