"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Heart, MessageCircle, Palette, Instagram, Youtube } from "lucide-react";

function HeaderContent() {
  return (
    <nav className="max-w-[90%] xl:max-w-7xl mx-auto relative">
      <div className="relative px-4 py-6 flex items-center justify-between animate-in fade-in slide-in-from-top-6 duration-1000">

        {/* LADO ESQUERDO: Redes Sociais */}
        <div className="flex items-center gap-4 flex-1">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-3 bg-white/90 text-pink-900 rounded-2xl shadow-sm border border-pink-50 hover:bg-pink-500 hover:text-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-pink-200 animate-float"
          >
            <Instagram size={40} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
          </a>

          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-3 bg-white/80 text-red-500 rounded-2xl shadow-sm border border-red-50 hover:bg-red-500 hover:text-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-red-200 animate-float [animation-delay:0.2s]"
          >
            < Youtube size={40} className="group-hover:scale-110 transition-transform" />
          </a>

          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-3 bg-white/80 text-green-500 rounded-2xl shadow-sm border border-green-50 hover:bg-green-500 hover:text-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-200 animate-float [animation-delay:0.4s]"
          >
            <MessageCircle size={40} className="group-hover:scale-110 transition-transform" />
          </a>
        </div>

        {/* CENTRO: Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700">
          <Link href="/" className="block group">
            <Image
              src="/logo.png"
              alt="Logo Tia Rafa"
              width={380}
              height={100}
              className="object-contain transform group-hover:scale-105 transition-transform duration-500"
              priority
            />
          </Link>
        </div>

        {/* LADO DIREITO: Menu de Navegação */}
        <div className="flex items-center gap-10 flex-1 justify-end animate-in fade-in slide-in-from-right-4 duration-700">
          <Link href="/#catalogo" className="flex flex-col items-center gap-1 text-purple-800 font-black hover:text-purple-600 transition-all group">
            <BookOpen size={40} className="group-hover:scale-110 group-hover:-rotate-6 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.15em] font-fredoka">Materiais</span>
          </Link>

          <Link href="/sobre" className="flex flex-col items-center gap-1 text-purple-800 font-black hover:text-pink-400 transition-all group">
            <Heart size={40} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.15em] font-fredoka">Sobre</span>
          </Link>

          <Link href="/atividades" className="flex flex-col items-center gap-1 text-purple-800 font-black hover:text-blue-400 transition-all group">
            <Palette size={40} className="group-hover:scale-110 group-hover:rotate-6 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.15em] font-fredoka">Atividades</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function Header() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-8 pt-[140px] hidden lg:block">
      <Suspense fallback={<div className="h-32 w-full" />}>
        <HeaderContent />
      </Suspense>
    </header>
  );
}