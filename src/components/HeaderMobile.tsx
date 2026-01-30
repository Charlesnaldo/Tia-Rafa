"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Heart, Info } from "lucide-react";

export default function HeaderMobile() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Início", href: "/", icon: <Home size={24} /> },
    { name: "Materiais", href: "/#catalogo", icon: <BookOpen size={24} /> },
    { name: "Favoritos", href: "#", icon: <Heart size={24} /> },
    { name: "Sobre", href: "/sobre", icon: <Info size={24} /> }, // Alterado aqui
  ];

  return (
    <>
      {/* NAVEGAÇÃO INFERIOR ESTILO APP */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-3 px-2 z-[100] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] rounded-t-[32px]">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center min-w-[70px] relative pb-2"
              >
                <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive
                  ? "bg-purple-600 text-white -translate-y-1 shadow-lg shadow-purple-200"
                  : "text-gray-400"
                  }`}>
                  {item.icon}
                </div>

                <span className={`text-[10px] font-bold mt-1 transition-opacity duration-300 ${isActive ? "text-purple-600 opacity-100" : "text-gray-400 opacity-80"
                  }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}