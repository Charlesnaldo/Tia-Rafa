import Link from 'next/link';
import { Mail, MessageCircle, Instagram, Youtube, Heart, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-white pt-24 pb-12 overflow-hidden border-t border-gray-50">
      {/* Elementos decorativos de fundo que imitam o Hero */}
      <div 
    className="absolute inset-0 opacity-40 pointer-events-none" 
   style={{ 
          backgroundImage: "url('/fundo-footer.jpg')", 
          backgroundSize: 'cover',      /* Faz a imagem cobrir toda a área sem distorcer */
          backgroundPosition: 'center', /* Centraliza a foto */
          backgroundRepeat: 'no-repeat' /* Impede que a foto se repita */
        }}

        
  />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 font-fredoka">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Coluna 1: Branding & Manifesto */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="group">
              <Link href="/" className="text-4xl font-black tracking-tighter inline-block transition-transform group-hover:-rotate-2">
                <span className="text-purple-600">TIA</span> 
                <span className="text-pink-500 ml-1 italic">RAFA</span>
              </Link>
              <div className="h-2 w-20 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-full mt-2" />
            </div>
            
            <p className="text-gray-600 text-lg font-medium leading-relaxed max-w-sm">
              Educar com <span className="text-purple-600 font-bold">Amor e Cor</span>. Materiais didáticos pensados para transformar o aprendizado numa jornada mágica. 🎨
            </p>

            {/* Redes Sociais Estilo Hero */}
            <div className="flex gap-4">
              {[
                { icon: Instagram, color: 'hover:bg-pink-500' },
                { icon: Youtube, color: 'hover:bg-red-500' },
                { icon: MessageCircle, color: 'hover:bg-green-500' }
              ].map((social, i) => (
                <button key={i} className={`w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-white ${social.color} transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1`}>
                  <social.icon size={22} />
                </button>
              ))}
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="lg:col-span-2">
            <h4 className="text-gray-900 font-black text-xl mb-8 flex items-center gap-2">
              Explorar <Sparkles size={16} className="text-orange-400" />
            </h4>
            <ul className="space-y-4">
              {['Materiais PDF', 'Sobre a Tia', 'Blog', 'Área do Aluno'].map((link) => (
                <li key={link}>
                  <Link href="#" className="group flex items-center text-gray-500 hover:text-purple-600 font-bold transition-colors">
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all mr-2 text-pink-500" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Contato & Suporte */}
          <div className="lg:col-span-3">
            <h4 className="text-gray-900 font-black text-xl mb-8">Dúvidas? 👋</h4>
            <div className="space-y-4">
              <a href="mailto:ola@tiarafa.com" className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                  <Mail size={20} />
                </div>
                <span className="text-gray-600 font-bold">sac@tiarafa.com.br</span>
              </a>
              <a href="#" className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                <div className="bg-green-100 p-2.5 rounded-xl text-green-600 group-hover:scale-110 transition-transform">
                  <MessageCircle size={20} />
                </div>
                <span className="text-gray-600 font-bold">(85) 98512-2803</span>
              </a>
            </div>
          </div>

          {/* Coluna 4: Card de Segurança (Estilo Hero) */}
          <div className="lg:col-span-3 flex flex-col justify-start">
            <div className="relative group">
              {/* Brilho de fundo no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity" />
              
              <div className="relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/20">
                <h4 className="text-gray-900 font-black mb-3 flex items-center gap-2 text-lg">
                  Segurança <Heart size={18} fill="#f472b6" className="text-pink-400 animate-pulse" />
                </h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                  Seu material chega instantaneamente após o pagamento seguro.
                </p>
                <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                   <ShieldCheck size={24} className="text-blue-500" />
                   <span className="text-[10px] font-black pt-2 uppercase tracking-tighter text-gray-400">Pagamento Protegido</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Rodapé final */}
        <div className="pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-800 text-[11px] font-black uppercase tracking-[0.3em]">
            © 2026 Tia Rafa • Feito com ❤️ para pequenos grandes gênios
          </p>
          <div className="flex items-center gap-8 text-[11px] font-black text-gray-900 uppercase tracking-widest">
            <Link href="#" className="hover:text-purple-600 transition">Privacidade</Link>
            <Link href="#" className="hover:text-purple-600 transition">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}