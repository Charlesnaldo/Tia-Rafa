"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, ChevronLeft, Mail, Sparkles, Heart, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Script from 'next/script';
import { PRODUTOS_LISTA } from "@/constants/produtos"; // Keep this for now, though direct product access removed
import { formatCurrency } from "@/lib/utils";
// import SearchParamsClient from "./SearchParamsClient"; // Not needed if using cart context
import { useCart } from "@/context/CartContext"; // Import useCart

export default function CheckoutClient() {
  // const searchParams = SearchParamsClient(); // No longer needed for single product ID
  const { cartItems, cartTotal, itemCount, clearCart } = useCart(); // Get cart details
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isMpReady, setIsMpReady] = useState(false);
  const paymentBrickRef = useRef<any>(null);

  // const idDoProduto = searchParams.get("id") || ""; // No longer fetching single product
  // const produto = PRODUTOS_LISTA[idDoProduto]; // No longer fetching single product

  useEffect(() => {
    const renderPaymentBrick = async () => {
      // Only proceed if preferenceId is set, MP SDK is ready, cart is not empty, and brick hasn't rendered
      if (!preferenceId || !isMpReady || itemCount === 0 || paymentBrickRef.current) return;

      const container = document.getElementById('payment-brick-container');
      if (!container) return;

      try {
        const mp = new (window as any).MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, {
          locale: 'pt-BR'
        });
        const bricksBuilder = mp.bricks();

        const settings = {
          initialization: {
            amount: Number(cartTotal), // Use cartTotal for amount
            preferenceId: preferenceId,
          },
          customization: {
            visual: {
              style: { 
                theme: 'flat', 
                customVariables: {
                  borderRadiusBig: '20px',
                  borderRadiusMedium: '12px',
                  colorPrimary: '#60A5FA', 
                }
              }
            },
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              bankTransfer: "all",
              ticket: "all",
              maxInstallments: 12
            }
          },
          callbacks: {
            onReady: () => setLoading(false),
            onSubmit: ({ formData }: any) => {
              return new Promise((resolve, reject) => {
                fetch("/api/process_payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...formData, preferenceId }),
                })
                .then((res) => res.json())
                .then((res) => {
                  if (res.status === 'approved') {
                    clearCart(); // Clear cart on successful payment
                    // Optionally redirect to a success page
                  }
                  resolve(res);
                })
                .catch((err) => reject(err));
              });
            },
            onError: (error: any) => {
              console.error(error);
              setLoading(false);
            },
          },
        };

        const brickInstance = await bricksBuilder.create('payment', 'payment-brick-container', settings);
        paymentBrickRef.current = brickInstance;
      } catch (err) {
        console.error(err);
      }
    };

    renderPaymentBrick();
  }, [preferenceId, isMpReady, cartTotal, itemCount, clearCart]); // Add cartTotal, itemCount, clearCart to dependencies

  // If cart is empty, redirect to cart page or display a message
  if (itemCount === 0 && !preferenceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-bold text-gray-700">Seu carrinho está vazio!</p>
        <Link href="/carrinho" className="mt-4 text-blue-500 hover:underline">Ir para o carrinho</Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!email.includes("@")) return alert("E-mail inválido");
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems: cartItems, emailCliente: email, cartTotal: cartTotal }), // Send cartItems and cartTotal
      });
      const data = await response.json();
      if (data.preferenceId) setPreferenceId(data.preferenceId);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao iniciar checkout:", error);
      alert("Ocorreu um erro ao processar o checkout. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] font-fredoka py-10 px-4">
      <Script 
        src="https://sdk.mercadopago.com/js/v2" 
        strategy="afterInteractive"
        onLoad={() => setIsMpReady(true)}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header de Voltar */}
        <Link href={`/carrinho`} className="flex items-center gap-2 text-blue-400 font-bold mb-6 hover:text-pink-400 transition-colors group">
          <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow-md transition-all">
            <ChevronLeft size={20} />
          </div>
          Voltar para o Carrinho
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Coluna 1: Resumo do Pedido */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Sparkles className="text-yellow-300 animate-pulse" />
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Generic image for cart checkout */}
                <div className="w-40 h-40 bg-pink-50 rounded-[2rem] relative p-4 shadow-inner flex items-center justify-center">
                  <Image src="/img/placeholder.png" width={80} height={80} alt="Seu Carrinho" unoptimized />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-800 leading-tight">Seu Pedido</h1>
                  <p className="text-blue-400 font-black text-3xl mt-2">{formatCurrency(cartTotal)}</p>
                  <p className="text-gray-600 text-sm mt-1">Total de {itemCount} item(s)</p>
                </div>
              </div>

              {/* List of cart items for review */}
              <div className="mt-6 space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-gray-700 text-sm">
                    <span>{item.nome} (x{item.quantity})</span>
                    <span>{formatCurrency(item.preco * item.quantity)}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Banner Informativo */}
            <div className="bg-blue-400 p-6 rounded-[2rem] text-white flex items-center gap-4 shadow-lg shadow-blue-200">
              <div className="bg-white/20 p-3 rounded-2xl text-white">
                <ShieldCheck size={28} />
              </div>
              <p className="text-sm font-bold leading-tight">
                Seu material será enviado automaticamente para o e-mail cadastrado.
              </p>
            </div>
          </div>

          {/* Coluna 2: Checkout / Formulário */}
          <div className="bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(149,157,165,0.1)] border border-pink-50">
            {!preferenceId ? (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-black text-gray-700">Quase lá! ✨</h2>
                  <p className="text-gray-400 text-sm font-medium">Preencha seus dados para finalizar</p>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">E-mail para entrega</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300" size={20} />
                    <input
                      type="email"
                      placeholder="seu-email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-pink-50/30 border-2 border-transparent focus:border-pink-200 focus:bg-white rounded-[1.8rem] outline-none font-bold text-gray-700 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-blue-400 hover:bg-blue-500 disabled:bg-gray-200 text-white font-black py-6 rounded-[2rem] text-xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>CONTINUAR <Heart size={20} className="group-hover:fill-white transition-all" /></>
                  )}
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-gray-700 uppercase text-xs tracking-widest">Pagamento Seguro</h3>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-pink-200"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-200"></div>
                  </div>
                </div>
                {/* Onde o Mercado Pago renderiza */}
                <div id="payment-brick-container" className="min-h-[400px]"></div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}