"use client";

import { useEffect, useMemo, useState } from "react";
import type { Produto } from "@/constants/produtos";
import { buildCatalogWithOverrides, type PublishedProduct } from "./catalog-model";

let productsCache: Record<string, Produto> | null = null;
let productsCachePromise: Promise<Record<string, Produto>> | null = null;

async function fetchProductsFromApi() {
  if (productsCache) return productsCache;
  if (!productsCachePromise) {
    productsCachePromise = (async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Catálogo indisponível.");
      const data = await response.json() as { products?: PublishedProduct[] };
      const products = buildCatalogWithOverrides(data.products || []);
      productsCache = products;
      return products;
    })().finally(() => { productsCachePromise = null; });
  }
  return productsCachePromise;
}

// Kept for the existing product detail / cart flows. Home receives server data.
export function useProductsCatalog() {
  const [loaded, setLoaded] = useState(Boolean(productsCache));
  const [productsById, setProductsById] = useState<Record<string, Produto>>(productsCache || {});
  useEffect(() => {
    let cancelled = false;
    void fetchProductsFromApi().then(products => {
      if (!cancelled) setProductsById(products);
    }).catch(() => {
      // Do not cache failures; another navigation can retry.
    }).finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);
  const productsArray = useMemo(() => Object.values(productsById), [productsById]);
  return { productsById, productsArray, loaded };
}
