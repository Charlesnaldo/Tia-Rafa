import Link from 'next/link';
import { Mail, MessageCircle, Instagram, Youtube, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#FFF5F0] pt-20 pb-10 overflow-hidden">
      {/* A cor #FFF5F0 é um "Bisque" bem clarinho, 
          que remete a tons de pele clara/pêssego, 
          passando muita calma e carinho.
      */}

      {/* Detalhe decorativo no topo do footer (Onda sutil) */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
        <svg className="relative block w-[calc(100%+1.3px)] h-[40px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#FFFFFF"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 font-fredoka">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Coluna 1: Marca */}
          <div className="flex flex-col gap-6">
            <div>
              <Link href="/" className="text-3xl font-black tracking-tighter">
                <span className="text-purple-600">TIA</span> 
                <span className="text-pink-500 ml-1 italic">RAFA</span>
              </Link>
              <div className="h-1.5 w-16 bg-orange-200 rounded-full mt-1" />
            </div>
            <p className="text-amber-900/70 font-medium leading-relaxed">
              Materiais pensados no desenvolvimento afetuoso e colorido das nossas crianças. 🎨
            </p>
            <div className="flex gap-4">
              <Instagram className="text-orange-400 hover:scale-110 transition cursor-pointer" size={24} />
              <Youtube className="text-orange-400 hover:scale-110 transition cursor-pointer" size={24} />
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h4 className="text-amber-900 font-black text-lg mb-6">Explorar 🚀</h4>
            <ul className="space-y-4 text-amber-800/80 font-bold">
              <li><Link href="#materiais" className="hover:text-orange-500 transition">✨ Materiais PDF</Link></li>
              <li><Link href="#sobre" className="hover:text-orange-500 transition">👩‍🏫 Sobre a Tia</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div>
            <h4 className="text-amber-900 font-black text-lg mb-6">Dúvidas? 👋</h4>
            <div className="space-y-4 text-amber-800/80 font-bold">
              <div className="flex items-center gap-3">
                <Mail className="text-orange-300" size={20} />
                <span className="text-sm">ola@tiarafa.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="text-orange-300" size={20} />
                <span className="text-sm">(11) 98888-7777</span>
              </div>
            </div>
          </div>

          {/* Coluna 4: Card de Segurança */}
          <div className="bg-orange-100/50 p-6 rounded-[2.5rem] border-2 border-orange-200/50">
            <h4 className="text-orange-700 font-black mb-2 flex items-center gap-2">
              Segurança <Heart size={16} fill="currentColor" className="text-pink-400" />
            </h4>
            <p className="text-orange-800/60 text-xs font-bold leading-relaxed">
              Seu material chega direto no seu e-mail após o pagamento seguro.
            </p>
          </div>

        </div>

        {/* Rodapé final */}
        <div className="pt-8 border-t border-orange-200/30 text-center">
          <p className="text-orange-300 text-[10px] font-black uppercase tracking-[0.2em]">
            © 2026 Tia Rafa • Materiais Didáticos com Afeto
          </p>
        </div>
      </div>
    </footer>
  );
}