"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Mail, Phone, RefreshCcw, ShoppingCart, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type CustomerRow = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  created_at: string;
};

type OrderRow = {
  id: string;
  mp_payment_id: string;
  status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
  customers: {
    nome: string;
    email: string;
    telefone: string | null;
  } | null;
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      router.push("/admin/login");
      return;
    }

    setSessionReady(true);

    const [ordersResult, customersResult] = await Promise.all([
      supabase
        .from("orders")
        .select("id, mp_payment_id, status, payment_method, total_amount, created_at, customers(nome, email, telefone)")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("customers")
        .select("id, nome, email, telefone, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (ordersResult.error) {
      setError(ordersResult.error.message);
    } else {
      setOrders((ordersResult.data || []) as OrderRow[]);
    }

    if (customersResult.error) {
      setError(customersResult.error.message);
    } else {
      setCustomers(customersResult.data || []);
    }

    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const approvedRevenueInCents = orders
    .filter((order) => order.status === "approved")
    .reduce((sum, order) => sum + Math.round(Number(order.total_amount || 0) * 100), 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_40%,#f5f3ff_100%)] px-4 py-8 font-fredoka">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-[0_20px_70px_rgba(2,8,23,0.1)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Area de Gerenciamento</h1>
              <p className="text-sm text-gray-500">Vendas, clientes e materiais conectados ao Supabase.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/materiais"
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-gray-600 transition hover:border-blue-300 hover:text-blue-700"
              >
                Materiais
              </Link>
              <button
                onClick={() => void loadData()}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-gray-600 transition hover:border-blue-300 hover:text-blue-700"
              >
                <RefreshCcw size={14} />
                Atualizar
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-red-600"
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
          </div>
        </div>

        {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</p> : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-[0_10px_35px_rgba(2,8,23,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Pedidos</p>
            <p className="mt-2 text-3xl font-black text-gray-900">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-[0_10px_35px_rgba(2,8,23,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Receita aprovada</p>
            <p className="mt-2 text-3xl font-black text-gray-900">{formatCurrency(approvedRevenueInCents)}</p>
          </div>
          <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-[0_10px_35px_rgba(2,8,23,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-500">Clientes</p>
            <p className="mt-2 text-3xl font-black text-gray-900">{customers.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-white bg-white/95 p-6 shadow-[0_20px_60px_rgba(2,8,23,0.09)]">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingCart className="text-blue-600" size={18} />
              <h2 className="text-xl font-black text-gray-900">Ultimas vendas</h2>
            </div>
            <div className="space-y-3">
              {loading && !sessionReady ? <p className="text-sm text-gray-500">Carregando...</p> : null}
              {!loading && orders.length === 0 ? <p className="text-sm text-gray-500">Nenhuma venda registrada.</p> : null}
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-gray-900">{order.customers?.nome || "Cliente"}</p>
                      <p className="text-xs text-gray-500">{order.customers?.email}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                    <span>MP: {order.mp_payment_id}</span>
                    <span className="font-black text-gray-800">{formatCurrency(Math.round(Number(order.total_amount) * 100))}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white bg-white/95 p-6 shadow-[0_20px_60px_rgba(2,8,23,0.09)]">
            <div className="mb-4 flex items-center gap-2">
              <Users className="text-purple-600" size={18} />
              <h2 className="text-xl font-black text-gray-900">Clientes recentes</h2>
            </div>
            <div className="space-y-3">
              {loading && !sessionReady ? <p className="text-sm text-gray-500">Carregando...</p> : null}
              {!loading && customers.length === 0 ? <p className="text-sm text-gray-500">Nenhum cliente salvo.</p> : null}
              {customers.map((customer) => (
                <div key={customer.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-black text-gray-900">{customer.nome}</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-xs text-gray-600">
                    <Mail size={12} />
                    {customer.email}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2 text-xs text-gray-600">
                    <Phone size={12} />
                    {customer.telefone || "Nao informado"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
