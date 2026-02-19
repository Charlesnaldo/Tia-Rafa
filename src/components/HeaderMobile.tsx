"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Info, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

function HeaderMobileContent() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { itemCount } = useCart();

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 80) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  const menuItems = [
    { name: "In\u00edcio", href: "/", icon: Home },
    { name: "Materiais", href: "/#catalogo", icon: BookOpen },
    { name: "Sobre", href: "/sobre", icon: Info },
    { name: "Carrinho", href: "/carrinho", icon: ShoppingCart, count: itemCount },
  ];

  return (
    <nav
      className={`lg:hidden fixed bottom-6 left-1/2 z-[100] w-[92%] max-w-md -translate-x-1/2 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white/90 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] px-2 py-3 flex justify-around items-center relative">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center relative min-w-[68px] outline-none"
            >
              {isActive && <div className="absolute inset-0 bg-purple-100/50 rounded-3xl z-0" />}

              <div
                className={`relative z-10 p-3 rounded-2xl transition-all duration-300 active:scale-90 ${
                  isActive ? "text-purple-600" : "text-gray-400"
                }`}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`${isActive ? "-translate-y-1 drop-shadow-[0_0_8px_rgba(147,51,234,0.3)]" : ""} transition-transform`}
                />

                {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full" />}

                {(item.count ?? 0) > 0 && item.name === "Carrinho" && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </div>

              <span
                className={`relative z-10 text-[9px] font-black uppercase tracking-[0.1em] mt-0.5 transition-all duration-300 ${
                  isActive ? "text-purple-600 scale-110" : "text-gray-400"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function HeaderMobile() {
  return (
    <Suspense fallback={null}>
      <HeaderMobileContent />
    </Suspense>
  );
}
