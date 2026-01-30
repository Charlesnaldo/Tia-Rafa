"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PRODUTOS_LISTA } from "@/constants/produtos";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Loader2,
  Mail,
  ChevronLeft,
  Lock
} from "lucide-react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: ""
  });

  // 1. Pega o ID da URL (?id=volta-as-aulas)
  const idDoProduto = searchParams.get("id") || "";

  // 2. Busca os dados no seu objeto PRODUTOS_LISTA
  const produto = PRODUTOS_LISTA[idDoProduto];

  // Caso o produto não exista na lista
  if (!produto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-fredoka">
        <h2 className="text-2xl font-black mb-4">Ops! Produto não encontrado.</h2>
        <Link href="/#catalogo" className="text-purple-600 font-bold underline">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!email || !email.includes("@")) {
      alert("Por favor, insira um e-mail válido para receber seu material.");
      return;
    }

    if (produto.tipo === 'fisico') {
      if (!endereco.cep || !endereco.rua || !endereco.numero || !endereco.cidade) {
        alert("Por favor, preencha o seu endereço completo para a entrega.");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: idDoProduto, // Enviamos apenas o ID, a API busca o resto
          emailCliente: email,
          endereco: produto.tipo === 'fisico' ? endereco : undefined
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redireciona para o Mercado Pago
      } else {
        throw new Error(data.error || "Erro ao gerar link de pagamento");
      }
    } catch (error: any) {
      alert("Ocorreu um erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-fredoka py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Botão Voltar */}
        <Link href={`/produto/${idDoProduto}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-800 transition-all font-bold mb-8 group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para detalhes
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Coluna Esquerda: Resumo (40%) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Finalizar Pedido</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${produto.tipo === 'digital' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                }`}>
                {produto.tipo === 'digital' ? 'Arquivo Digital' : 'Produto Físico'}
              </span>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-5 items-center">
              <div className={`w-24 h-24 ${produto.cor} rounded-3xl relative overflow-hidden shrink-0 shadow-inner`}>
                <Image
                  src={produto.imagem}
                  fill
                  className="object-cover p-2"
                  alt={produto.nome}
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-black text-gray-800 text-lg leading-tight mb-1">
                  {produto.nome}
                </h3>
                <p className="text-purple-600 font-black text-xl">R$ {formatCurrency(produto.preco)}</p>
                <span className="text-[10px] bg-purple-50 text-purple-500 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                  {produto.tipo === 'digital' ? 'Material Digital PDF' : 'Produto de Alta Qualidade'}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-gray-500 font-bold text-sm">
                <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600"><Zap size={18} /></div>
                {produto.tipo === 'digital' ? 'Acesso imediato após o pagamento' : 'Envio rápido e seguro via Correios'}
              </div>
              <div className="flex items-center gap-3 text-gray-500 font-bold text-sm">
                <div className="bg-green-100 p-2 rounded-xl text-green-600"><ShieldCheck size={18} /></div>
                Pagamento processado pelo Mercado Pago
              </div>
            </div>
          </div>

          {/* Coluna Direita: Checkout (60%) */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl shadow-gray-200/50 border border-gray-50">

            <div className="flex items-center gap-2 text-gray-400 mb-8 font-bold text-sm uppercase tracking-widest">
              <Lock size={14} />
              Ambiente Seguro
            </div>

            <div className="space-y-6">
              {/* Campo de E-mail */}
              <div>
                <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">
                  {produto.tipo === 'digital' ? 'E-mail para receber o material' : 'E-mail para contato e rastreio'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="email"
                    placeholder="seu-email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-purple-200 focus:bg-white rounded-2xl outline-none font-bold text-gray-700 transition-all"
                  />
                </div>
              </div>

              {/* Campos de Endereço (se físico) */}
              {produto.tipo === 'fisico' && (
                <div className="pt-4 space-y-4 border-t border-gray-100 mt-4">
                  <h4 className="text-gray-400 font-black text-xs uppercase tracking-widest mb-4">Dados de Entrega</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="CEP"
                      value={endereco.cep}
                      onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
                      className="col-span-1 p-4 bg-gray-50 rounded-xl outline-none font-bold text-gray-700 focus:bg-white border-2 border-transparent focus:border-purple-200 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={endereco.cidade}
                      onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
                      className="col-span-1 p-4 bg-gray-50 rounded-xl outline-none font-bold text-gray-700 focus:bg-white border-2 border-transparent focus:border-purple-200 transition-all"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Rua / Logradouro"
                    value={endereco.rua}
                    onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
                    className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold text-gray-700 focus:bg-white border-2 border-transparent focus:border-purple-200 transition-all"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Nº"
                      value={endereco.numero}
                      onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                      className="col-span-1 p-4 bg-gray-50 rounded-xl outline-none font-bold text-gray-700 focus:bg-white border-2 border-transparent focus:border-purple-200 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={endereco.bairro}
                      onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                      className="col-span-2 p-4 bg-gray-50 rounded-xl outline-none font-bold text-gray-700 focus:bg-white border-2 border-transparent focus:border-purple-200 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Divisor de Preço */}
              <div className="py-8 border-t border-gray-50 flex flex-col items-center">
                <span className="text-gray-400 font-bold text-sm uppercase mb-1">Total do Pedido</span>
                <h1 className="text-6xl font-black text-gray-900 leading-none">R$ {formatCurrency(produto.preco)}</h1>
                {produto.tipo === 'fisico' && <p className="text-green-500 font-bold text-sm mt-2">Frete Grátis incluso!</p>}
              </div>

              {/* Botão de Pagamento */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#2D3748] hover:bg-black disabled:bg-gray-300 text-white font-black py-6 rounded-[2rem] text-xl shadow-2xl transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    IR PARA PAGAMENTO
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>

              {/* Selos de Segurança */}
              <div className="flex flex-col items-center gap-4 pt-8">
                <div className="flex items-center gap-6 opacity-30 grayscale hover:opacity-100 transition-opacity">
                  <Image src="/mercadopago-logo.png" width={100} height={30} alt="Mercado Pago" unoptimized />
                </div>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                  Pix • Cartão de Crédito • Boleto
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Exportação principal com Suspense
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}