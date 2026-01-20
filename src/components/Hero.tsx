"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden font-fredoka">
      
      {/* --- IMAGEM DE FUNDO E OVERLAY --- */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/fundo-hero.jpg" // Certifique-se que o arquivo existe em /public
          alt="Fundo lúdico infantil"
          fill
          className="object-cover opacity-80"
          priority
        />
        {/* Gradiente para suavizar a imagem e dar leitura ao header e conteúdo */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/20 to-zinc-50" />
      </div>

      {/* --- ELEMENTOS FLUTUANTES --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[25%] left-[5%] w-64 h-64 bg-purple-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[20%] right-[5%] w-80 h-80 bg-pink-200/40 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="absolute top-[30%] right-[10%] text-yellow-400 animate-bounce hidden md:block">
          <Star size={48} fill="currentColor" />
        </div>
        <div className="absolute bottom-[30%] left-[8%] text-blue-300 animate-bounce delay-500 hidden md:block">
          <Sparkles size={40} />
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="text-center">
          
          {/* Badge Animada */}
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-purple-100 px-5 py-2.5 rounded-full mb-10 animate-bounce shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
            <span className="text-purple-700 text-xs md:text-sm font-black uppercase tracking-widest">
              Materiais 100% Digitais
            </span>
          </div>

          {/* Título de Impacto */}
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-esmerald-900 to-orange-400 text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter text-gray-900 mb-10">
            Educar com <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
              Amor e Cor
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 font-bold mb-14 leading-relaxed">
            Apoio pedagógico lúdico para professores e pais. <br className="hidden md:block" />
            Baixe agora e receba seus PDFs instantaneamente! 📥
          </p>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="#catalogo" 
              className="group bg-purple-600 text-white font-black px-12 py-6 rounded-[2.5rem] text-xl shadow-[0_20px_40px_rgba(147,51,234,0.3)] hover:bg-purple-700 hover:-translate-y-1.5 transition-all active:scale-95 flex items-center gap-3"
            >
              Ver Catálogo <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>

            <button className="bg-white/80 backdrop-blur-sm text-gray-700 border-4 border-white font-black px-12 py-6 rounded-[2.5rem] text-xl hover:bg-white shadow-lg transition-all flex items-center gap-3">
              Material Grátis 🎁
            </button>
          </div>
        </div>
      </div>

      {/* Transição de Onda para a próxima seção */}
      <div className="absolute bottom-0 left-0 w-full leading-[0]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 md:h-24 fill-white">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );
}