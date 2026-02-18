"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ProductCard from "./ProductCard";
import { Sparkles } from "lucide-react";
import { useProductsCatalog } from "@/lib/products/useProductsCatalog";

export default function DualCarousel() {
  const { productsArray: produtos } = useProductsCatalog();
  

  const metade = Math.ceil(produtos.length / 2);
  const linhaSuperior = produtos.slice(0, metade);
  const linhaInferior = produtos.slice(metade);

 
  const [emblaRefTop] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true },
    [Autoplay({ delay: 3000, stopOnInteraction: false, playOnInit: true })]
  );

 
  const [emblaRefBottom] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true, direction: "rtl" },
    [Autoplay({ delay: 3000, stopOnInteraction: false, playOnInit: true })]
  );

  return (
    <section className="py-20 bg-white overflow-hidden flex flex-col gap-10">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center px-4 mb-4">
        <div className="p-3 bg-purple-100 rounded-2xl text-purple-600 mb-4 animate-bounce">
          <Sparkles size={28} />
        </div>
        <h3 className="text-4xl md:text-5xl font-black font-fredoka bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          Destaques Mágicos
        </h3>
        <p className="text-gray-400 mt-2 font-medium">Toque e arraste para explorar os materiais!</p>
      </div>

     
      <div className="cursor-grab active:cursor-grabbing">
        <div className="overflow-hidden" ref={emblaRefTop}>
          <div className="flex gap-6 ml-6">
            {linhaSuperior.map((produto) => (
              <div key={produto.id} className="flex-[0_0_280px] md:flex-[0_0_350px] min-w-0">
                <ProductCard {...produto} />
              </div>
            ))}
          </div>
        </div>
      </div>

     
      <div className="cursor-grab active:cursor-grabbing">
        <div className="overflow-hidden" ref={emblaRefBottom} dir="rtl">
          <div className="flex gap-6 mr-6">
            {linhaInferior.map((produto) => (
              <div key={produto.id} className="flex-[0_0_280px] md:flex-[0_0_350px] min-w-0" dir="ltr">
                <ProductCard {...produto} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estilo para suavizar as bordas (efeito fade) */}
      <style jsx>{`
        section {
          mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
        }
      `}</style>
    </section>
  );
}
