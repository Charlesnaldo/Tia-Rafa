import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Carousel from "@/components/DeferredCarousel";
import { ThreeDMarqueeDemo } from "@/components/ThreeDMarqueeDemo";
import Testimonials from "@/components/Testimonials";
import { getCatalogProducts } from "@/lib/products/catalog-server";
import FeaturedMaterials from "@/components/FeaturedMaterials";

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
      <FeaturedMaterials products={catalog.products} />
      
      <HowItWorks />
      
      <Carousel products={catalog.products} />

      <ThreeDMarqueeDemo />
      
      <Testimonials />


    </>
  );
}
