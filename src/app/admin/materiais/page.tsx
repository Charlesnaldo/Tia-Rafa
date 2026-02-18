"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, Loader2, Plus, Save, Upload } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProductOverrideRow = {
  id: string;
  nome: string;
  preco_cents: number;
  tipo: string;
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
  tipo: "digital" | "fisico";
  precoCents: number;
  imagemUrl: string | null;
  materialPath: string | null;
  soldQuantity: number;
};

type NewProductForm = {
  id: string;
  nome: string;
  tipo: "digital" | "fisico";
  preco: string;
};

const DEFAULT_PRODUCTS: EditableProduct[] = [];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminMateriaisPage() {
  const router = useRouter();

  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<EditableProduct[]>(DEFAULT_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState(DEFAULT_PRODUCTS[0]?.id || "");
  const [priceInput, setPriceInput] = useState(DEFAULT_PRODUCTS[0] ? (DEFAULT_PRODUCTS[0].precoCents / 100).toFixed(2) : "");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newProduct, setNewProduct] = useState<NewProductForm>({
    id: "",
    nome: "",
    tipo: "digital",
    preco: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((produto) => produto.id === selectedProductId) || null,
    [products, selectedProductId]
  );

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
        .select("id, nome, preco_cents, tipo, imagem_url, material_path"),
      supabase
        .from("order_items")
        .select("product_id, quantity"),
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

    const normalizedMap = new Map<string, EditableProduct>();

    for (const row of (productsResult.data || []) as ProductOverrideRow[]) {
      const existing = normalizedMap.get(row.id);
      if (existing) {
        normalizedMap.set(row.id, {
          ...existing,
          nome: row.nome || existing.nome,
          precoCents: Number.isFinite(row.preco_cents) ? Number(row.preco_cents) : existing.precoCents,
          tipo: row.tipo === "fisico" ? "fisico" : existing.tipo,
          imagemUrl: row.imagem_url ?? existing.imagemUrl,
          materialPath: row.material_path ?? existing.materialPath,
        });
      } else {
        normalizedMap.set(row.id, {
          id: row.id,
          nome: row.nome || row.id,
          precoCents: Number.isFinite(row.preco_cents) ? Number(row.preco_cents) : 0,
          tipo: row.tipo === "fisico" ? "fisico" : "digital",
          imagemUrl: row.imagem_url,
          materialPath: row.material_path,
          soldQuantity: 0,
        });
      }
    }

    const normalized = Array.from(normalizedMap.values()).map((product) => ({
      ...product,
      soldQuantity: salesByProduct.get(product.id) || 0,
    }));

    setProducts(normalized);
    const selectedAfterLoad = normalized.find((product) => product.id === selectedProductId) || normalized[0];
    if (selectedAfterLoad) {
      setSelectedProductId(selectedAfterLoad.id);
      setPriceInput((selectedAfterLoad.precoCents / 100).toFixed(2));
    }
    setLoading(false);
  }, [ensureSupabaseSession, selectedProductId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  const updateProductState = (productId: string, updates: Partial<EditableProduct>) => {
    setProducts((prev) => prev.map((product) => (product.id === productId ? { ...product, ...updates } : product)));
  };

  const upsertProduct = async (product: EditableProduct, updates?: Partial<EditableProduct>) => {
    const supabase = await ensureSupabaseSession();
    if (!supabase) return false;

    const nextProduct = { ...product, ...updates };

    const { error: upsertError } = await supabase.from("products").upsert(
      {
        id: nextProduct.id,
        nome: nextProduct.nome,
        preco_cents: nextProduct.precoCents,
        tipo: nextProduct.tipo,
        imagem_url: nextProduct.imagemUrl,
        material_path: nextProduct.materialPath,
        is_active: true,
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      setError(upsertError.message);
      return false;
    }

    updateProductState(nextProduct.id, updates || {});
    if (nextProduct.id === selectedProductId) {
      setPriceInput((nextProduct.precoCents / 100).toFixed(2));
    }
    return true;
  };

  const handleCreateProduct = async () => {
    const nome = newProduct.nome.trim();
    const id = (newProduct.id.trim() || slugify(nome));
    const preco = Number(newProduct.preco.replace(",", "."));

    if (!nome) {
      setError("Informe o nome do produto.");
      return;
    }
    if (!id) {
      setError("Informe um slug valido para o produto.");
      return;
    }
    if (!Number.isFinite(preco) || preco <= 0) {
      setError("Informe um preco valido para o novo produto.");
      return;
    }
    if (products.some((product) => product.id === id)) {
      setError("Ja existe um produto com esse ID.");
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    const baseProduct: EditableProduct = {
      id,
      nome,
      tipo: newProduct.tipo,
      precoCents: Math.round(preco * 100),
      imagemUrl: null,
      materialPath: null,
      soldQuantity: 0,
    };

    const ok = await upsertProduct(baseProduct);
    setSaving(false);

    if (!ok) return;

    setProducts((prev) => [...prev, baseProduct]);
    setSelectedProductId(baseProduct.id);
    setPriceInput((baseProduct.precoCents / 100).toFixed(2));
    setNewProduct({ id: "", nome: "", tipo: "digital", preco: "" });
    setSuccessMessage("Novo produto criado com sucesso. Agora voce pode subir imagem e PDF.");
  };

  const handleSavePrice = async () => {
    if (!selectedProduct) return;

    const normalizedPrice = Number(priceInput.replace(",", "."));
    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      setError("Informe um preco valido maior que zero.");
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    const ok = await upsertProduct(selectedProduct, {
      precoCents: Math.round(normalizedPrice * 100),
    });

    setSaving(false);
    if (ok) {
      setSuccessMessage("Preco atualizado com sucesso.");
    }
  };

  const handleUpload = async (kind: "pdf" | "image") => {
    if (!selectedProduct) return;

    const file = kind === "pdf" ? pdfFile : imageFile;
    if (!file) {
      setError(kind === "pdf" ? "Selecione um PDF para enviar." : "Selecione uma imagem para enviar.");
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    const supabase = await ensureSupabaseSession();
    if (!supabase) {
      setSaving(false);
      return;
    }

    const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
    const folder = kind === "pdf" ? "pdf" : "imagens";
    const storagePath = `${selectedProduct.id}/${folder}/${Date.now()}-${safeName}`;

    const uploadResult = await supabase.storage
      .from("materiais")
      .upload(storagePath, file, { upsert: true });

    if (uploadResult.error) {
      setError(uploadResult.error.message);
      setSaving(false);
      return;
    }

    const ok = await upsertProduct(selectedProduct, {
      materialPath: kind === "pdf" ? storagePath : selectedProduct.materialPath,
      imagemUrl: kind === "image" ? storagePath : selectedProduct.imagemUrl,
    });

    setSaving(false);

    if (ok) {
      if (kind === "pdf") {
        setPdfFile(null);
        setSuccessMessage("PDF atualizado com sucesso.");
      } else {
        setImageFile(null);
        setSuccessMessage("Imagem atualizada com sucesso.");
      }
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find((item) => item.id === productId);
    if (product) {
      setPriceInput((product.precoCents / 100).toFixed(2));
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#f5f3ff_100%)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
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

          <h1 className="text-3xl font-black text-gray-900">Gerenciar produtos</h1>
          <p className="mt-2 text-sm text-gray-500">Altere preco, troque foto, envie PDF e acompanhe quantidade de vendas.</p>

          <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="text-lg font-black text-gray-900">Novo produto</h2>
            <p className="mt-1 text-xs text-gray-500">Crie o produto no banco e depois envie imagem/PDF pelo Supabase Storage.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Nome</span>
                <input
                  type="text"
                  value={newProduct.nome}
                  onChange={(event) => {
                    const nome = event.target.value;
                    setNewProduct((prev) => ({
                      ...prev,
                      nome,
                      id: prev.id || slugify(nome),
                    }));
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
                  placeholder="meu-produto-novo"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Tipo</span>
                <select
                  value={newProduct.tipo}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, tipo: event.target.value === "fisico" ? "fisico" : "digital" }))}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                >
                  <option value="digital">Digital</option>
                  <option value="fisico">Fisico</option>
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
            </div>

            <button
              type="button"
              onClick={() => void handleCreateProduct()}
              disabled={saving}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-indigo-700 disabled:bg-gray-300"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Criar produto
            </button>
          </section>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Produto</span>
              <select
                value={selectedProductId}
                onChange={(event) => handleSelectProduct(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
              >
                {products.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Quantidade vendida</p>
              <p className="mt-2 text-3xl font-black text-gray-900">{selectedProduct?.soldQuantity || 0}</p>
              <p className="mt-1 text-xs text-gray-500">Baseado nos itens aprovados registrados.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="text-lg font-black text-gray-900">Preco</h2>
              <p className="mt-1 text-xs text-gray-500">Valor usado no checkout e no Mercado Pago.</p>

              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-400">Preco em reais</span>
                  <input
                    type="text"
                    value={priceInput}
                    onChange={(event) => setPriceInput(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                    placeholder="39.90"
                  />
                </label>

                <p className="text-xs text-gray-500">Preco atual: {selectedProduct ? formatCurrency(selectedProduct.precoCents) : "-"}</p>

                <button
                  type="button"
                  onClick={handleSavePrice}
                  disabled={saving || !selectedProduct}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Salvar preco
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="text-lg font-black text-gray-900">Imagem do produto</h2>
              <p className="mt-1 text-xs text-gray-500">Suba uma nova imagem para usar no cadastro do produto.</p>

              <div className="mt-4 space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setImageFile(event.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                />
                <p className="text-xs text-gray-500 break-all">Atual: {selectedProduct?.imagemUrl || "Nao definida"}</p>
                <button
                  type="button"
                  onClick={() => void handleUpload("image")}
                  disabled={saving || !selectedProduct}
                  className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-purple-700 disabled:bg-gray-300"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
                  Enviar imagem
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 lg:col-span-2">
              <h2 className="text-lg font-black text-gray-900">PDF do material</h2>
              <p className="mt-1 text-xs text-gray-500">Suba o PDF que sera associado ao produto.</p>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setPdfFile(event.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                  />
                  <p className="mt-2 text-xs text-gray-500 break-all">Atual: {selectedProduct?.materialPath || "Nao definido"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleUpload("pdf")}
                  disabled={saving || !selectedProduct}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-emerald-700 disabled:bg-gray-300"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  Enviar PDF
                </button>
              </div>
            </section>
          </div>

          {loading ? <p className="mt-6 text-sm text-gray-500">Carregando dados...</p> : null}
          {error ? <p className="mt-6 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p> : null}
          {successMessage ? <p className="mt-6 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{successMessage}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
