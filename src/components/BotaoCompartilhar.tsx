"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

export default function BotaoCompartilhar({ titulo }: { titulo: string }) {
  const [copiado, setCopiado] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // Tenta usar o compartilhamento nativo do sistema (celular)
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
      // Caso não tenha suporte (PC antigo), apenas copia o link
      navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all font-bold text-xs uppercase tracking-tight"
    >
      {copiado ? (
        <>
          <Check size={16} className="text-green-500" />
          Link Copiado!
        </>
      ) : (
        <>
          <Share2 size={16} />
          Compartilhar
        </>
      )}
    </button>
  );
}