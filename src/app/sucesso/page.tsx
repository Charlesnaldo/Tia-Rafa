"use client";

import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Mail, Download, ArrowRight, Sparkles } from "lucide-react";

// 1. Criamos o conteúdo da página em um componente separado
function SucessoContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white font-fredoka flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-green-100 text-center relative overflow-hidden">
        
        {/* Elementos Decorativos */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles size={100} className="text-green-500" />
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-green-100 p-6 rounded-full">
            <CheckCircle size={60} className="text-green-600" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          Pagamento Confirmado!
        </h1>
        
        <p className="text-gray-500 text-lg mb-12 font-medium">
          Oba! Seu material premium já está sendo preparado e será enviado para o seu e-mail em instantes.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 text-left">
            <Mail className="text-orange-500 mb-3" />
            <h3 className="font-black text-gray-800 text-sm uppercase">Verifique seu E-mail</h3>
            <p className="text-xs text-gray-500 mt-1">Lembre-se de olhar a pasta de Spam ou Promoções.</p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 text-left">
            <Download className="text-blue-500 mb-3" />
            <h3 className="font-black text-gray-800 text-sm uppercase">Acesso Vitalício</h3>
            <p className="text-xs text-gray-500 mt-1">O link enviado não expira. Você pode baixar quando quiser.</p>
          </div>
        </div>

        <Link 
          href="/"
          className="inline-flex items-center gap-3 bg-gray-900 text-white font-black px-10 py-5 rounded-2xl hover:bg-orange-500 transition-all group"
        >
          VOLTAR PARA A LOJA
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        <p className="mt-8 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          Obrigado por confiar no trabalho da Tia Rafa! 🧡
        </p>
      </div>
    </div>
  );
}

// 2. O Export Default (Apenas UM por arquivo)
export default function SucessoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center"><p className="font-fredoka font-bold text-purple-500">Carregando alegria...</p></div>}>
      <SucessoContent />
    </Suspense>
  );
}