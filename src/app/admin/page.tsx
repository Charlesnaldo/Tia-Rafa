"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { useAdminSupabase } from "@/lib/admin/useAdminSupabase";
import { isMissingSchema } from "@/lib/supabase/missing-schema";
import { formatCurrency } from "@/lib/utils";
import { formatDateTime } from "@/lib/admin/csv";
import RevenueChart, { type RevenuePoint } from "@/components/admin/RevenueChart";
import { Badge, Button, Card, EmptyState, PageHeader, StatTile } from "@/components/admin/ui";

type OrderRow = {
  id: string;
  total_amount: number;
  created_at: string;
  payment_method: string;
  customers: { nome: string } | { nome: string }[] | null;
  order_items: { product_id: string; product_name: string; quantity: number; line_total_cents: number }[];
};

type Extras = {
  pixCreated: number | null;
  pixPaid: number | null;
  leads: number | null;
  toShip: number | null;
};

const PERIODS = [7, 30, 90] as const;
const DAY = 24 * 60 * 60 * 1000;
const dayKey = (date: Date) => date.toLocaleDateString("sv-SE"); // YYYY-MM-DD in local time

const customerName = (order: OrderRow) =>
  (Array.isArray(order.customers) ? order.customers[0]?.nome : order.customers?.nome) || "Cliente";

export default function AdminDashboard() {
  const { supabase, ready, error: sessionError } = useAdminSupabase();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(30);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [extras, setExtras] = useState<Extras>({ pixCreated: null, pixPaid: null, leads: null, toShip: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Time of the last load: charts are bucketed against it, never against render time.
  const [loadedAt, setLoadedAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const now = Date.now();
    const since = new Date(now - period * DAY).toISOString();
    // Optional counts return null before the migration instead of failing the page.
    const optionalCount = async (query: PromiseLike<{ count: number | null; error: { code?: string; message?: string } | null }>) => {
      const { count, error: countError } = await query;
      return countError ? (isMissingSchema(countError) ? null : 0) : count ?? 0;
    };

    const [ordersResult, pixCreated, pixPaid, leads, toShip] = await Promise.all([
      supabase.from("orders")
        .select("id, total_amount, created_at, payment_method, customers(nome), order_items(product_id, product_name, quantity, line_total_cents)")
        .eq("status", "approved").gte("created_at", since).order("created_at", { ascending: false }).limit(2000),
      optionalCount(supabase.from("pending_payments").select("*", { count: "exact", head: true }).gte("created_at", since)),
      optionalCount(supabase.from("pending_payments").select("*", { count: "exact", head: true }).gte("created_at", since).eq("status", "approved")),
      optionalCount(supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", since)),
      optionalCount(supabase.from("orders").select("*", { count: "exact", head: true }).eq("fulfillment_status", "pendente")),
    ]);
    if (ordersResult.error) setError(ordersResult.error.message);
    setOrders((ordersResult.data as OrderRow[] | null) ?? []);
    setExtras({ pixCreated, pixPaid, leads, toShip });
    setLoadedAt(now);
    setLoading(false);
  }, [supabase, period]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const stats = useMemo(() => {
    const revenueCents = orders.reduce((sum, order) => sum + Math.round(Number(order.total_amount || 0) * 100), 0);
    const days: RevenuePoint[] = [];
    for (let i = period - 1; loadedAt !== null && i >= 0; i--) {
      const date = new Date(loadedAt - i * DAY);
      days.push({ key: dayKey(date), label: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), cents: 0, orders: 0 });
    }
    const byDay = new Map(days.map((point) => [point.key, point]));
    const byProduct = new Map<string, { nome: string; cents: number; quantity: number }>();
    for (const order of orders) {
      const point = byDay.get(dayKey(new Date(order.created_at)));
      if (point) {
        point.cents += Math.round(Number(order.total_amount || 0) * 100);
        point.orders += 1;
      }
      for (const item of order.order_items || []) {
        const entry = byProduct.get(item.product_id) || { nome: item.product_name, cents: 0, quantity: 0 };
        entry.cents += item.line_total_cents;
        entry.quantity += item.quantity;
        byProduct.set(item.product_id, entry);
      }
    }
    const topProducts = [...byProduct.values()].sort((a, b) => b.cents - a.cents).slice(0, 5);
    return {
      revenueCents,
      orderCount: orders.length,
      averageCents: orders.length ? Math.round(revenueCents / orders.length) : 0,
      days,
      topProducts,
      topMax: Math.max(...topProducts.map((product) => product.cents), 1),
    };
  }, [orders, period, loadedAt]);

  if (!ready) return <p className="text-sm text-slate-500">Validando login...</p>;
  if (sessionError) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{sessionError}</p>;

  const pixRate = extras.pixCreated ? Math.round(((extras.pixPaid ?? 0) / extras.pixCreated) * 100) : null;

  return (
    <>
      <PageHeader
        title="Painel"
        description="Vendas aprovadas e funil do período."
        actions={
          <>
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1" role="group" aria-label="Período">
              {PERIODS.map((days) => (
                <button key={days} type="button" onClick={() => setPeriod(days)} aria-pressed={period === days}
                  className={`rounded-lg px-3 py-1 text-sm font-semibold ${period === days ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                  {days} dias
                </button>
              ))}
            </div>
            <Button onClick={() => void load()} disabled={loading}><RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Atualizar</Button>
          </>
        }
      />
      {error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Receita" value={formatCurrency(stats.revenueCents)} hint={`últimos ${period} dias`} />
        <StatTile label="Pedidos" value={String(stats.orderCount)} hint="aprovados" />
        <StatTile label="Ticket médio" value={formatCurrency(stats.averageCents)} hint="por pedido" />
        <StatTile
          label="Pix pagos"
          value={pixRate === null ? "—" : `${pixRate}%`}
          hint={extras.pixCreated === null ? "rode a migração" : `${extras.pixPaid ?? 0} de ${extras.pixCreated} gerados`}
        />
        <StatTile label="Leads" value={extras.leads === null ? "—" : String(extras.leads)} hint={extras.leads === null ? "rode a migração" : "materiais grátis"} />
        <StatTile label="A enviar" value={extras.toShip === null ? "—" : String(extras.toShip)} hint="pedidos físicos" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Receita aprovada por dia" className="xl:col-span-2">
          {stats.orderCount === 0 && !loading ? <EmptyState>Nenhuma venda aprovada neste período.</EmptyState> : <RevenueChart data={stats.days} />}
        </Card>

        <Card title="Materiais que mais venderam">
          {stats.topProducts.length === 0 ? (
            <EmptyState>Sem vendas no período.</EmptyState>
          ) : (
            <ul className="space-y-4">
              {stats.topProducts.map((product) => (
                <li key={product.nome}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate font-semibold text-slate-800">{product.nome}</span>
                    <span className="shrink-0 tabular-nums text-slate-700">{formatCurrency(product.cents)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-[#2a78d6]" style={{ width: `${Math.max((product.cents / stats.topMax) * 100, 2)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{product.quantity} {product.quantity === 1 ? "unidade" : "unidades"}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Últimos pedidos" className="mt-6" actions={<Link href="/admin/pedidos" className="text-sm font-semibold text-violet-700 hover:underline">Ver todos</Link>}>
        {orders.length === 0 ? (
          <EmptyState>Nenhum pedido aprovado ainda.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {orders.slice(0, 6).map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{customerName(order)}</p>
                  <p className="truncate text-xs text-slate-500">{(order.order_items || []).map((item) => item.product_name).join(", ") || "Itens não registrados"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={order.payment_method === "pix" ? "green" : "blue"}>{order.payment_method === "pix" ? "Pix" : "Cartão"}</Badge>
                  <span className="text-xs text-slate-500">{formatDateTime(order.created_at)}</span>
                  <span className="font-bold tabular-nums">{formatCurrency(Math.round(Number(order.total_amount) * 100))}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
