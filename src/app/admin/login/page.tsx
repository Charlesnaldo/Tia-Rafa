"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#f5f3ff_100%)] px-4 py-14 font-fredoka">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white bg-white/95 p-8 shadow-[0_20px_70px_rgba(2,8,23,0.12)]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500 transition hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Voltar ao site
        </Link>

        <h1 className="text-3xl font-black text-gray-900">Painel Admin</h1>
        <p className="mt-2 text-sm text-gray-500">Entre com seu usuário do Supabase Auth.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Email</span>
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <Mail size={16} className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none"
                placeholder="admin@seudominio.com"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Senha</span>
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <Lock size={16} className="text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none"
                placeholder="********"
                required
              />
            </div>
          </label>

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-blue-700 disabled:bg-gray-300"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
