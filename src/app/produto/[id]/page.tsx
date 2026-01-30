import { PRODUTOS_LISTA } from "@/constants/produtos";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, ShieldCheck, Sparkles, Printer, Star, Package, Zap, Truck } from "lucide-react";
import BotaoCompra from "@/components/BotaoCompra";

export default async function ProdutoDetalhes({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const produto = PRODUTOS_LISTA[id];

  if (!produto) notFound();

  return (
    <main className="min-h-screen bg-[#FAFAFA] font-fredoka text-[#2D3748]">
      <nav className="max-w-6xl mx-auto px-6 py-8">
        <Link href="/#catalogo" className="group flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 transition-all">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para materiais educacionais
        </Link>
      </nav>

      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
        {/* Lado Esquerdo: Preview */}
        <div className="relative">
          <div className={`aspect-[4/5] ${produto.cor} rounded-[32px] overflow-hidden shadow-inner flex items-center justify-center p-12`}>
            <div className="w-full h-full bg-white shadow-2xl rounded-sm transform rotate-2 hover:rotate-0 transition-transform duration-500 overflow-hidden border-t-[12px] border-purple-200">
              <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover opacity-90" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
              <Sparkles size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-tight">Material<br />Premium</span>
          </div>
        </div>

        {/* Lado Direito: Info e Botão */}
        <div className="flex flex-col pt-4">
          <div className="flex items-center gap-2 text-purple-500 font-bold text-xs uppercase tracking-widest mb-4">
            <span className="w-8 h-[2px] bg-purple-500"></span>
            {produto.tipo === 'digital' ? 'Arquivo Digital' : 'Produto Físico'}
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-800 leading-[1.1]">
            {produto.nome}
          </h1>

          {/* Estrelas */}
          {produto.estrelas && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < produto.estrelas! ? "#FFD700" : "none"}
                    className={i < produto.estrelas! ? "text-yellow-400" : "text-gray-200"}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400 font-bold">({produto.estrelas}.0)</span>
            </div>
          )}

          <p className="text-lg text-gray-500 leading-relaxed mb-8">
            {produto.descricao || "Desenvolvido para facilitar o aprendizado de forma lúdica e eficaz, ideal para reforço escolar ou sala de aula."}
          </p>

          {/* Tags */}
          {produto.tags && produto.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {produto.tags.map(tag => (
                <span key={tag} className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold border border-purple-100">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-10">
            {produto.tipo === 'digital' ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                  <Printer className="text-blue-400" size={20} />
                  <span className="text-sm font-semibold">Pronto para imprimir</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                  <Zap className="text-yellow-400" size={20} />
                  <span className="text-sm font-semibold">Acesso imediato</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                  <Package className="text-orange-400" size={20} />
                  <span className="text-sm font-semibold">Alta qualidade</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
                  <Truck className="text-green-400" size={20} />
                  <span className="text-sm font-semibold">Frete grátis</span>
                </div>
              </>
            )}
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-gray-400 text-lg font-medium">Investimento:</span>
              <span className="text-4xl font-black">R$ {formatCurrency(produto.preco)}</span>
            </div>

            <BotaoCompra produto={produto} />

            <div className="mt-6 flex items-center justify-center gap-6 opacity-40 grayscale">
              <img src="/mercadopago-logo.png" alt="Mercado Pago" className="h-4" />
              <div className="w-[1px] h-4 bg-gray-400"></div>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <ShieldCheck size={12} />
                COMPRA SEGURA
              </div>
            </div>
          </div>

          {/* Depoimento */}
          {produto.depoimento && (
            <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-[2rem] border border-purple-100">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#FFD700" className="text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 font-medium italic mb-3">"{produto.depoimento.texto}"</p>
              <p className="text-sm font-black text-purple-600">— {produto.depoimento.autor}</p>
            </div>
          )}
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h3 className="text-2xl font-black mb-12">Como você vai receber?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {(produto.tipo === 'digital' ? [
            { t: "Pagamento", d: "Aprove o pagamento via PIX ou Cartão." },
            { t: "E-mail", d: "Receba o link de acesso no seu e-mail cadastrado." },
            { t: "Imprimir", d: "Imprima quantas vezes quiser e comece a usar!" }
          ] : [
            { t: "Pagamento", d: "Aprove o pagamento via PIX ou Cartão." },
            { t: "Preparação", d: "Preparamos seu pedido com muito carinho." },
            { t: "Entrega", d: "Receba em casa via Correios com código de rastreio!" }
          ]
          ).map((item, i) => (
            <div key={i} className="group p-8">
              <div className="text-4xl font-black text-gray-100 group-hover:text-purple-100 transition-colors mb-4">0{i + 1}</div>
              <h4 className="font-bold text-lg mb-2">{item.t}</h4>
              <p className="text-gray-400 text-sm">{item.d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}