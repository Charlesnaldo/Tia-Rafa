"use client";

interface ProductProps {
  title: string;
  description: string;
  price: string;
  imageColor: string; // Para simular uma capa enquanto não temos fotos reais
}

export default function ProductCard({ title, description, price, imageColor }: ProductProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-start transition-all hover:shadow-xl hover:-translate-y-1">
      {/* Thumbnail do PDF */}
      <div className={`w-full h-52 ${imageColor} rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
        <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span className="absolute bottom-3 right-3 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-500">PDF</span>
      </div>

      {/* Info do Produto */}
      <h3 className="text-xl font-extrabold text-gray-800">{title}</h3>
      <p className="text-gray-500 mt-2 text-sm leading-relaxed">
        {description}
      </p>

      {/* Preço e Ação */}
      <div className="mt-6 w-full flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 block uppercase font-bold">Investimento</span>
          <span className="text-2xl font-black text-purple-600">R$ {price}</span>
        </div>
        
        <button className="bg-pink-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-pink-600 transition shadow-lg shadow-pink-200 active:scale-95">
          Comprar
        </button>
      </div>
    </div>
  );
}