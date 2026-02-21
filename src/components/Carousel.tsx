"use client";

import React, { useMemo, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ProductCard from "./ProductCard";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useProductsCatalog } from "@/lib/products/useProductsCatalog";

export default function DualCarousel() {
  const { productsArray: produtos, loaded } = useProductsCatalog();

  const autoplayTop = useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true, playOnInit: true })
  );
  const autoplayBottom = useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true, playOnInit: true })
  );

  const [emblaRefTop, emblaApiTop] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false, containScroll: "trimSnaps" },
    [autoplayTop.current]
  );

  const [emblaRefBottom, emblaApiBottom] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false, containScroll: "trimSnaps", direction: "rtl" },
    [autoplayBottom.current]
  );

  const { linhaSuperior, linhaInferior } = useMemo(() => {
    const metade = Math.ceil(produtos.length / 2);
    const linhaTop = produtos.slice(0, metade);
    const linhaBottom = produtos.slice(metade);

    const garantirMinimo = (items: typeof produtos) => {
      if (items.length >= 4 || items.length === 0) return items;
      return Array.from({ length: 4 }, (_, i) => items[i % items.length]);
    };

    const linhaTopPronta = garantirMinimo(linhaTop);
    const linhaBottomPronta = garantirMinimo(linhaBottom.length > 0 ? linhaBottom : linhaTop);

    return { linhaSuperior: linhaTopPronta, linhaInferior: linhaBottomPronta };
  }, [produtos]);

  const pauseAutoPlay = () => {
    autoplayTop.current.stop();
    autoplayBottom.current.stop();
  };

  const resumeAutoPlay = () => {
    autoplayTop.current.play();
    autoplayBottom.current.play();
  };

  return (
    <section className="flex flex-col gap-10 overflow-hidden bg-white py-20 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" aria-labelledby="destaques-heading">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center px-4 mb-4">
        <div className="p-3 bg-purple-100 rounded-2xl text-purple-600 mb-4 animate-bounce">
          <Sparkles size={28} />
        </div>
        <h3 id="destaques-heading" className="text-4xl md:text-5xl font-black font-fredoka bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          Destaques Mágicos
        </h3>
        <p className="text-gray-600 mt-2 font-medium">Toque e arraste para explorar os materiais!</p>
      </div>

      {!loaded ? (
        <div className="px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`carousel-skeleton-${index}`} className="h-[380px] rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-end px-4 gap-2">
            <button
              type="button"
              onClick={() => emblaApiTop?.scrollPrev()}
              aria-label="Voltar no carrossel superior"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 bg-white text-purple-700 shadow-sm transition-colors hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => emblaApiTop?.scrollNext()}
              aria-label="Avançar no carrossel superior"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 bg-white text-purple-700 shadow-sm transition-colors hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div
            className="cursor-grab active:cursor-grabbing"
            role="region"
            aria-label="Carrossel de materiais em destaque - linha superior"
            onMouseEnter={pauseAutoPlay}
            onMouseLeave={resumeAutoPlay}
            onFocusCapture={pauseAutoPlay}
            onBlurCapture={resumeAutoPlay}
          >
            <div className="overflow-hidden" ref={emblaRefTop} tabIndex={0}>
              <div className="flex gap-6 ml-6">
                {linhaSuperior.map((produto, index) => (
                  <div key={`${produto.id}-top-${index}`} className="flex-[0_0_280px] md:flex-[0_0_350px] min-w-0">
                    <ProductCard {...produto} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end px-4 gap-2">
            <button
              type="button"
              onClick={() => emblaApiBottom?.scrollNext()}
              aria-label="Voltar no carrossel inferior"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 bg-white text-purple-700 shadow-sm transition-colors hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => emblaApiBottom?.scrollPrev()}
              aria-label="Avançar no carrossel inferior"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 bg-white text-purple-700 shadow-sm transition-colors hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div
            className="cursor-grab active:cursor-grabbing"
            role="region"
            aria-label="Carrossel de materiais em destaque - linha inferior"
            onMouseEnter={pauseAutoPlay}
            onMouseLeave={resumeAutoPlay}
            onFocusCapture={pauseAutoPlay}
            onBlurCapture={resumeAutoPlay}
          >
            <div className="overflow-hidden" ref={emblaRefBottom} dir="rtl" tabIndex={0}>
              <div className="flex gap-6 mr-6">
                {linhaInferior.map((produto, index) => (
                  <div key={`${produto.id}-bottom-${index}`} className="flex-[0_0_280px] md:flex-[0_0_350px] min-w-0" dir="ltr">
                    <ProductCard {...produto} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
