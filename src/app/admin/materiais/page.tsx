"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { listProductImagePaths, resolveStorageImageUrl } from "@/lib/supabase/storage-images";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  nome: string;
  descricao: string | null;
  preco_cents: number;
  tipo: string;
  is_active: boolean;
  imagem_url: string | null;
  material_path: string | null;
};

type OrderItemRow = {
  product_id: string;
  quantity: number;
};

type EditableProduct = {
  id: string;
  nome: string;
  descricao: string;
  tipo: "digital" | "fisico";
  isActive: boolean;
  precoCents: number;
  imagemUrl: string | null;
  imagePaths: string[];
  imagePreviewUrls: Array<string | null>;
  materialPath: string | null;
  soldQuantity: number;
};

type NewProductForm = {
  id: string;
  nome: string;
  descricao: string;
  tipo: "digital" | "fisico";
  isActive: boolean;
  preco: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadStorageFile(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  productId: string,
  file: File,
  kind: "pdf" | "image"
) {
  const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
  const folder = kind === "pdf" ? "pdf" : "imagens";
  const storagePath = `${productId}/${folder}/${Date.now()}-${safeName}`;
  const uploadResult = await supabase.storage.from("materiais").upload(storagePath, file, { upsert: true });
  if (uploadResult.error) throw new Error(uploadResult.error.message);
  return storagePath;
}

export default function AdminMateriaisPage() {
  const router = useRouter();

  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState<"create" | "manage">("create");
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [newProduct, setNewProduct] = useState<NewProductForm>({
    id: "",
    nome: "",
    descricao: "",
    tipo: "digital",
    isActive: true,
    preco: "",
  });
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);

  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editTipo, setEditTipo] = useState<"digital" | "fisico">("digital");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPreco, setEditPreco] = useState("");
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((produto) => produto.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  useEffect(() => {
    if (!selectedProduct) return;
    setEditNome(selectedProduct.nome);
    setEditDescricao(selectedProduct.descricao || "");
    setEditTipo(selectedProduct.tipo);
    setEditIsActive(selectedProduct.isActive);
    setEditPreco((selectedProduct.precoCents / 100).toFixed(2));
  }, [selectedProduct]);

  const ensureSupabaseSession = useCallback(async () => {
    let supabase;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      setError("Supabase nao configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return null;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      router.push("/admin/login");
      return null;
    }

    setSessionReady(true);
    return supabase;
  }, [router]);

  const loadProducts = useCallback(async () => {
    setError(null);
    setLoading(true);

    const supabase = await ensureSupabaseSession();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const [productsResult, salesResult] = await Promise.all([
      supabase
        .from("products")
        .select("id, nome, descricao, preco_cents, tipo, is_active, imagem_url, material_path")
        .order("created_at", { ascending: false }),
      supabase.from("order_items").select("product_id, quantity"),
    ]);

    if (productsResult.error) {
      setError(productsResult.error.message);
      setLoading(false);
      return;
    }

    if (salesResult.error) {
      setError(salesResult.error.message);
      setLoading(false);
      return;
    }

    const salesByProduct = new Map<string, number>();
    for (const row of (salesResult.data || []) as OrderItemRow[]) {
      const current = salesByProduct.get(row.product_id) || 0;
      salesByProduct.set(row.product_id, current + Number(row.quantity || 0));
    }

    const normalized = await Promise.all(
      ((productsResult.data || []) as ProductRow[]).map(async (row) => {
        const tipo: "digital" | "fisico" = row.tipo === "fisico" ? "fisico" : "digital";
        const imagePaths = await listProductImagePaths(supabase, row.id, row.imagem_url);
        const imagePreviewUrls = await Promise.all(imagePaths.map((imagePath) => resolveStorageImageUrl(supabase, imagePath)));

        return {
          id: row.id,
          nome: row.nome || row.id,
          descricao: row.descricao || "",
          precoCents: Number.isFinite(row.preco_cents) ? Number(row.preco_cents) : 0,
          tipo,
          isActive: row.is_active !== false,
          imagemUrl: row.imagem_url,
          imagePaths,
          imagePreviewUrls,
          materialPath: row.material_path,
          soldQuantity: salesByProduct.get(row.id) || 0,
        };
      })
    );

    setProducts(normalized);
    const selectedAfterLoad = normalized.find((product) => product.id === selectedProductId) || normalized[0] || null;
    setSelectedProductId(selectedAfterLoad?.id || "");
    setLoading(false);
  }, [ensureSupabaseSession, selectedProductId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  const handleCreateProduct = async () => {
    const nome = newProduct.nome.trim();
    const id = (newProduct.id.trim() || slugify(nome));
    const descricao = newProduct.descricao.trim();
    const preco = Number(newProduct.preco.replace(",", "."));

    if (!nome) return setError("Informe o nome do produto.");
    if (!id) return setError("Informe um slug valido para o produto.");
    if (!Number.isFinite(preco) || preco <= 0) return setError("Informe um preco valido para o novo produto.");
    if (products.some((product) => product.id === id)) return setError("Ja existe um produto com esse ID.");

    const supabase = await ensureSupabaseSession();
    if (!supabase) return;

    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      const uploadedImagePaths = await Promise.all(
        newImageFiles.map((file) => uploadStorageFile(supabase, id, file, "image"))
      );
      const imagemUrl = uploadedImagePaths[0] || null;
      const materialPath = newPdfFile ? await uploadStorageFile(supabase, id, newPdfFile, "pdf") : null;

      const { error: insertError } = await supabase.from("products").upsert(
        {
          id,
          nome,
          descricao: descricao || null,
          preco_cents: Math.round(preco * 100),
          tipo: newProduct.tipo,
          imagem_url: imagemUrl,
          material_path: materialPath,
          is_active: newProduct.isActive,
        },
        { onConflict: "id" }
      );

      if (insertError) throw new Error(insertError.message);

      setNewProduct({ id: "", nome: "", descricao: "", tipo: "digital", isActive: true, preco: "" });
      setNewImageFiles([]);
      setNewPdfFile(null);
      setPanel("manage");
      await loadProducts();
      setSelectedProductId(id);
      setSuccessMessage("Produto criado com sucesso com todos os dados.");
    } catch (createError: unknown) {
      const message = createError instanceof Error ? createError.message : String(createError);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProductData = async () => {
    if (!selectedProduct) return;
    const nome = editNome.trim();
    const descricao = editDescricao.trim();
    const preco = Number(editPreco.replace(",", "."));

    if (!nome) return setError("Informe o nome do produto.");
    if (!Number.isFinite(preco) || preco <= 0) return setError("Informe um preco valido.");

    const supabase = await ensureSupabaseSession();
    if (!supabase) return;

    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    const { error: updateError } = await supabase
      .from("products")
      .upsert(
        {
          id: selectedProduct.id,
          nome,
          descricao: descricao || null,
          tipo: editTipo,
          is_active: editIsActive,
          preco_cents: Math.round(preco * 100),
          imagem_url: selectedProduct.imagemUrl,
          material_path: selectedProduct.materialPath,
        },
        { onConflict: "id" }
      );

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadProducts();
    setSuccessMessage("Dados do produto atualizados.");
  };

  const handleUploadForSelected = async (kind: "pdf" | "image") => {
    if (!selectedProduct) return;
    const hasFile = kind === "pdf" ? Boolean(editPdfFile) : editImageFiles.length > 0;
    if (!hasFile) {
      setError(kind === "pdf" ? "Selecione um PDF para enviar." : "Selecione uma imagem para enviar.");
      return;
    }

    const supabase = await ensureSupabaseSession();
    if (!supabase) return;

    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      const uploadedImagePaths =
        kind === "image"
          ? await Promise.all(editImageFiles.map((file) => uploadStorageFile(supabase, selectedProduct.id, file, "image")))
          : [];
      const storagePath =
        kind === "pdf"
          ? await uploadStorageFile(supabase, selectedProduct.id, editPdfFile as File, "pdf")
          : uploadedImagePaths[0] || selectedProduct.imagemUrl;
      const payload =
        kind === "pdf"
          ? { material_path: storagePath, imagem_url: selectedProduct.imagemUrl }
          : { imagem_url: storagePath, material_path: selectedProduct.materialPath };

      const { error: updateError } = await supabase
        .from("products")
        .update(payload)
        .eq("id", selectedProduct.id);

      if (updateError) throw new Error(updateError.message);

      if (kind === "pdf") setEditPdfFile(null);
      if (kind === "image") setEditImageFiles([]);

      await loadProducts();
      setSuccessMessage(kind === "pdf" ? "PDF atualizado com sucesso." : "Imagens atualizadas com sucesso.");
    } catch (uploadError: unknown) {
      const message = uploadError instanceof Error ? uploadError.message : String(uploadError);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImageForSelected = async (imagePath: string) => {
    if (!selectedProduct) return;

    const supabase = await ensureSupabaseSession();
    if (!supabase) return;

    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      const { error: removeError } = await supabase.storage.from("materiais").remove([imagePath]);
      if (removeError) throw new Error(removeError.message);

      const nextImagePaths = selectedProduct.imagePaths.filter((path) => path !== imagePath);
      const nextMainImage = selectedProduct.imagemUrl === imagePath ? nextImagePaths[0] || null : selectedProduct.imagemUrl;

      const { error: updateError } = await supabase
        .from("products")
        .update({ imagem_url: nextMainImage })
        .eq("id", selectedProduct.id);

      if (updateError) throw new Error(updateError.message);

      await loadProducts();
      setSuccessMessage("Imagem removida com sucesso.");
    } catch (deleteError: unknown) {
      const message = deleteError instanceof Error ? deleteError.message : String(deleteError);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    let supabase;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      router.push("/admin/login");
      return;
    }

    await supabase.auth.signOut();
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#f5f3ff_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {!sessionReady && loading ? (
          <div className="rounded-[2rem] border border-white bg-white/95 p-8 text-sm font-bold text-gray-500 shadow-[0_20px_70px_rgba(2,8,23,0.12)]">
            Validando login...
          </div>
        ) : null}

        {sessionReady ? (
          <div className="rounded-[2rem] border border-white bg-white/95 p-8 shadow-[0_20px_70px_rgba(2,8,23,0.12)]">
            <Link
              href="/admin"
              className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500 transition hover:text-gray-700"
            >
              <ArrowLeft size={14} />
              Voltar para painel
            </Link>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="mb-6 ml-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-500 transition hover:text-red-700"
            >
              Sair
            </button>

            <h1 className="text-3xl font-black text-gray-900">Gerenciar produtos</h1>
            <p className="mt-2 text-sm text-gray-500">Cadastro completo, uploads e edicao de nome, descricao, preco e arquivos.</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPanel("create")}
                className={`rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                  panel === "create" ? "bg-indigo-600 text-white" : "border border-gray-200 bg-white text-gray-600"
                }`}
              >
                Criar Produto Completo
              </button>
              <button
                type="button"
                onClick={() => setPanel("manage")}
                className={`rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                  panel === "manage" ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-600"
                }`}
              >
                Gerenciar Produto Existente
              </button>
            </div>

            {panel === "create" ? (
              <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
                <h2 className="text-lg font-black text-gray-900">Novo produto</h2>
                <p className="mt-1 text-xs text-gray-500">Defina nome, descricao, preco, foto e PDF em um fluxo unico.</p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Nome</span>
                    <input
                      type="text"
                      value={newProduct.nome}
                      onChange={(event) => {
                        const nome = event.target.value;
                        setNewProduct((prev) => ({ ...prev, nome, id: prev.id || slugify(nome) }));
                      }}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                      placeholder="Nome do produto"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Slug (id)</span>
                    <input
                      type="text"
                      value={newProduct.id}
                      onChange={(event) => setNewProduct((prev) => ({ ...prev, id: slugify(event.target.value) }))}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                      placeholder="produto-novo"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Tipo</span>
                    <select
                      value={newProduct.tipo}
                      onChange={(event) =>
                        setNewProduct((prev) => ({ ...prev, tipo: event.target.value === "fisico" ? "fisico" : "digital" }))
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                    >
                      <option value="digital">Digital</option>
                      <option value="fisico">Fisico</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Status</span>
                    <select
                      value={newProduct.isActive ? "ativo" : "inativo"}
                      onChange={(event) =>
                        setNewProduct((prev) => ({ ...prev, isActive: event.target.value === "ativo" }))
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Preco (R$)</span>
                    <input
                      type="text"
                      value={newProduct.preco}
                      onChange={(event) => setNewProduct((prev) => ({ ...prev, preco: event.target.value }))}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                      placeholder="39.90"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Descricao</span>
                    <textarea
                      value={newProduct.descricao}
                      onChange={(event) => setNewProduct((prev) => ({ ...prev, descricao: event.target.value }))}
                      className="min-h-28 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                      placeholder="Descricao do produto"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Fotos do produto</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setNewImageFiles(Array.from(event.target.files || []))
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Formatos: JPG, JPEG, PNG, WEBP, GIF, AVIF. Selecione uma ou mais imagens.
                    </p>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">PDF do material</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setNewPdfFile(event.target.files?.[0] || null)}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => void handleCreateProduct()}
                  disabled={saving}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  Criar Produto Completo
                </button>
              </section>
            ) : (
              <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
                <h2 className="text-lg font-black text-gray-900">Gerenciar produto existente</h2>
                <p className="mt-1 text-xs text-gray-500">Veja imagem atual, altere nome, descricao, preco e troque arquivos.</p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Produto</span>
                    <select
                      value={selectedProductId}
                      onChange={(event) => setSelectedProductId(event.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                    >
                      {products.map((produto) => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome} {produto.isActive ? "" : "[Inativo]"}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Fotos atuais</p>
                    <div className="mt-3 grid min-h-48 grid-cols-2 gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
                      {selectedProduct?.imagePaths && selectedProduct.imagePaths.length > 0 ? (
                        selectedProduct.imagePaths.map((imagePath, index) => (
                          <div key={imagePath} className="relative overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                            {selectedProduct.imagePreviewUrls[index] ? (
                              <Image
                                src={selectedProduct.imagePreviewUrls[index] || ""}
                                alt={`${selectedProduct.nome} ${index + 1}`}
                                width={120}
                                height={96}
                                unoptimized
                                className="h-24 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-24 w-full items-center justify-center text-[10px] font-bold text-gray-400">
                                Preview indisponivel
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => void handleDeleteImageForSelected(imagePath)}
                              disabled={saving}
                              className="absolute right-1 top-1 inline-flex cursor-pointer items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-700 disabled:bg-gray-300"
                            >
                              <Trash2 size={11} />
                              Apagar
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="col-span-2 self-center text-center text-xs font-bold text-gray-400">Sem imagem cadastrada</p>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-gray-500 break-all">Principal: {selectedProduct?.imagemUrl || "-"}</p>
                    <p className="mt-1 text-xs text-gray-500">Total de imagens: {selectedProduct?.imagePaths.length || 0}</p>
                    <p className="mt-1 text-xs text-gray-500">Vendidos: {selectedProduct?.soldQuantity || 0}</p>
                    <p className="mt-1 text-xs text-gray-500">Status: {selectedProduct?.isActive ? "Ativo" : "Inativo"}</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Nome</span>
                      <input
                        type="text"
                        value={editNome}
                        onChange={(event) => setEditNome(event.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Tipo</span>
                      <select
                        value={editTipo}
                        onChange={(event) => setEditTipo(event.target.value === "fisico" ? "fisico" : "digital")}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                      >
                        <option value="digital">Digital</option>
                        <option value="fisico">Fisico</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Status</span>
                      <select
                        value={editIsActive ? "ativo" : "inativo"}
                        onChange={(event) => setEditIsActive(event.target.value === "ativo")}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Preco (R$)</span>
                      <input
                        type="text"
                        value={editPreco}
                        onChange={(event) => setEditPreco(event.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                      />
                      <p className="mt-1 text-xs text-gray-500">Preco atual: {selectedProduct ? formatCurrency(selectedProduct.precoCents) : "-"}</p>
                    </label>
                  </div>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Descricao</span>
                    <textarea
                      value={editDescricao}
                      onChange={(event) => setEditDescricao(event.target.value)}
                      className="min-h-28 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                    />
                  </label>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <h3 className="text-sm font-black text-gray-900">Adicionar imagens</h3>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setEditImageFiles(Array.from(event.target.files || []))
                      }
                      className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                    />
                    <p className="mt-2 text-xs text-gray-500">Você pode selecionar várias imagens de uma vez.</p>
                    <button
                      type="button"
                      onClick={() => void handleUploadForSelected("image")}
                      disabled={saving || !selectedProduct}
                      className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-purple-700 disabled:bg-gray-300"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                      Enviar imagens
                    </button>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <h3 className="text-sm font-black text-gray-900">Trocar PDF</h3>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setEditPdfFile(event.target.files?.[0] || null)}
                      className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                    />
                    <p className="mt-2 text-xs text-gray-500 break-all">Atual: {selectedProduct?.materialPath || "-"}</p>
                    <button
                      type="button"
                      onClick={() => void handleUploadForSelected("pdf")}
                      disabled={saving || !selectedProduct}
                      className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-emerald-700 disabled:bg-gray-300"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      Enviar PDF
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleSaveProductData()}
                  disabled={saving || !selectedProduct}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Salvar dados do produto
                </button>
              </section>
            )}

            {loading ? <p className="mt-6 text-sm text-gray-500">Carregando dados...</p> : null}
            {error ? <p className="mt-6 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p> : null}
            {successMessage ? <p className="mt-6 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{successMessage}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
