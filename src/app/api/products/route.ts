import { NextResponse } from "next/server";
import { getPublishedProducts } from "@/lib/products/catalog-server";

export const revalidate = 60;

export async function GET() {
  try {
    return NextResponse.json({ products: await getPublishedProducts() });
  } catch {
    return NextResponse.json({ products: [], error: "Catálogo temporariamente indisponível." }, { status: 503 });
  }
}
