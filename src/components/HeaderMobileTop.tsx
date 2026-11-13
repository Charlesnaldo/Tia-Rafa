"use client";

import Image, { getImageProps, type ImageLoaderProps } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "../../public/optimized/logo-mobile-480.png";
import logoSmall from "../../public/optimized/logo-mobile-240.png";

// Serve pre-sized PNGs directly: keep alpha out of negotiated AVIF/WebP decoding.
// Next rounds a 240px slot up to the configured 256px candidate for its 1x URL.
const mobileLogoLoader = ({ width }: ImageLoaderProps) => width <= 256 ? logoSmall.src : logo.src;

const { props: logoProps } = getImageProps({
  src: logo, loader: mobileLogoLoader, alt: "Logo Tia Rafa", width: 240, height: 240,
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
            loader={mobileLogoLoader}
            alt="Logo Tia Rafa"
            width={240}
            height={240}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{ height: "auto" }}
            className="h-auto w-[240px] object-contain"
          />
        </Link>
      </div>
    </header>
  );
}
