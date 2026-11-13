"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "../../public/optimized/logo.webp";

export default function HeaderMobileTop() {

const pathname = usePathname();

  // Só aparece na HOME
  if (pathname !== "/") return null;





  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
      <div className="flex justify-center pt-5">
        
        <Link href="/" aria-label="Home">
          <Image
            src={logo}
            alt="Logo Tia Rafa"
            width={240}
            height={240}
            sizes="240px"
            loading="lazy"
            style={{ height: "auto" }}
            className="h-auto w-[240px] object-contain"
          />
        </Link>
      </div>
    </header>
  );
}
