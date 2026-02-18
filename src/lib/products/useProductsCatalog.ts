"use client";

import { useEffect, useMemo, useState } from "react";
import { type Produto } from "@/constants/produtos";

type ProductOverride = {
  id: string;
  nome: string;
  preco_cents: number;
  tipo: "digital" | "fisico";
  imagem_url: string | null;
  material_path: string | null;
};

type ProductsApiResponse = {
  products?: ProductOverride[];
};

function buildCatalogWithOverrides(overrides: ProductOverride[]): Record<string, Produto> {
  const nextCatalog: Record<string, Produto> = {};

  for (const override of overrides) {
    const current = nextCatalog[override.id];
    if (!current) {
      nextCatalog[override.id] = {
        id: override.id,
        nome: override.nome || override.id,
        preco: Number.isFinite(override.preco_cents) ? Number(override.preco_cents) : 0,
        tipo: override.tipo === "fisico" ? "fisico" : "digital",
        imagem: override.imagem_url || "/embreve.jpg",
        imagens: override.imagem_url ? [override.imagem_url] : ["/embreve.jpg"],
        arquivoLocal: override.material_path || undefined,
        cor: "bg-blue-100",
        descricao: "Material cadastrado no painel administrativo.",
        tags: ["Novo"],
        estrelas: 5,
      };
      continue;
    }

    nextCatalog[override.id] = {
      ...current,
      nome: override.nome || current.nome,
      preco: Number.isFinite(override.preco_cents) ? Number(override.preco_cents) : current.preco,
      tipo: override.tipo === "fisico" ? "fisico" : "digital",
      imagem: override.imagem_url ?? current.imagem,
      imagens: override.imagem_url
        ? [override.imagem_url, ...(current.imagens || []).filter((img) => img !== override.imagem_url)]
        : current.imagens,
      arquivoLocal: override.material_path ?? current.arquivoLocal,
    };
  }

  return nextCatalog;
}

export function useProductsCatalog() {
  const [loaded, setLoaded] = useState(false);
  const [productsById, setProductsById] = useState<Record<string, Produto>>({});

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as ProductsApiResponse;
        if (cancelled || !Array.isArray(data.products)) return;

        setProductsById(buildCatalogWithOverrides(data.products));
      } catch {
        // sem fallback local
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    void loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const productsArray = useMemo(() => Object.values(productsById), [productsById]);

  return {
    productsById,
    productsArray,
    loaded,
  };
}
