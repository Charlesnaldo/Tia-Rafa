"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Mail, Download, ArrowRight, Sparkles, Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti"; // Opcional: npm install canvas-confetti

export default function SucessoPage() {
  // Efeito de confete ao carregar para celebrar a compra
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDFB] font-fredoka flex items-center justify-center p-6">
      <main className="max-w-2xl w-full">
        <div className="bg-white rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(34,197,94,0.15)] border border-green-50 overflow-hidden text-center p-12 md:p-20 relative">
          
          {/* Elemento Decorativo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400"></div>

          {/* Ícone de Sucesso Animado */}
          <div className="mb-10 relative inline-block">
            <div className="absolute inset-0 bg-green-100 rounded-full scale-150 animate-ping opacity-20"></div>
            <div className="relative bg-green-500 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
              <CheckCircle2 size={48} strokeWidth={3} />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            ¡Pagamento Confirmado!
          </h1>
          
          <p className="text-gray-500 text-xl font-medium leading-relaxed mb-12">
            Oba! Ficamos muito felizes com sua compra. O material da <span className="text-orange-500 font-bold">Tia Rafa</span> já foi enviado para o seu e-mail.
          </p>

          {/* Card de Próximos Passos */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 mb-12 text-left space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <Sparkles size={16} className="text-yellow-500" /> Próximos Passos
            </h3>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Mail className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="font-black text-gray-800">Verifique seu E-mail</p>
                <p className="text-sm text-gray-500">Procure pela confirmação e o link de download (olhe também na caixa de spam).</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Download className="text-purple-500" size={24} />
              </div>
              <div>
                <p className="font-black text-gray-800">Baixe e Imprima</p>
                <p className="text-sm text-gray-500">O arquivo está em formato PDF de alta qualidade, pronto para uso.</p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="flex-1 bg-gray-900 text-white font-black py-5 rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl">
              VOLTAR AO SITE
            </Link>
            <Link 
              href="https://instagram.com/seu_perfil" 
              target="_blank"
              className="flex-1 bg-gradient-to-tr from-orange-500 to-pink-500 text-white font-black py-5 rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              <Instagram size={20} /> MEU INSTAGRAM
            </Link>
          </div>

          {/* Assinatura Rafa */}
          <div className="mt-16 pt-10 border-t border-gray-100 flex items-center justify-center gap-4 text-left">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange-100">
               <Image src="/perfil.png" fill className="object-cover" alt="Rafa" />
            </div>
            <div>
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-tighter">Qualquer dúvida, me chame!</p>
              <p className="font-bold text-gray-700">Com carinho, Tia Rafa.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}