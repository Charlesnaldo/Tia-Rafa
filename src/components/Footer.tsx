import Link from 'next/link';
import Image from 'next/image';
import { Mail, MessageCircle, Instagram, Youtube, Heart, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative pt-8 pb-12 overflow-hidden font-fredoka bg-[#FDFDFF]">
      {/* RESTAURADO: Background Layer original */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-90">
          <Image
            src="/fundo-footer.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 to-purple-50/50" />
      </div>

      

      {/* Elementos Decorativos de UI */}
      <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-pink-200/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          

          <div className="lg:col-span-4 space-y-8 text-center lg:text-left">
            <div className="inline-block mx-auto lg:mx-0">
              <Link href="/" className="group block">
               
                <div className="relative">
                  <Image 
                    src="/logo.webp" 
                    alt="Logo Tia Rafa" 
                    width={240} 
                    height={80} 
                    className="object-contain transform group-hover:scale-120 transition-transform duration-600"
                  />
                </div>
                <div className="h-2.5 w-full bg-gradient-to-r from-purple-400 via-pink-300 to-orange-300 rounded-full mt-1 transform origin-left group-hover:scale-x-105 transition-transform" />
              </Link>
            </div>
            
            <p className="text-gray-600 text-lg font-bold leading-relaxed max-w-sm mx-auto lg:mx-0">
              Transformando a educação em uma <span className="text-purple-500 font-black">experiência mágica</span> através do lúdico e do afeto. 🎨✨
            </p>

            <div className="flex gap-4 justify-center lg:justify-start">
              <a href="https://www.instagram.com/tia_rafaprof/" target="_blank" className="w-12 h-12 bg-pink-400 shadow-lg shadow-pink-200 rounded-[1.2rem] flex items-center justify-center text-white hover:-translate-y-2 transition-all duration-300">
                <Instagram size={22} strokeWidth={2.5} />
              </a>
              <a href="https://youtube.com" target="_blank" className="w-12 h-12 bg-red-400 shadow-lg shadow-red-200 rounded-[1.2rem] flex items-center justify-center text-white hover:-translate-y-2 transition-all duration-300">
                <Youtube size={22} strokeWidth={2.5} />
              </a>
              <a href="https://wa.me/5500000000000" target="_blank" className="w-12 h-12 bg-green-400 shadow-lg shadow-green-200 rounded-[1.2rem] flex items-center justify-center text-white hover:-translate-y-2 transition-all duration-300">
                <MessageCircle size={22} strokeWidth={2.5} />
              </a>
            </div>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div className="lg:col-span-2 text-center lg:text-left">
            <h4 className="text-gray-800 font-black text-xl mb-8 flex items-center justify-center lg:justify-start gap-2">
              Explorar <Sparkles size={40} className="text-yellow-400" />
            </h4>
            <ul className="space-y-4">
              {[
                { label: "Materiais PDF", href: "/#catalogo" },
                { label: "Sobre a Tia", href: "/sobre" },
                { label: "Blog", href: "/blog" },
                { label: "Area do Aluno", href: "/area-do-aluno" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="group text-gray-500 hover:text-purple-500 font-black transition-all flex items-center justify-center lg:justify-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-300 group-hover:w-4 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Card de Contato */}
          <div className="lg:col-span-3">
             <div className="bg-white/60 p-7 rounded-[3rem] border-2 border-white shadow-2xl shadow-purple-100/40 backdrop-blur-md text-center lg:text-left">
                <h4 className="text-gray-800 font-black text-xl mb-6">Dúvidas? 👋</h4>
                <div className="space-y-4">
                  <a href="mailto:sac@tiarafa.com.br" className="flex items-center justify-center lg:justify-start gap-3 p-4 bg-purple-50/50 rounded-[1.8rem] border-2 border-transparent hover:border-purple-100 transition-all group">
                    <div className="bg-purple-500 text-white p-2.5 rounded-2xl group-hover:rotate-12 transition-transform">
                      <Mail size={20} />
                    </div>
                    <span className="text-gray-700 font-black text-[14px] break-all">sac@tiarafa.com.br</span>
                  </a>
                  <a href="#" className="flex items-center justify-center lg:justify-start gap-3 p-4 bg-green-50/50 rounded-[1.8rem] border-2 border-transparent hover:border-green-100 transition-all group">
                    <div className="bg-green-400 text-white p-2.5 rounded-2xl group-hover:rotate-12 transition-transform">
                      <MessageCircle size={18} />
                    </div>
                    <span className="text-gray-700 font-black text-[14px]">(85) 98512-2803</span>
                  </a>
                </div>
             </div>
          </div>

          {/* Coluna 4: Badge de Confiança */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[3rem] p-8 border-2 border-pink-50 shadow-xl shadow-pink-100/30 relative text-center lg:text-left">
              <div className="bg-pink-400 w-14 h-14 rounded-[1.5rem] flex items-center justify-center mb-5 mx-auto lg:mx-0 shadow-lg shadow-pink-200">
                <ShieldCheck className="text-white" size={30} />
              </div>
              <h4 className="text-gray-800 font-black text-xl mb-3">100% Seguro</h4>
              <p className="text-gray-500 text-sm font-bold leading-relaxed mb-6">
                Pagamento processado com segurança e entrega imediata por e-mail.
              </p>
              <div className="flex items-center gap-2 bg-pink-50 py-2 px-4 rounded-full w-fit mx-auto lg:mx-0">
                <Heart size={14} className="text-pink-400" fill="currentColor" />
                <span className="text-[10px] font-black uppercase text-pink-400 tracking-wider">Qualidade Tia Rafa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Legal */}
        <div className="pt-10 border-t-1 border-purple-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-[12px] font-black uppercase tracking-[0.2em]">
              © 2026 Tia Rafa Materiais Didáticos
            </p>
          </div>
          
          <div className="flex items-center gap-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.15em]">
            <Link href="#" className="hover:text-purple-600 transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-purple-600 transition-colors">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

