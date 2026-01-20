import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel"; // Importe o carrossel
import HowItWorks from "@/components/HowItWorks";
import Catalog from "@/components/Catalog";
import BackToTop from "@/components/BackToTop";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { ThreeDMarqueeDemo } from "@/components/ThreeDMarqueeDemo";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <Catalog />
      <HowItWorks />
      <BackToTop />
      <Carousel />
      <ThreeDMarqueeDemo />
      <Testimonials />


    </>
  );
}