"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  ChevronLeft,
  Mail,
  Sparkles,
  Heart,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Zap,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Script from 'next/script';
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { PRODUTOS_LISTA } from "@/constants/produtos";

export default function CheckoutClient() {
  const { cartItems, cartTotal, itemCount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isMpReady, setIsMpReady] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Payment
  const paymentBrickRef = useRef<any>(null);
  const preferenceIdRef = useRef<string | null>(null);
  const initializingRef = useRef(false);

  // Sincroniza o ref sempre que o preferenceId muda
  useEffect(() => {
    preferenceIdRef.current = preferenceId;
  }, [preferenceId]);

  useEffect(() => {
    const renderPaymentBrick = async (retryCount = 0) => {
      if (step !== 2) return;

      console.log(`Tentativa ${retryCount + 1}: Renderizar Brick. States:`, { preferenceId, isMpReady, itemCount, hasRef: !!paymentBrickRef.current });

      if (!preferenceId || !isMpReady || itemCount === 0) {
        console.log("Aguardando condições SDK/Preferência...");
        return;
      }

      const container = document.getElementById('payment-brick-container');

      if (!container) {
        if (retryCount < 10) {
          console.warn(`Container não encontrado. Tentando novamente em 200ms... (${retryCount + 1}/10)`);
          setTimeout(() => renderPaymentBrick(retryCount + 1), 200);
        } else {
          console.error("ERRO CRÍTICO: Container 'payment-brick-container' não apareceu no DOM após 2 segundos.");
        }
        return;
      }

      // Se já existir uma instância, vamos destruí-la para garantir que a nova use o ID correto
      if (paymentBrickRef.current) {
        console.log("Reiniciando Brick para novo ID...");
        try {
          await paymentBrickRef.current.unmount();
          paymentBrickRef.current = null;
        } catch (e) {
          console.warn("Erro ao desmontar brick anterior:", e);
        }
      }

      try {
        const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
        if (!publicKey) {
          console.error("ERRO: NEXT_PUBLIC_MP_PUBLIC_KEY ausente.");
          return;
        }

        const mp = new (window as any).MercadoPago(publicKey, { locale: 'pt-BR' });
        const bricksBuilder = mp.bricks();

        const settings = {
          initialization: {
            amount: Number(cartTotal) / 100,
            preferenceId: preferenceId,
          },
          mercadoPago: mp,
          customization: {
            visual: {
              style: {
                theme: 'flat', // Mudar tema para ver se resolve erro de renderização
                customVariables: {
                  borderRadius: '20px',
                }
              }
            },
            paymentMethods: {
              ticket: "all",
              bankTransfer: "all",
              creditCard: "all",
              debitCard: "all",
            }
          },
          callbacks: {
            onReady: () => {
              console.log("MERCADO PAGO: Componente pronto!");
              setLoading(false);
            },
            onSubmit: ({ selectedPaymentMethod, formData }: any) => {
              const currentId = preferenceIdRef.current;
              if (!currentId || currentId === "undefined") {
                alert("Erro: ID de preferência não encontrado.");
                return;
              }

              return new Promise((resolve, reject) => {
                const payload = {
                  ...formData,
                  preferenceId: String(currentId).trim(),
                  payment_method_id: selectedPaymentMethod
                };
                fetch("/api/process_payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                })
                  .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.details || data.error || "Erro ao processar");
                    return data;
                  })
                  .then((res) => {
                    if (res.status === 'approved') {
                      clearCart();
                      window.location.href = `/sucesso?payment_id=${res.id}&status=approved`;
                    }
                    resolve(res);
                  })
                  .catch((err) => {
                    console.error("MERCADO PAGO: Erro fatal:", err);
                    alert(`Não foi possível finalizar: ${err.message}`);
                    reject(err);
                  });
              });
            },
            onError: (error: any) => {
              console.error("Erro SDK Mercado Pago:", error);
              setLoading(false);
            },
          },
        };

        // Renderização com verificação de estabilidade do container
        const initBrick = async () => {
          if (initializingRef.current) return;
          initializingRef.current = true;

          try {
            if (paymentBrickRef.current) {
              await paymentBrickRef.current.unmount();
              paymentBrickRef.current = null;
            }

            // Garantia de que o container tem largura antes de criar o Brick (evita erro de SVG)
            const checkContainer = async () => {
              for (let i = 0; i < 30; i++) {
                const el = document.getElementById('payment-brick-container');
                if (el && el.clientWidth > 100) return true; // Espera ter pelo menos 100px
                await new Promise(r => setTimeout(r, 150));
              }
              return false;
            };

            const isStable = await checkContainer();
            if (isStable) {
              await new Promise(r => setTimeout(r, 300)); // Delay extra de segurança para o layout estabilizar
            }

            const brickInstance = await bricksBuilder.create('payment', 'payment-brick-container', settings);
            paymentBrickRef.current = brickInstance;
          } catch (e) {
            console.error("Erro ao criar Brick:", e);
          } finally {
            initializingRef.current = false;
          }
        };

        initBrick();
      } catch (err) {
        console.error("Falha ao inicializar SDK:", err);
        setLoading(false);
      }
    };

    renderPaymentBrick();
  }, [preferenceId, isMpReady, step]);

  if (itemCount === 0 && !preferenceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-48 h-48 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-bounce duration-3000">
          <ShoppingBag size={80} className="text-blue-300" />
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-2">Ops! Seu carrinho está vazio</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Que tal escolher alguns materiais mágicos para começar?</p>
        <Link href="/" className="bg-pink-400 hover:bg-pink-500 text-white font-black px-10 py-4 rounded-full shadow-lg shadow-pink-100 transition-all hover:scale-105 active:scale-95">
          VER MATERIAIS
        </Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    console.log("Btn Continuar clicado. Email:", email);
    if (!email.includes("@") || email.length < 5) return alert("Por favor, insira um e-mail válido");

    setLoading(true);
    try {
      console.log("Chamando /api/checkout...");
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartItems,
          emailCliente: email,
          nomeCliente: nome,
          telefoneCliente: telefone,
          cpfCliente: cpf,
          cartTotal: cartTotal
        }),
      });

      const data = await response.json();
      console.log("Resposta da API /api/checkout:", data);

      if (data.preferenceId) {
        console.log("Preference ID recebido:", data.preferenceId);
        setPreferenceId(data.preferenceId);
        setStep(2);
      } else {
        console.error("Erro retornado pela API:", data.error);
        throw new Error(data.error || "Erro ao gerar preferência");
      }
    } catch (error: any) {
      setLoading(false);
      console.error("Erro FATAL ao iniciar checkout:", error);
      alert(`Erro: ${error.message || "Ocorreu um erro ao processar o checkout."}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] font-fredoka py-8 px-4 sm:px-6 lg:px-8">
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
        onLoad={() => setIsMpReady(true)}
      />

      <div className="max-w-5xl mx-auto">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-12 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${step >= 1 ? 'bg-blue-400 text-white shadow-lg shadow-blue-100' : 'bg-gray-200 text-gray-500'}`}>
              {step > 1 ? <CheckCircle2 size={24} /> : "1"}
            </div>
            <span className={`hidden sm:block font-bold ${step >= 1 ? 'text-blue-500' : 'text-gray-400'}`}>Identificação</span>
          </div>
          <div className={`h-1 w-12 sm:w-20 rounded-full ${step >= 2 ? 'bg-blue-400' : 'bg-gray-200'}`} />
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${step >= 2 ? 'bg-blue-400 text-white shadow-lg shadow-blue-100' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <span className={`hidden sm:block font-bold ${step >= 2 ? 'text-blue-500' : 'text-gray-400'}`}>Pagamento</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Summary (4 cols) */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6 order-2 lg:order-1">
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-blue-50 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 blur-2xl" />

              <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-500">
                  <ShoppingBag size={24} />
                </div>
                <h2 className="text-xl font-black text-gray-800">Resumo do Pedido</h2>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map(item => {
                  const produto = PRODUTOS_LISTA[item.id];
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50 hover:bg-white transition-colors border border-transparent hover:border-blue-100"
                    >
                      <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-gray-100">
                        <Image
                          src={produto?.imagens?.[0] || "/img/placeholder.png"}
                          width={64}
                          height={64}
                          alt={item.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-gray-800 truncate text-sm">{item.nome}</h4>
                        <p className="text-xs text-blue-400 font-bold">Qtd: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-700 text-sm">{formatCurrency(item.preco * item.quantity)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-100 space-y-3">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-xl text-green-600 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="fill-green-600" />
                    <span className="font-bold">Entrega Digital</span>
                  </div>
                  <span className="font-black uppercase tracking-wider text-[10px]">Grátis</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-lg font-black text-gray-800 uppercase tracking-tighter">Total</span>
                  <span className="text-3xl font-black text-blue-500 tracking-tight">{formatCurrency(cartTotal)}</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center gap-2 shadow-sm">
                <div className="bg-pink-50 p-2 rounded-full text-pink-400">
                  <Lock size={20} />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 leading-tight">Pagamento 100% Seguro</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center gap-2 shadow-sm">
                <div className="bg-blue-50 p-2 rounded-full text-blue-400">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 leading-tight">Acesso Imediato ao Material</span>
              </div>
            </div>

            <Link href="/carrinho" className="flex items-center justify-center gap-2 text-gray-400 font-bold hover:text-blue-400 transition-colors group text-sm mt-6">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Editar carrinho
            </Link>
          </div>

          {/* Right Column: Steps (7 cols) */}
          <div className="lg:col-span-12 xl:col-span-7 order-1 lg:order-2">
            <div className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(149,157,165,0.06)] border border-pink-50 min-h-[600px] relative">
              {step === 1 ? (
                <div key="step-1" className="space-y-8">
                  <div className="text-center space-y-2">
                    <div className="inline-block bg-pink-50 p-3 rounded-2xl mb-2">
                      <Sparkles className="text-pink-400 animate-pulse" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800">Vamos começar! ✨</h2>
                    <p className="text-gray-400 font-medium">Onde você deseja receber seu material mágico?</p>
                  </div>

                  <div className="space-y-6">
                    {/* Campos de formulário (Nome, Email, Telefone, CPF) */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">Nome Completo</label>
                      <input type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-8 py-5 bg-[#F8FAFF] border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] outline-none font-bold text-gray-700 transition-all text-lg" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">E-mail para entrega</label>
                      <input type="email" placeholder="seu-email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-8 py-5 bg-[#F8FAFF] border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] outline-none font-bold text-gray-700 transition-all text-lg" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">WhatsApp / Telefone</label>
                      <input type="tel" placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full px-8 py-5 bg-[#F8FAFF] border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] outline-none font-bold text-gray-700 transition-all text-lg" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">CPF (Obrigatório para PIX)</label>
                      <input type="text" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} className="w-full px-8 py-5 bg-[#F8FAFF] border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] outline-none font-bold text-gray-700 transition-all text-lg" />
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={loading || !email.includes("@") || nome.length < 3 || cpf.replace(/\D/g, '').length < 11}
                      className="w-full bg-blue-400 hover:bg-blue-500 disabled:bg-gray-100 disabled:text-gray-300 text-white font-black py-7 rounded-[2.5rem] text-xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-95 group relative overflow-hidden"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : (
                        <>
                          <span className="relative z-10">CONTINUAR PARA PAGAMENTO</span>
                          <ArrowRight size={22} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div key="step-2" className="space-y-6">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <button onClick={() => setStep(1)} className="flex items-center gap-1 text-gray-400 hover:text-blue-500 font-bold transition-colors text-sm">
                      <ChevronLeft size={16} /> Mudar e-mail
                    </button>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full text-green-600 text-[10px] font-black uppercase">
                      <CheckCircle2 size={12} /> E-mail Identificado
                    </div>
                  </div>
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-black text-gray-800">Finalizar Compra Segura</h2>
                    <p className="text-gray-400 text-sm font-medium">Escolha a melhor forma de pagamento para você</p>
                  </div>
                  <div
                    key={preferenceId || 'no-id'}
                    id="payment-brick-container"
                    className="w-full relative"
                    style={{ minHeight: '800px', width: '100%', display: 'block' }}
                  >
                    {loading && (
                      <div className="flex flex-col items-center justify-center py-20 text-blue-300 gap-4">
                        <Loader2 className="animate-spin" size={40} />
                        <p className="font-bold">Carregando formulário...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Guarantees */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400 text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-blue-300" /> Ambiente 100% Criptografado</div>
              <div className="flex items-center gap-2"><Heart size={18} className="text-pink-300" /> Feito com Amor pedagógico</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        #payment-brick-container svg {
          width: 50px !important;
          height: 50px !important;
        }
        #payment-brick-container .mp-brick-payment-method-icon svg {
           width: 40px !important;
           height: 40px !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
}
