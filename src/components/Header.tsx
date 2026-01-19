"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Heart, MessageCircle, Home, Sparkles } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "Início", icon: Home, link: "/", color: "text-blue-500" },
    { name: "Materiais", icon: BookOpen, link: "#catalogo", color: "text-purple-500" },
    { name: "Sobre", icon: Heart, link: "/sobre", color: "text-pink-500" },
    { name: "Contato", icon: MessageCircle, link: "https://wa.me/85985122803", color: "text-green-500" },
  ];

  return (
    <>
      {/* --- HEADER DESKTOP (Fica no topo, estilo espelho) --- */}
      <header className="absolute top-0 left-0 right-0 z-50 px-4 py-8 hidden md:block">
        <nav className="max-w-7xl mx-auto">
          <div className="relative bg-white/[0.60] backdrop-blur-[24px] rounded-[3rem] px-8 py-4 flex items-center justify-between shadow-[0_8px_32px_0_rgba(255,255,255,0.15)] border border-white/60">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-3xl border border-white/40 shadow-inner group-hover:rotate-12 transition-all">
                <Sparkles className="text-purple-600" size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tight font-fredoka">
                <span className="text-purple-600">TIA</span>
                <span className="text-pink-500 ml-1">RAFA</span>
              </h1>
            </Link>

            {/* Menu Desktop */}
            <div className="flex items-center gap-10 font-fredoka">
              {navItems.slice(1).map((item) => (
                <Link key={item.name} href={item.link} className="flex items-center gap-2 text-gray-900 font-bold hover:text-purple-600 transition-all">
                  <item.icon size={18} className={item.color} />
                  <span className="text-sm uppercase tracking-wider">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* CTA */}
            <Link href="#catalogo" className="bg-purple-600 text-white font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-all">
              Começar
            </Link>
          </div>
        </nav>
      </header>

      {/* --- MENU MOBILE ESTILO APLICATIVO (Fica na parte inferior) --- */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[400px]">
        {/* Container Espelhado do App Menu */}
        <div className="bg-white/70 backdrop-blur-[20px] rounded-[2.5rem] py-3 px-6 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50">
          {navItems.map((item) => {
            const isActive = pathname === item.link;
            return (
              <Link 
                key={item.name} 
                href={item.link} 
                className="flex flex-col items-center gap-1 group relative"
              >
                {/* Indicador de página ativa */}
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 bg-purple-600 rounded-full" />
                )}
                
                <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-purple-100 text-purple-600 scale-110' : 'text-gray-500'}`}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logo Flutuante no Topo (Mobile Only) */}
      <div className="md:hidden absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-white/40 backdrop-blur-md p-2 rounded-xl border border-white/50">
             <Sparkles className="text-purple-600" size={20} />
          </div>
          <span className="font-fredoka font-black text-purple-600">TIA RAFA</span>
        </Link>
      </div>
    </>
  );
}