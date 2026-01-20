"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, ShoppingCart, CheckCircle2, 
  FileText, Zap, ShieldCheck, Star 
} from "lucide-react";

// Simulando um banco de dados de produtos
const produtosData = {
  "1": {
    nome: "Alfabetização Mágica",
    preco: "7,90",
    descricao: "Um material completo desenvolvido para crianças em fase de alfabetização. Focado em consciência fonológica e reconhecimento de letras através de atividades lúdicas.",
    fotos: ["/prod1.jpg", "/prod1-detail1.jpg", "/prod1-detail2.jpg"],
    detalhes: ["50 páginas em PDF", "Atividades Coloridas", "Bônus: Flashcards de Vogais", "Uso Escolar ou Familiar"],
    tipo: "Arquivo Digital (PDF)"
  },
  // Adicione outros IDs conforme seu catálogo...
};

export default function ProdutoPage() {
  const { id } = useParams();
  const produto = produtosData[id as keyof typeof produtosData] || produtosData["1"];
  const [fotoAtiva, setFotoAtiva] = useState(0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-fredoka pb-32">
      {/* Header de Navegação */}
      <div className="max-w-7xl mx-auto px-6 pt-10 flex justify-between items-center">
        <Link href="/#catalogo" className="group flex items-center gap-2 text-gray-500 font-bold hover:text-purple-600 transition-all">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft size={20} />
          </div>
          VOLTAR
        </Link>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <Star className="text-yellow-400 fill-yellow-400" size={16} />
          <span className="text-sm font-black text-gray-700">4.9/5 Avaliações</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* COLUNA ESQUERDA: GALERIA DE FOTOS */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] bg-white rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              {/* Badge de PDF */}
              <div className="absolute top-6 right-6 z-10 bg-purple-600 text-white px-4 py-2 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2">
                <FileText size={16} /> PDF
              </div>
              
              <div className="w-full h-full bg-purple-50 flex items-center justify-center text-gray-300">
                {/* Aqui entrará a <Image src={produto.fotos[fotoAtiva]} fill ... /> */}
                FOTO PRINCIPAL {id}
              </div>
            </div>

            {/* Miniaturas */}
            <div className="flex gap-4">
              {produto.fotos.map((foto, index) => (
                <button 
                  key={index}
                  onClick={() => setFotoAtiva(index)}
                  className={`w-24 h-24 rounded-2xl border-4 transition-all overflow-hidden bg-white ${fotoAtiva === index ? 'border-purple-500 scale-105 shadow-lg' : 'border-transparent opacity-60'}`}
                >
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px]">THUMB</div>
                </button>
              ))}
            </div>
          </div>

          {/* COLUNA DIREITA: INFORMAÇÕES E COMPRA */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-50">
            <span className="text-purple-600 font-black text-sm uppercase tracking-widest">{produto.tipo}</span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-6 leading-tight">
              {produto.nome}
            </h1>

            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-gray-400 text-lg font-bold">R$</span>
              <span className="text-5xl font-black text-gray-900">{produto.preco}</span>
            </div>

            <p className="text-gray-500 text-lg font-medium leading-relaxed mb-10">
              {produto.descricao}
            </p>

            {/* Lista de Benefícios */}
            <div className="space-y-4 mb-12">
              {produto.detalhes.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-green-100 p-1 rounded-full">
                    <CheckCircle2 className="text-green-600" size={20} />
                  </div>
                  <span className="text-gray-700 font-bold">{item}</span>
                </div>
              ))}
            </div>

            {/* Botão de Checkout */}
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-6 rounded-[2rem] text-xl shadow-[0_20px_40px_rgba(147,51,234,0.3)] transition-all flex items-center justify-center gap-4 group">
              COMPRAR AGORA
              <ShoppingCart className="group-hover:translate-x-2 transition-transform" />
            </button>

            {/* Selos de Confiança */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Zap size={18} />
                <span className="text-xs font-bold uppercase">Entrega Imediata</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <ShieldCheck size={18} />
                <span className="text-xs font-bold uppercase">Compra Segura</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}