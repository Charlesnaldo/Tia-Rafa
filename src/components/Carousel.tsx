"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay"; // Importando o plugin
import ProductCard from "./ProductCard";

export default function Carousel() {
  // Configurando o Autoplay para passar a cada 4 segundos
  const [emblaRef] = useEmblaCarousel({ 
    align: 'start', 
    loop: true 
  }, [Autoplay({ delay: 6000, stopOnInteraction: false })]);

  const materiais = [
    { title: "Alfabetização Mágica", desc: "50+ páginas lúdicas", price: "27,90", color: "bg-purple-400" },
    { title: "Matemática Divertida", desc: "Números e formas", price: "19,90", color: "bg-pink-400" },
    { title: "Datas Comemorativas", desc: "Calendário escolar", price: "47,00", color: "bg-orange-400" },
    { title: "Artes e Cores", desc: "Pintura e criatividade", price: "15,00", color: "bg-blue-400" },
    { title: "Leitura Inicial", desc: "Pequenos textos em PDF", price: "22,00", color: "bg-emerald-400" },
  ];

  return (
    <div className="relative">
      {/* Container do Carrossel */}
      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex gap-6 py-4">
          {materiais.map((item, index) => (
            <div 
              key={index} 
              className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 transition-all duration-500 ease-in-out"
            >
              <ProductCard 
                title={item.title}
                description={item.desc}
                price={item.price}
                imageColor={item.color}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Gradientes laterais para suavizar a entrada/saída (opcional) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-zinc-50 to-transparent z-10 hidden lg:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zinc-50 to-transparent z-10 hidden lg:block" />
    </div>
  );
}