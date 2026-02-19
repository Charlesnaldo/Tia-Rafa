"use client";

import { useEffect, useMemo, useState } from "react";
import { type Produto } from "@/constants/produtos";

type ProductOverride = {
  id: string;
  nome: string;
  descricao: string | null;
  preco_cents: number;
  tipo: "digital" | "fisico";
  imagem_url: string | null;
  imagem_urls?: string[];
  material_path: string | null;
};

type ProductsApiResponse = {
  products?: ProductOverride[];
};

let productsCache: Record<string, Produto> | null = null;
let productsCachePromise: Promise<Record<string, Produto>> | null = null;

function normalizeImageUrl(value: string | null | undefined) {
  if (!value) return "/embreve.jpg";
  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) return value;
  return "/embreve.jpg";
}

function buildCatalogWithOverrides(overrides: ProductOverride[]): Record<string, Produto> {
  const nextCatalog: Record<string, Produto> = {};

  for (const override of overrides) {
    const overrideImages = Array.isArray(override.imagem_urls)
      ? override.imagem_urls
          .filter((img) => typeof img === "string" && img.length > 0)
          .map((img) => normalizeImageUrl(img))
      : [];
    const primaryImage = overrideImages[0] || normalizeImageUrl(override.imagem_url);
    const current = nextCatalog[override.id];
    if (!current) {
      nextCatalog[override.id] = {
        id: override.id,
        nome: override.nome || override.id,
        preco: Number.isFinite(override.preco_cents) ? Number(override.preco_cents) : 0,
        tipo: override.tipo === "fisico" ? "fisico" : "digital",
        imagem: primaryImage,
        imagens: overrideImages.length > 0 ? overrideImages : [primaryImage],
        arquivoLocal: override.material_path || undefined,
        cor: "bg-blue-100",
        descricao: override.descricao || "Material cadastrado no painel administrativo.",
        tags: ["Novo"],
        estrelas: 5,
      };
      continue;
    }

    nextCatalog[override.id] = {
      ...current,
      nome: override.nome || current.nome,
      descricao: override.descricao ?? current.descricao,
      preco: Number.isFinite(override.preco_cents) ? Number(override.preco_cents) : current.preco,
      tipo: override.tipo === "fisico" ? "fisico" : "digital",
      imagem: primaryImage || current.imagem,
      imagens: overrideImages.length > 0
        ? overrideImages
        : current.imagens,
      arquivoLocal: override.material_path ?? current.arquivoLocal,
    };
  }

  return nextCatalog;
}

async function fetchProductsFromApi() {
  if (productsCache) return productsCache;
  if (!productsCachePromise) {
    productsCachePromise = (async () => {
      const response = await fetch("/api/products");
      if (!response.ok) return {};

      const data = (await response.json()) as ProductsApiResponse;
      const next = Array.isArray(data.products) ? buildCatalogWithOverrides(data.products) : {};
      productsCache = next;
      return next;
    })().finally(() => {
      productsCachePromise = null;
    });
  }

  return productsCachePromise;
}

export function useProductsCatalog() {
  const [loaded, setLoaded] = useState(false);
  const [productsById, setProductsById] = useState<Record<string, Produto>>(productsCache || {});

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const products = await fetchProductsFromApi();
        if (cancelled) return;
        setProductsById(products);
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
