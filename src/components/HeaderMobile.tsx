"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Heart, Info, ShoppingCart } from "lucide-react"; // Import ShoppingCart
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext"; // Import useCart

function HeaderMobileContent() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { itemCount } = useCart(); // Get item count from cart context

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
    { name: "Início", href: "/", icon: Home },
    { name: "Materiais", href: "/#catalogo", icon: BookOpen },
    { name: "Sobre", href: "/sobre", icon: Info },
    { name: "Carrinho", href: "/carrinho", icon: ShoppingCart, count: itemCount }, // Add cart item
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 100, x: "-50%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="lg:hidden fixed bottom-6 left-1/2 z-[100] w-[92%] max-w-md"
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
                  {/* Background Glow para o item ativo */}
                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-purple-100/50 rounded-3xl z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  <motion.div
                    whileTap={{ scale: 0.8 }}
                    className={`relative z-10 p-3 rounded-2xl transition-colors duration-300 ${
                      isActive
                        ? "text-purple-600"
                        : "text-gray-400"
                    }`}
                  >
                    {/* Efeito de flutuação no ícone ativo */}
                    <motion.div
                      animate={isActive ? { y: -5 } : { y: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon 
                        size={24} 
                        strokeWidth={isActive ? 2.5 : 2}
                        className={isActive ? "drop-shadow-[0_0_8px_rgba(147,51,234,0.3)]" : ""}
                      />
                    </motion.div>

                    {/* Pontinho embaixo do ícone ativo */}
                    {isActive && (
                      <motion.div 
                        layoutId="dot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"
                      />
                    )}

                    {(item.count ?? 0) > 0 && item.name === "Carrinho" && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        {item.count}
                      </motion.span>
                    )}

                  </motion.div>

                  <span className={`relative z-10 text-[9px] font-black uppercase tracking-[0.1em] mt-0.5 transition-all duration-300 ${
                    isActive ? "text-purple-600 scale-110" : "text-gray-400"
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export default function HeaderMobile() {
  return (
    <Suspense fallback={null}>
      <HeaderMobileContent />
    </Suspense>
  );
}