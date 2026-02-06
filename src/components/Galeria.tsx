"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function Galeria({ imagens, nome, cor }: { imagens: string[], nome: string, cor: string }) {
  const [fotoAtiva, setFotoAtiva] = useState(0);
  
  // Estados para a lupa
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });
  const containerRef = useRef<HTMLDivElement>(null);

  const próxima = () => setFotoAtiva((prev) => (prev + 1) % imagens.length);
  const anterior = () => setFotoAtiva((prev) => (prev - 1 + imagens.length) % imagens.length);

  // Função para calcular a posição do mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;

    setZoomPos({ x, y, show: true });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Moldura da Foto Grande */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomPos((prev) => ({ ...prev, show: false }))}
        className={`relative aspect-[4/5] ${cor} rounded-[32px] overflow-hidden shadow-inner flex items-center justify-center p-8 group cursor-zoom-in`}
      >
        <div className="relative w-full h-full bg-white shadow-2xl rounded-sm overflow-hidden border-t-[12px] border-purple-200">
          <Image 
            src={imagens[fotoAtiva]} 
            alt={nome} 
            fill
            className={`object-cover transition-opacity duration-500 ${zoomPos.show ? 'opacity-0' : 'opacity-100'}`}
            priority 
          />

          {/* Efeito de Lupa (Background Image com Zoom) */}
          {zoomPos.show && (
            <div 
              className="absolute inset-0 pointer-events-none transition-transform duration-150"
              style={{
                backgroundImage: `url(${imagens[fotoAtiva]})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundSize: "250%", // Nível do zoom
                backgroundRepeat: "no-repeat"
              }}
            />
          )}

          {/* Ícone Indicador de Lupa (opcional) */}
          {!zoomPos.show && (
            <div className="absolute bottom-4 right-4 bg-black/20 p-2 rounded-full backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Search size={20} />
            </div>
          )}
        </div>

        {/* Botões de Navegação */}
        {imagens.length > 1 && !zoomPos.show && (
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); anterior(); }} className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white text-purple-600 z-10">
              <ChevronLeft size={24} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); próxima(); }} className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white text-purple-600 z-10">
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Miniaturas */}
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