import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import dynamic from "next/dynamic";
import { getCatalogProducts } from "@/lib/products/catalog-server";

const Carousel = dynamic(() => import("@/components/Carousel"), {
  loading: () => <div className="h-[520px] w-full animate-pulse bg-white" />,
});

const ThreeDMarqueeDemo = dynamic(
  () => import("@/components/ThreeDMarqueeDemo").then((mod) => mod.ThreeDMarqueeDemo),
  {
    loading: () => <div className="mx-auto my-10 h-[420px] max-w-8xl animate-pulse rounded-3xl bg-gray-100 p-2" />,
  }
);

const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <div className="h-[420px] w-full animate-pulse bg-white" />,
});

export default async function Home({ searchParams }: {
  searchParams: Promise<{ busca?: string | string[] }>;
}) {
  const [query, catalog] = await Promise.all([
    searchParams,
    getCatalogProducts().then(products => ({ products, unavailable: false }))
      .catch(() => ({ products: [], unavailable: true })),
  ]);
  return (
    <>
      <Hero products={catalog.products} search={typeof query.busca === "string" ? query.busca : ""} unavailable={catalog.unavailable} />
      
      <HowItWorks />
      
      <Carousel products={catalog.products} />

      <ThreeDMarqueeDemo />
      
      <Testimonials />


    </>
  );
}
