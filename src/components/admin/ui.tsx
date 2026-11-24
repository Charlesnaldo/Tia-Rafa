import type { ReactNode } from "react";
import { Database, Download } from "lucide-react";
import { isMissingSchema } from "@/lib/supabase/missing-schema";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-black text-slate-900">{title}</h1>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ title, children, className = "", actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title || actions ? (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title ? <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

// KPI tile: label, value and an optional context line (never color alone).
export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function Button({ children, variant = "secondary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const styles = {
    primary: "bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-300",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:text-violet-700 disabled:opacity-50",
    danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50",
  }[variant];
  return (
    <button type="button" {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${styles} ${props.className ?? ""}`}>
      {children}
    </button>
  );
}

export function CsvButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return <Button onClick={onClick} disabled={disabled}><Download size={14} /> Exportar CSV</Button>;
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "green" | "amber" | "violet" | "red" | "blue" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-800",
    violet: "bg-violet-100 text-violet-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${tones}`}>{children}</span>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{children}</p>;
}

// Shown when a feature's table does not exist yet: the fix is running the SQL migration.
export function MigrationNotice({ error }: { error: { code?: string; message?: string } | null | undefined }) {
  if (!error) return null;
  if (!isMissingSchema(error)) {
    return <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error.message || "Erro ao carregar dados."}</p>;
  }
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <Database size={18} className="mt-0.5 shrink-0" />
      <p>
        Este recurso precisa da migração do banco. Abra o Supabase &gt; SQL Editor, cole o conteúdo de
        <code className="mx-1 rounded bg-amber-100 px-1">scripts/migrations/2026-11-23-vendas.sql</code>e clique em Run.
      </p>
    </div>
  );
}

export const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400";
