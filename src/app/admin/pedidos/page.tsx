"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Mail, RefreshCcw, Search, Truck } from "lucide-react";
import { toast } from "sonner";
import { useAdminSupabase } from "@/lib/admin/useAdminSupabase";
import { isMissingSchema } from "@/lib/supabase/missing-schema";
import { downloadCsv, formatDateTime } from "@/lib/admin/csv";
import { formatShippingAddress, parseShippingAddress } from "@/lib/shipping-address";
import { formatCurrency, formatPaymentStatus } from "@/lib/utils";
import { Badge, Button, Card, CsvButton, EmptyState, MigrationNotice, PageHeader, inputClass } from "@/components/admin/ui";

type Fulfillment = "pendente" | "enviado" | "entregue" | null;

type Order = {
  id: string;
  mp_payment_id: string;
  status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
  endereco_entrega: string | null;
  coupon_code?: string | null;
  discount_cents?: number | null;
  fulfillment_status?: Fulfillment;
  tracking_code?: string | null;
  customers: { nome: string; email: string; telefone: string | null } | { nome: string; email: string; telefone: string | null }[] | null;
  order_items: { product_id: string; product_name: string; quantity: number; unit_price_cents: number; line_total_cents: number }[];
};

const BASE_COLUMNS = "id, mp_payment_id, status, payment_method, total_amount, created_at, endereco_entrega:metadata->metadata->>endereco_entrega, customers(nome, email, telefone), order_items(product_id, product_name, quantity, unit_price_cents, line_total_cents)";
const GROWTH_COLUMNS = ", coupon_code, discount_cents, fulfillment_status, tracking_code";

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "a-enviar", label: "Físicos a enviar" },
  { id: "enviados", label: "Enviados" },
  { id: "com-cupom", label: "Com cupom" },
] as const;

const customerOf = (order: Order) => (Array.isArray(order.customers) ? order.customers[0] : order.customers) ?? null;
const addressOf = (order: Order) => {
  if (!order.endereco_entrega) return null;
  try {
    const parsed = parseShippingAddress(JSON.parse(order.endereco_entrega));
    return "address" in parsed ? formatShippingAddress(parsed.address) : null;
  } catch {
    return null;
  }
};
const fulfillmentBadge = (status: Fulfillment) => {
  if (status === "pendente") return <Badge tone="amber"><Truck size={12} /> A enviar</Badge>;
  if (status === "enviado") return <Badge tone="blue"><Truck size={12} /> Enviado</Badge>;
  if (status === "entregue") return <Badge tone="green"><Truck size={12} /> Entregue</Badge>;
  return null;
};

function ShippingForm({ order, onSaved }: { order: Order; onSaved: () => void }) {
  const [status, setStatus] = useState<Exclude<Fulfillment, null>>(order.fulfillment_status ?? "pendente");
  const [trackingCode, setTrackingCode] = useState(order.tracking_code ?? "");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/pedidos/${order.id}/envio`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, trackingCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast.success(data.emailed ? "Envio salvo e rastreio enviado ao cliente." : "Envio atualizado.");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar o envio.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="text-xs font-semibold text-slate-500">
        Envio
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={`${inputClass} mt-1 w-36`}>
          <option value="pendente">A enviar</option>
          <option value="enviado">Enviado</option>
          <option value="entregue">Entregue</option>
        </select>
      </label>
      <label className="text-xs font-semibold text-slate-500">
        Código de rastreio
        <input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value.toUpperCase())} placeholder="AA123456789BR" className={`${inputClass} mt-1 w-48`} />
      </label>
      <Button variant="primary" onClick={() => void save()} disabled={saving}>
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />} Salvar envio
      </Button>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { supabase, ready, error: sessionError } = useAdminSupabase();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ code?: string; message?: string } | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("todos");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resending, setResending] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const run = (columns: string) => supabase.from("orders").select(columns).order("created_at", { ascending: false }).limit(500);
    let result = await run(BASE_COLUMNS + GROWTH_COLUMNS);
    let growthError = null;
    if (result.error && isMissingSchema(result.error)) {
      growthError = result.error;
      result = await run(BASE_COLUMNS);
    }
    setLoadError(result.error ?? growthError);
    setOrders((result.data as unknown as Order[] | null) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter === "a-enviar" && order.fulfillment_status !== "pendente") return false;
      if (filter === "enviados" && !["enviado", "entregue"].includes(order.fulfillment_status ?? "")) return false;
      if (filter === "com-cupom" && !order.coupon_code) return false;
      if (!text) return true;
      const customer = customerOf(order);
      return [customer?.nome, customer?.email, order.mp_payment_id, order.coupon_code, ...order.order_items.map((item) => item.product_name)]
        .some((value) => value?.toLowerCase().includes(text));
    });
  }, [orders, query, filter]);

  const resend = async (order: Order) => {
    setResending(order.id);
    try {
      const response = await fetch(`/api/admin/pedidos/${order.id}/reenviar`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast.success(`${data.sent} material(is) reenviado(s) para ${data.to}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao reenviar.");
    } finally {
      setResending(null);
    }
  };

  const exportCsv = () => downloadCsv(`pedidos-${new Date().toISOString().slice(0, 10)}.csv`, visible.map((order) => {
    const customer = customerOf(order);
    return {
      data: formatDateTime(order.created_at),
      pagamento_mp: order.mp_payment_id,
      status: formatPaymentStatus(order.status),
      metodo: order.payment_method,
      cliente: customer?.nome ?? "",
      email: customer?.email ?? "",
      telefone: customer?.telefone ?? "",
      itens: order.order_items.map((item) => `${item.product_name} x${item.quantity}`).join(" | "),
      total: Number(order.total_amount).toFixed(2).replace(".", ","),
      cupom: order.coupon_code ?? "",
      envio: order.fulfillment_status ?? "",
      rastreio: order.tracking_code ?? "",
      endereco: addressOf(order) ?? "",
    };
  }));

  if (!ready) return <p className="text-sm text-slate-500">Validando login...</p>;
  if (sessionError) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{sessionError}</p>;

  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Vendas aprovadas, reenvio de material e envio de itens físicos."
        actions={<>
          <CsvButton onClick={exportCsv} disabled={visible.length === 0} />
          <Button onClick={() => void load()} disabled={loading}><RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Atualizar</Button>
        </>}
      />
      <MigrationNotice error={loadError} />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por cliente, e-mail, material, cupom ou nº do pagamento" aria-label="Buscar pedidos" className={`${inputClass} pl-9`} />
        </label>
        <div className="inline-flex flex-wrap rounded-xl border border-slate-200 bg-white p-1" role="group" aria-label="Filtrar pedidos">
          {FILTERS.map((item) => (
            <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={filter === item.id}
              className={`rounded-lg px-3 py-1 text-sm font-semibold ${filter === item.id ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {loading ? <p className="text-sm text-slate-500">Carregando...</p> : visible.length === 0 ? <EmptyState>Nenhum pedido encontrado.</EmptyState> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="w-8 py-2" aria-label="Detalhes" />
                  <th className="py-2 pr-3">Data</th>
                  <th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Itens</th>
                  <th className="py-2 pr-3">Situação</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((order) => {
                  const customer = customerOf(order);
                  const open = expanded === order.id;
                  const address = addressOf(order);
                  return (
                    <Fragment key={order.id}>
                      <tr className="cursor-pointer hover:bg-slate-50" onClick={() => setExpanded(open ? null : order.id)}>
                        <td className="py-3">
                          <button type="button" aria-expanded={open} aria-label={open ? "Fechar detalhes" : "Abrir detalhes"} className="text-slate-400">
                            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-3 text-slate-600">{formatDateTime(order.created_at)}</td>
                        <td className="py-3 pr-3">
                          <p className="font-semibold text-slate-900">{customer?.nome ?? "Cliente"}</p>
                          <p className="text-xs text-slate-500">{customer?.email}</p>
                        </td>
                        <td className="max-w-xs truncate py-3 pr-3 text-slate-600">{order.order_items.map((item) => item.product_name).join(", ")}</td>
                        <td className="py-3 pr-3">
                          <div className="flex flex-wrap gap-1">
                            <Badge tone={order.status === "approved" ? "green" : "slate"}>{formatPaymentStatus(order.status)}</Badge>
                            {fulfillmentBadge(order.fulfillment_status ?? null)}
                            {order.coupon_code ? <Badge tone="violet">{order.coupon_code}</Badge> : null}
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-3 text-right font-bold tabular-nums">{formatCurrency(Math.round(Number(order.total_amount) * 100))}</td>
                      </tr>
                      {open ? (
                        <tr className="bg-slate-50">
                          <td />
                          <td colSpan={5} className="space-y-4 py-4 pr-3">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Itens</p>
                                <ul className="space-y-1">
                                  {order.order_items.map((item) => (
                                    <li key={item.product_id} className="flex justify-between gap-2">
                                      <span>{item.product_name} × {item.quantity}</span>
                                      <span className="tabular-nums text-slate-600">{formatCurrency(item.line_total_cents)}</span>
                                    </li>
                                  ))}
                                </ul>
                                {order.coupon_code ? (
                                  <p className="mt-2 text-xs text-violet-700">Cupom {order.coupon_code}: − {formatCurrency(order.discount_cents ?? 0)}</p>
                                ) : null}
                              </div>
                              <div className="space-y-1 text-sm">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cliente</p>
                                <p>{customer?.nome} · {customer?.email}{customer?.telefone ? ` · ${customer.telefone}` : ""}</p>
                                <p className="text-xs text-slate-500">Pagamento Mercado Pago nº {order.mp_payment_id} ({order.payment_method})</p>
                                {address ? <p className="rounded-lg bg-amber-50 p-2 text-amber-900"><strong>Entregar em:</strong> {address}</p> : null}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-200 pt-4">
                              {order.fulfillment_status !== undefined && (order.fulfillment_status || address)
                                ? <ShippingForm order={order} onSaved={() => void load()} />
                                : <span />}
                              <Button onClick={() => void resend(order)} disabled={resending === order.id}>
                                {resending === order.id ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />} Reenviar material digital
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
