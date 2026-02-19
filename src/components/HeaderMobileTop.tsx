"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HeaderMobileTop() {

const pathname = usePathname();

  // Só aparece na HOME
  if (pathname !== "/") return null;





  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
      <div className="flex justify-center pt-5">
        
        <Link href="/" aria-label="Home">
          <Image
            src="/logo.webp"
            alt="Logo Tia Rafa"
            width={240}
            height={70}
            className="object-contain"
          />
        </Link>
      </div>
    </header>
  );
}
