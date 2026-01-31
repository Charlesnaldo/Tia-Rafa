"use client"; // Obrigatório para usar o useState e os cliques

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Galeria({ imagens, nome, cor }: { imagens: string[], nome: string, cor: string }) {
  // Estado para saber qual foto exibir (começa na 0)
  const [fotoAtiva, setFotoAtiva] = useState(0);

  const próxima = () => setFotoAtiva((prev) => (prev + 1) % imagens.length);
  const anterior = () => setFotoAtiva((prev) => (prev - 1 + imagens.length) % imagens.length);

  return (
    <div className="flex flex-col gap-4">
      {/* Moldura da Foto Grande */}
      <div className={`relative aspect-[4/5] ${cor} rounded-[32px] overflow-hidden shadow-inner flex items-center justify-center p-8 group`}>
        <div className="relative w-full h-full bg-white shadow-2xl rounded-sm overflow-hidden border-t-[12px] border-purple-200">
          <Image 
            src={imagens[fotoAtiva]} 
            alt={nome} 
            fill
            className="object-cover transition-opacity duration-500"
            priority 
          />
        </div>

        {/* Botões de Navegação (Só aparecem se tiver + de 1 foto) */}
        {imagens.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={anterior} className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white text-purple-600">
              <ChevronLeft size={24} />
            </button>
            <button onClick={próxima} className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white text-purple-600">
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Miniaturas abaixo da foto grande */}
      {imagens.length > 1 && (
        <div className="flex gap-2 justify-center">
          {imagens.map((img, index) => (
            <button
              key={index}
              onClick={() => setFotoAtiva(index)}
              className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                fotoAtiva === index ? "border-purple-500 scale-105" : "border-transparent opacity-50"
              }`}
            >
              <Image src={img} alt="preview" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}