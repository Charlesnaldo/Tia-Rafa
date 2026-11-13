"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "../../public/optimized/logo.webp";

const { props: logoProps } = getImageProps({
  src: logo, alt: "Logo Tia Rafa", width: 240, height: 240, sizes: "240px",
});

export default function HeaderMobileTop() {

const pathname = usePathname();

  // Só aparece na HOME
  if (pathname !== "/") return null;





  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
      <link rel="preload" as="image" imageSrcSet={logoProps.srcSet} imageSizes={logoProps.sizes} media="(max-width: 1023px)" fetchPriority="high" />
      <div className="flex justify-center pt-5">
        
        <Link href="/" aria-label="Home">
          <Image
            src={logo}
            alt="Logo Tia Rafa"
            width={240}
            height={240}
            sizes="240px"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            style={{ height: "auto" }}
            className="h-auto w-[240px] object-contain"
          />
        </Link>
      </div>
    </header>
  );
}
