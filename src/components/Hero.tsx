import Image from "next/image";
import Catalog from "@/components/Catalog";

export default function Hero() {
  return (
    <div className="relative isolate overflow-hidden pt-[235px] lg:pt-[330px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] lg:h-[1050px]" aria-hidden="true">
        <Image
          src="/fundo-hero.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top opacity-95"
          preload
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/20 to-white" />
      </div>
      <Catalog />
    </div>
  );
}
