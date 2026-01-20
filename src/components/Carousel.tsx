"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";

export default function Carousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      loop: true,
      skipSnaps: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const materiais = [
    { title: "Alfabetização Mágica", desc: "50+ páginas lúdicas", price: "27,90", color: "bg-purple-400" },
    { title: "Matemática Divertida", desc: "Números e formas", price: "19,90", color: "bg-pink-400" },
    { title: "Datas Comemorativas", desc: "Calendário escolar", price: "47,00", color: "bg-orange-400" },
    { title: "Artes e Cores", desc: "Pintura e criatividade", price: "15,00", color: "bg-blue-400" },
    { title: "Leitura Inicial", desc: "Pequenos textos em PDF", price: "22,00", color: "bg-emerald-400" },
  ];

  return (
    <div className="relative group px-4 md:px-12 py-16 bg-white overflow-hidden">
      
      {/* Header do Carrossel Centralizado */}
      <div className="flex flex-col items-center justify-center mb-12 px-4 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-2xl text-orange-600 shadow-sm">
            <Sparkles size={28} />
          </div>
          <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tighter font-fredoka">
            Destaques da Semana
          </h3>
          <div className="h-1.5 w-24 bg-gradient-to-r from-purple-600 to-orange-400 rounded-full mt-2" />
        </div>
      </div>

      {/* Viewport do Embla */}
      <div className="relative max-w-7xl mx-auto">
        <div className="overflow-hidden px-4" ref={emblaRef}>
          <div className="flex -ml-6 py-8">
            {materiais.map((item, index) => (
              <div 
                key={index} 
                className="pl-6 flex-[0_0_88%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0"
              >
                <div className="transition-all duration-500 hover:translate-y-[-10px]">
                  <ProductCard 
                    title={item.title}
                    description={item.desc}
                    price={item.price}
                    imageColor={item.color}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botões de Navegação Flutuantes nas Pontas */}
        <button 
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 z-20 p-4 rounded-full bg-white shadow-xl text-gray-400 hover:text-purple-600 transition-all active:scale-90 border border-gray-100 hidden sm:flex"
        >
          <ChevronLeft size={28} />
        </button>
        <button 
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 z-20 p-4 rounded-full bg-white shadow-xl text-gray-400 hover:text-purple-600 transition-all active:scale-90 border border-gray-100 hidden sm:flex"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Indicadores de Paginação */}
      <div className="flex justify-center gap-2 mt-8">
        {materiais.map((_, i) => (
          <div 
            key={i} 
            className="h-2 w-2 rounded-full bg-gray-200 transition-all group-hover:bg-purple-300"
          />
        ))}
      </div>
    </div>
  );
}