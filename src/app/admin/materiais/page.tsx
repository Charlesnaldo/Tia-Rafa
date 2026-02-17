"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { PRODUTOS_LISTA } from "@/constants/produtos";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminMateriaisPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [produtoId, setProdutoId] = useState(Object.keys(PRODUTOS_LISTA)[0] || "");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setError(null);
    setSuccessMessage(null);
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/admin/login");
      return;
    }

    if (!produtoId) {
      setError("Selecione um produto.");
      return;
    }

    if (!file) {
      setError("Selecione um arquivo para upload.");
      return;
    }

    setUploading(true);

    const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
    const storagePath = `${produtoId}/${Date.now()}-${safeName}`;

    const uploadResult = await supabase.storage
      .from("materiais")
      .upload(storagePath, file, { upsert: true });

    if (uploadResult.error) {
      setUploading(false);
      setError(uploadResult.error.message);
      return;
    }

    const product = PRODUTOS_LISTA[produtoId];
    const upsertProductResult = await supabase.from("products").upsert(
      {
        id: produtoId,
        nome: product?.nome || produtoId,
        preco_cents: product?.preco || 0,
        tipo: product?.tipo || "digital",
        imagem_url: product?.imagens?.[0] || product?.imagem || null,
        material_path: storagePath,
        is_active: true,
      },
      { onConflict: "id" }
    );

    setUploading(false);

    if (upsertProductResult.error) {
      setError(upsertProductResult.error.message);
      return;
    }

    setSuccessMessage(`Arquivo enviado com sucesso para ${storagePath}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#f5f3ff_100%)] px-4 py-10 font-fredoka">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-white bg-white/95 p-8 shadow-[0_20px_70px_rgba(2,8,23,0.12)]">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500 transition hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Voltar para painel
        </Link>

        <h1 className="text-3xl font-black text-gray-900">Upload de Materiais</h1>
        <p className="mt-2 text-sm text-gray-500">Envia arquivo para o bucket `materiais` e vincula ao produto no banco.</p>

        <form className="mt-8 space-y-4" onSubmit={handleUpload}>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Produto</span>
            <select
              value={produtoId}
              onChange={(event) => setProdutoId(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
            >
              {Object.values(PRODUTOS_LISTA).map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Arquivo (PDF)</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
            />
          </label>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p> : null}
          {successMessage ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{successMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={uploading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-blue-700 disabled:bg-gray-300"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Enviar arquivo
          </button>
        </form>
      </div>
    </div>
  );
}
