"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Produto } from "@/constants/produtos";

function CarouselPlaceholder() {
  return <div aria-hidden="true" className="h-[1240px] w-full bg-white motion-safe:animate-pulse md:h-[1380px]" />;
}
const Carousel = dynamic(() => import("./Carousel"), { ssr: false, loading: CarouselPlaceholder });

export default function DeferredCarousel({ products }: { products: Produto[] }) {
  const section = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!section.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "600px" });
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);
  if (!products.length) return null;
  return <div ref={section}>{visible ? <Carousel products={products} /> : <CarouselPlaceholder />}</div>;
}
