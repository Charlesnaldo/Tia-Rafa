import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Catalog from "@/components/Catalog";
import dynamic from "next/dynamic";

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

export default function Home() {
  return (
    <>
      <Hero />
      
      <Catalog />
      
      <HowItWorks />
      
      <Carousel />

      <ThreeDMarqueeDemo />
      
      <Testimonials />


    </>
  );
}
