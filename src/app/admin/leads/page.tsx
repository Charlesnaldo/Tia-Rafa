"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw, Search } from "lucide-react";
import { useAdminSupabase } from "@/lib/admin/useAdminSupabase";
import { downloadCsv, formatDateTime } from "@/lib/admin/csv";
import { Badge, Button, Card, CsvButton, EmptyState, MigrationNotice, PageHeader, inputClass } from "@/components/admin/ui";
import WhatsAppLink from "@/components/admin/WhatsAppLink";

type Lead = {
  id: string;
  email: string;
  nome: string | null;
  telefone: string | null;
  source: string;
  marketing_consent: boolean;
  created_at: string;
};

export default function AdminLeadsPage() {
  const { supabase, ready, error: sessionError } = useAdminSupabase();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [buyers, setBuyers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ code?: string; message?: string } | null>(null);
  const [query, setQuery] = useState("");
  const [onlyConsent, setOnlyConsent] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const [leadsResult, customersResult] = await Promise.all([
      supabase.from("leads").select("id, email, nome, telefone, source, marketing_consent, created_at")
        .order("created_at", { ascending: false }).limit(2000),
      supabase.from("customers").select("email").limit(5000),
    ]);
    setLoadError(leadsResult.error);
    setLeads((leadsResult.data as Lead[] | null) ?? []);
    setBuyers(new Set((customersResult.data ?? []).map((row) => String(row.email).toLowerCase())));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return leads.filter((lead) => (!onlyConsent || lead.marketing_consent)
      && (!text || [lead.nome, lead.email, lead.telefone].some((value) => value?.toLowerCase().includes(text))));
  }, [leads, query, onlyConsent]);

  const isBuyer = (lead: Lead) => buyers.has(lead.email.toLowerCase());
  const converted = leads.filter(isBuyer).length;
  const consenting = leads.filter((lead) => lead.marketing_consent).length;

  const exportCsv = () => downloadCsv("leads.csv", visible.map((lead) => ({
    nome: lead.nome ?? "",
    email: lead.email,
    whatsapp: lead.telefone ?? "",
    aceita_novidades: lead.marketing_consent ? "sim" : "nao",
    ja_comprou: isBuyer(lead) ? "sim" : "nao",
    origem: lead.source,
    data: formatDateTime(lead.created_at),
  })));

  if (!ready) return <p className="text-sm text-slate-500">Validando login...</p>;
  if (sessionError) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{sessionError}</p>;

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${leads.length} pessoas baixaram material grátis · ${converted} já compraram · ${consenting} aceitam receber novidades`}
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
      <p className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
        Pela LGPD, envie novidades e promoções só para quem marcou <strong>Aceita novidades</strong>.
      </p>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, e-mail ou WhatsApp" aria-label="Buscar leads" className={`${inputClass} pl-9`} />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={onlyConsent} onChange={(e) => setOnlyConsent(e.target.checked)} /> Só quem aceita novidades
        </label>
      </div>
      <Card>
        {loading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : visible.length === 0 ? (
          <EmptyState>Nenhum lead ainda. Divulgue a página /atividades.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Pessoa</th>
                  <th className="py-2 pr-3">Contato</th>
                  <th className="py-2 pr-3">Situação</th>
                  <th className="py-2">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((lead) => (
                  <tr key={lead.id}>
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-slate-900">{lead.nome || "—"}</p>
                      <p className="text-xs text-slate-500">{lead.email}</p>
                    </td>
                    <td className="py-3 pr-3">{lead.marketing_consent ? <WhatsAppLink phone={lead.telefone} name={lead.nome} /> : null}</td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap gap-1">
                        {isBuyer(lead) ? <Badge tone="green">Já comprou</Badge> : <Badge>Ainda não comprou</Badge>}
                        {lead.marketing_consent ? <Badge tone="violet">Aceita novidades</Badge> : null}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{formatDateTime(lead.created_at)}</td>
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
