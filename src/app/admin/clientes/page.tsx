"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw, Search } from "lucide-react";
import { useAdminSupabase } from "@/lib/admin/useAdminSupabase";
import { downloadCsv, formatDateTime } from "@/lib/admin/csv";
import { formatCurrency } from "@/lib/utils";
import { Button, Card, CsvButton, EmptyState, MigrationNotice, PageHeader, inputClass } from "@/components/admin/ui";
import WhatsAppLink from "@/components/admin/WhatsAppLink";

type Customer = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  created_at: string;
  orders: { total_amount: number; status: string; created_at: string }[];
};

type Row = Customer & { spentCents: number; orderCount: number; lastOrder: string | null };

export default function AdminCustomersPage() {
  const { supabase, ready, error: sessionError } = useAdminSupabase();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ code?: string; message?: string } | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"spent" | "recent">("spent");

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from("customers")
      .select("id, nome, email, telefone, created_at, orders(total_amount, status, created_at)")
      .order("created_at", { ascending: false })
      .limit(1000);
    setLoadError(error);
    setRows(((data as Customer[] | null) ?? []).map((customer) => {
      const approved = (customer.orders || []).filter((order) => order.status === "approved");
      return {
        ...customer,
        spentCents: approved.reduce((sum, order) => sum + Math.round(Number(order.total_amount) * 100), 0),
        orderCount: approved.length,
        lastOrder: approved.map((order) => order.created_at).sort().at(-1) ?? null,
      };
    }));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return rows
      .filter((row) => !text || [row.nome, row.email, row.telefone].some((value) => value?.toLowerCase().includes(text)))
      .sort((a, b) => (sort === "spent" ? b.spentCents - a.spentCents : (b.lastOrder ?? "").localeCompare(a.lastOrder ?? "")));
  }, [rows, query, sort]);

  const exportCsv = () => downloadCsv("clientes.csv", visible.map((row) => ({
    nome: row.nome,
    email: row.email,
    telefone: row.telefone ?? "",
    pedidos: row.orderCount,
    total_gasto: (row.spentCents / 100).toFixed(2).replace(".", ","),
    ultima_compra: formatDateTime(row.lastOrder),
  })));

  if (!ready) return <p className="text-sm text-slate-500">Validando login...</p>;
  if (sessionError) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{sessionError}</p>;

  const repeat = rows.filter((row) => row.orderCount > 1).length;

  return (
    <>
      <PageHeader
        title="Clientes"
        description={`${rows.length} clientes · ${repeat} compraram mais de uma vez`}
        actions={
          <>
            <CsvButton disabled={visible.length === 0} onClick={exportCsv} />
            <Button onClick={() => void load()} disabled={loading}>
              <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Atualizar
            </Button>
          </>
        }
      />
      <MigrationNotice error={loadError} />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, e-mail ou telefone" aria-label="Buscar clientes" className={`${inputClass} pl-9`} />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Ordenar por
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={`${inputClass} w-44`}>
            <option value="spent">Quem mais gastou</option>
            <option value="recent">Compra mais recente</option>
          </select>
        </label>
      </div>
      <Card>
        {loading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : visible.length === 0 ? (
          <EmptyState>Nenhum cliente encontrado.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Contato</th>
                  <th className="py-2 pr-3 text-right">Pedidos</th>
                  <th className="py-2 pr-3 text-right">Total gasto</th>
                  <th className="py-2">Última compra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-slate-900">{row.nome}</p>
                      <p className="text-xs text-slate-500">{row.email}</p>
                    </td>
                    <td className="py-3 pr-3"><WhatsAppLink phone={row.telefone} name={row.nome} /></td>
                    <td className="py-3 pr-3 text-right tabular-nums">{row.orderCount}</td>
                    <td className="py-3 pr-3 text-right font-bold tabular-nums">{formatCurrency(row.spentCents)}</td>
                    <td className="py-3 text-slate-600">{formatDateTime(row.lastOrder)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
