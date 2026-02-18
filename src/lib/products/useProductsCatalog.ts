"use client";

import { useEffect, useMemo, useState } from "react";
import { PRODUTOS_LISTA, type Produto } from "@/constants/produtos";

type ProductOverride = {
  id: string;
  nome: string;
  preco_cents: number;
  tipo: "digital" | "fisico";
};

type ProductsApiResponse = {
  products?: ProductOverride[];
};

function buildCatalogWithOverrides(overrides: ProductOverride[]): Record<string, Produto> {
  const nextCatalog: Record<string, Produto> = Object.fromEntries(
    Object.entries(PRODUTOS_LISTA).map(([id, product]) => [id, { ...product }])
  );

  for (const override of overrides) {
    const current = nextCatalog[override.id];
    if (!current) continue;

    nextCatalog[override.id] = {
      ...current,
      nome: override.nome || current.nome,
      preco: Number.isFinite(override.preco_cents) ? Number(override.preco_cents) : current.preco,
      tipo: override.tipo === "fisico" ? "fisico" : "digital",
    };
  }

  return nextCatalog;
}

export function useProductsCatalog() {
  const [productsById, setProductsById] = useState<Record<string, Produto>>(() => {
    return Object.fromEntries(
      Object.entries(PRODUTOS_LISTA).map(([id, product]) => [id, { ...product }])
    );
  });

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
        // fallback para PRODUTOS_LISTA local
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
  };
}
