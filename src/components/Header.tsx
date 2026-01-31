"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Search, X, BookOpen, Heart, MessageCircle } from "lucide-react";


function HeaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchValue = searchParams.get("busca") || "";

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (term) {
      params.set("busca", term);
    } else {
      params.delete("busca");
    }
    
    
    router.push(`/?${params.toString()}#catalogo`, { scroll: false });
  };

  return (
    <nav className="max-w-7xl mx-auto">
      <div className="relative bg-white/90 backdrop-blur-md rounded-[3rem] px-8 py-4 flex items-center justify-between shadow-lg border border-white/20">
        
        {/* Logo e Links aparecem se a busca estiver fechada */}
        {!isSearchOpen && (
          <Link href="/" className="flex items-center gap-3 group animate-in fade-in duration-500">
            <div className="bg-purple-100 p-2 rounded-2xl group-hover:rotate-12 transition-all">
              <Sparkles className="text-purple-600" size={24} />
            </div>
            <h1 className="text-2xl font-black text-gray-900">
              <span className="text-purple-600">TIA</span>
              <span className="text-pink-500 ml-1">RAFA</span>
            </h1>
          </Link>
        )}

        <div className="flex items-center gap-6 flex-1 justify-end">
          {/* Barra de Busca Expansível */}
          <div className={`relative flex items-center transition-all duration-500 ${isSearchOpen ? 'flex-1 max-w-md' : 'w-10'}`}>
            <input 
              type="text"
              placeholder="O que você procura?"
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className={`w-full bg-gray-100 border border-gray-200 rounded-full py-2.5 pl-4 pr-10 outline-none focus:ring-2 focus:ring-purple-500 font-bold text-gray-800
                ${isSearchOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}
            />
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`absolute right-1 p-2.5 rounded-full transition-all ${isSearchOpen ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {isSearchOpen ? <X size={18} /> : <Search size={20} />}
            </button>
          </div>

          {!isSearchOpen && (
            <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Link href="/#catalogo" className="flex items-center gap-2 text-gray-700 font-black hover:text-purple-600 transition-all text-sm uppercase">
                <BookOpen size={18} className="text-purple-600" /> MATERIAIS
              </Link>
              <Link href="/sobre" className="flex items-center gap-2 text-gray-700 font-black hover:text-pink-600 transition-all text-sm uppercase">
                <Heart size={18} className="text-pink-600" /> SOBRE
              </Link>
              <Link href="https://wa.me/5500000000000" className="flex items-center gap-2 text-gray-700 font-black hover:text-green-600 transition-all text-sm uppercase">
                <MessageCircle size={18} className="text-green-600" /> CONTATO
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// 2. Exportamos o Header envolvendo o conteúdo em Suspense
export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 py-8 hidden lg:block font-fredoka bg-transparent">
      <Suspense fallback={
        <div className="max-w-7xl mx-auto">
          <div className="h-20 bg-white/50 animate-pulse rounded-[3rem] border border-white/20"></div>
        </div>
      }>
        <HeaderContent />
      </Suspense>
    </header>
  );
}