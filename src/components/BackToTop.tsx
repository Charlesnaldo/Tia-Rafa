"use client";

import { useEffect, useState } from "react";
import { ChevronUp, Rocket } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Monitora a rolagem da página
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-[60] group flex flex-col items-center gap-2"
      aria-label="Voltar ao topo"
    >
          

      {/* Círculo do Botão */}
      <div className="relative w-14 h-14 bg-white rounded-full shadow-[0_10px_30px_rgba(147,51,234,0.3)] border-4 border-purple-50 flex items-center justify-center text-purple-600 transition-all duration-300 hover:scale-110 hover:-translate-y-2 active:scale-90 overflow-hidden">
        
        {/* Efeito de "Água" ou Preenchimento ao passar o mouse */}
        <div className="absolute inset-0 bg-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        
        {/* Ícone que muda de cor no hover */}
        <ChevronUp 
          size={30} 
          className="relative z-10 group-hover:text-white transition-colors duration-300" 
        />
      </div>

      {/* Pequena sombra animada no chão */}
      <div className="w-8 h-1 bg-black/10 rounded-full blur-sm group-hover:scale-150 transition-transform opacity-50" />
    </button>
  );
}