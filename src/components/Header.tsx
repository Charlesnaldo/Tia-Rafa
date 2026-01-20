"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Heart, MessageCircle, Home, Sparkles, Search, X } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // LOGICA DE BUSCA: Atualiza a URL com o parâmetro ?busca=...
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("busca", term);
    } else {
      params.delete("busca");
    }
    
    // Se não estiver na home, redireciona para a home com o parâmetro
    // Se estiver na home, apenas atualiza a URL e rola até o catálogo
    router.push(`/?${params.toString()}#catalogo`, { scroll: false });
  };

  const navItems = [
    { name: "Início", icon: Home, link: "/", color: "text-blue-600" },
    { name: "Materiais", icon: BookOpen, link: "#catalogo", color: "text-purple-600" },
    { name: "Sobre", icon: Heart, link: "/sobre", color: "text-pink-600" },
    { name: "Contato", icon: MessageCircle, link: "https://wa.me/85985122803", color: "text-green-600" },
  ];

  return (
    <>
      {/* --- HEADER DESKTOP --- */}
      <header className="absolute top-0 left-0 right-0 z-50 px-4 py-8 hidden md:block font-fredoka">
        <nav className="max-w-7xl mx-auto">
          <div className="relative bg-white/95 backdrop-blur-md rounded-[3rem] px-8 py-4 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-200 transition-all duration-500">
            
            {!isSearchOpen && (
              <Link href="/" className="flex items-center gap-3 group animate-in fade-in duration-500">
                <div className="bg-purple-100 p-2 rounded-2xl border border-purple-200 group-hover:rotate-12 transition-all">
                  <Sparkles className="text-purple-600" size={24} />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900">
                  <span className="text-purple-600">TIA</span>
                  <span className="text-pink-500 ml-1">RAFA</span>
                </h1>
              </Link>
            )}

            <div className="flex items-center gap-6 flex-1 justify-end">
              {/* Pesquisa Desktop */}
              <div className={`relative flex items-center transition-all duration-500 ${isSearchOpen ? 'flex-1 max-w-md' : 'w-10'}`}>
                <input 
                  type="text"
                  placeholder="O que você procura?"
                  defaultValue={searchParams.get("busca")?.toString()}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`w-full bg-gray-100 border border-gray-300 rounded-full py-2.5 pl-4 pr-10 outline-none focus:ring-2 focus:ring-purple-500 font-bold text-gray-800
                    ${isSearchOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}
                />
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`absolute right-1 p-2.5 rounded-full transition-all ${isSearchOpen ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}
                >
                  {isSearchOpen ? <X size={18} /> : <Search size={20} />}
                </button>
              </div>

              {!isSearchOpen && (
                <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  {navItems.slice(1).map((item) => (
                    <Link key={item.name} href={item.link} className="flex items-center gap-2 text-gray-700 font-black hover:text-purple-600 transition-all text-sm uppercase tracking-wide">
                      <item.icon size={18} className={item.color} />
                      {item.name}
                    </Link>
                  ))}
                  <Link href="#catalogo" className="bg-purple-600 text-white font-black px-8 py-3.5 rounded-full text-xs uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all active:scale-95">
                    Começar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* --- MENU MOBILE ESTILO APLICATIVO --- */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[440px] font-fredoka">
        <div className="bg-white/95 backdrop-blur-lg rounded-[2.5rem] py-3 px-5 flex items-center justify-between shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-gray-200">
          
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center gap-1 text-gray-600"
          >
            <div className="p-2.5 rounded-2xl bg-gray-100 border border-gray-200">
              <Search size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase">Buscar</span>
          </button>

          {navItems.slice(1).map((item) => {
            const isActive = pathname === item.link;
            return (
              <Link key={item.name} href={item.link} className="flex flex-col items-center gap-1 relative">
                {isActive && <div className="absolute -top-1 w-1.5 h-1.5 bg-purple-600 rounded-full" />}
                <div className={`p-2.5 rounded-2xl transition-all ${isActive ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 bg-gray-50'}`}>
                  <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className={`text-[10px] font-black uppercase ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Overlay de Pesquisa Mobile */}
        {isSearchOpen && (
          <div className="fixed inset-0 bg-white z-[110] p-6 animate-in slide-in-from-bottom duration-300 flex flex-col">
            <div className="flex justify-between items-center mb-8 pt-4">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">O que vamos<br/>aprender hoje?</h2>
              <button onClick={() => setIsSearchOpen(false)} className="p-3 bg-gray-100 rounded-full text-gray-900 border border-gray-200">
                <X size={24} />
              </button>
            </div>
            
            <div className="relative">
              <input 
                autoFocus
                type="text" 
                placeholder="Ex: Alfabeto, Números..."
                defaultValue={searchParams.get("busca")?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-3xl py-5 px-6 text-lg font-bold text-gray-900 outline-none focus:border-purple-500 transition-all shadow-inner"
              />
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-purple-600" size={24} />
            </div>

            <div className="mt-10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Sugestões de busca:</p>
              <div className="flex flex-wrap gap-3">
                {['Alfabeto', 'Números', 'Colorir', 'Lógica', 'Vogais'].map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => {
                      handleSearch(tag);
                      setIsSearchOpen(false); // Fecha o menu ao clicar em uma tag
                    }}
                    className="px-5 py-2.5 bg-purple-50 text-purple-700 rounded-2xl text-sm font-black border-2 border-purple-100 active:bg-purple-600 active:text-white transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="md:hidden absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-xl shadow-md border border-gray-100">
             <Sparkles className="text-purple-600" size={20} />
          </div>
          <span className="font-fredoka font-black text-purple-600 drop-shadow-md">TIA RAFA</span>
        </Link>
      </div>
    </>
  );
}