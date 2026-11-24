"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import {
  BarChart3, Boxes, ExternalLink, LogOut, Menu, Package, ShoppingCart, Tag, UserPlus, Users, X,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const NAV = [
  { href: "/admin", label: "Painel", icon: BarChart3 },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/leads", label: "Leads", icon: UserPlus },
  { href: "/admin/materiais", label: "Materiais", icon: Package },
  { href: "/admin/kits", label: "Kits", icon: Boxes },
  { href: "/admin/cupons", label: "Cupons", icon: Tag },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}<Toaster richColors position="top-right" /></>;
  }

  const logout = async () => {
    try {
      await getSupabaseBrowserClient().auth.signOut();
    } catch {
      // Not configured: the server cookie below is what protects /admin.
    }
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    router.push("/admin/login");
  };

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Administração">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          aria-current={isActive(href) ? "page" : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
            isActive(href) ? "bg-violet-100 text-violet-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Icon size={18} /> {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <p className="mb-6 px-3 text-lg font-black text-violet-700">Tia Rafa · Admin</p>
        {nav}
        <div className="mt-auto space-y-1">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            <ExternalLink size={18} /> Ver loja
          </Link>
          <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <p className="font-black text-violet-700">Tia Rafa · Admin</p>
          <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} className="rounded-lg p-2 hover:bg-slate-100">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
        {open ? (
          <div className="border-b border-slate-200 bg-white p-4 lg:hidden">
            {nav}
            <button type="button" onClick={() => void logout()} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
              <LogOut size={18} /> Sair
            </button>
          </div>
        ) : null}
        <div className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">{children}</div>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
