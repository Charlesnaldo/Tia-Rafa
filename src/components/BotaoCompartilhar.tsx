"use client";

import { Share, Check, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function BotaoCompartilhar({ titulo }: { titulo: string }) {
  const [copiado, setCopiado] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: titulo,
          text: `Olha que material legal da Tia Rafa: ${titulo}`,
          url: url,
        });
      } catch (err) {
        console.log("Erro ao compartilhar", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`
        relative flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase cursor-pointer tracking-widest transition-all active:scale-95
        ${copiado 
          ? "bg-green-50 text-green-600 border-2 border-green-100" 
          : "bg-white/80 backdrop-blur-md border-2 border-gray-100 text-gray-500 hover:border-purple-200 hover:text-purple-600 shadow-sm"
        }
      `}
    >
      {copiado ? (
        <>
          <Check size={16} strokeWidth={3} />
          <span>Copiado!</span>
        </>
      ) : (
        <>
          {/* Ícone de seta (ExternalLink) aparece mais em evidência no Mobile via Tailwind */}
          <ExternalLink size={16} strokeWidth={3} className="block md:hidden" />
          <Share size={16} strokeWidth={3} className="hidden md:block" />
          <span>Enviar</span>
        </>
      )}
    </button>
  );
}