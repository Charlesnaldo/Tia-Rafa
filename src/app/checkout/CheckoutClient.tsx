"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Zap,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { PRODUTOS_LISTA } from "@/constants/produtos";
import { LastPaymentSessionData } from "@/types/payment";

type PaymentBrickFormData = Record<string, string | number | boolean | undefined> & {
  token?: string;
  issuer_id?: string;
  installments?: number;
  transaction_amount?: string;
};

type BrickSubmitPayload = {
  selectedPaymentMethod: string;
  formData: PaymentBrickFormData;
};

interface PaymentBrickController {
  unmount?: () => void;
}

interface MercadoPagoInstance {
  bricks: () => MercadoPagoBrickBuilder;
}

interface MercadoPagoConstructor {
  new (publicKey: string, options: { locale: string }): MercadoPagoInstance;
}

interface MercadoPagoBrickBuilder {
  create: (type: "payment", container: string, settings: MercadoPagoBrickSettings) => Promise<PaymentBrickController>;
}

interface MercadoPagoBrickSettings {
  initialization: {
    amount: number;
  };
  customization: {
    visual: {
      theme: "flat";
    };
    paymentMethods: Record<string, "all">;
  };
  callbacks: {
    onReady: () => void;
    onSubmit: (payload: BrickSubmitPayload) => Promise<void>;
    onError: (error: Error) => void;
  };
  mercadoPago: MercadoPagoInstance;
}

type MercadoPagoWindow = Window & {
  MercadoPago?: MercadoPagoConstructor;
};

const shouldIgnoreSvgError = (value: unknown) => {
  if (!value) return false;
  const message =
    typeof value === "string"
      ? value
      : value instanceof Error
        ? value.message
        : typeof value === "object" && value !== null
          ? (value as { message?: unknown }).message
          : undefined;

  if (typeof message !== "string") return false;
  return message.includes('<svg> attribute width') || message.includes('<svg> attribute height');
};

export default function CheckoutClient() {
  const { cartItems, cartTotal, itemCount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isMpReady, setIsMpReady] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Payment
  const orderIdRef = useRef<string | null>(null);

  const persistLastPayment = (payload: LastPaymentSessionData) => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem("lastPayment", JSON.stringify(payload));
    } catch (error) {
      console.warn("Falha ao guardar pagamento recente:", error);
    }
  };

  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args.some((arg) => shouldIgnoreSvgError(arg))) {
        return;
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  // Sincroniza o ref sempre que o orderId muda para ser acessado dentro de callbacks
  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  // Função utilitária para corrigir SVGs
  const fixSvgAttributes = (element: HTMLElement) => {
    const svgs = element.querySelectorAll('svg');
    svgs.forEach((svg) => {
      const width = svg.getAttribute('width');
      const height = svg.getAttribute('height');
      if (width === '' || width === 'auto' || width === null) {
        svg.removeAttribute('width');
        svg.style.width = '100%';
      }
      if (height === '' || height === 'auto' || height === null) {
        svg.removeAttribute('height');
        svg.style.height = 'auto';
      }
    });
  };

  useEffect(() => {
    if (step !== 2 || !orderId || !isMpReady) return;

    let controller: PaymentBrickController | null = null;
    let observer: MutationObserver | null = null;
    let styleElement: HTMLStyleElement | null = null;
    let intervalFix: ReturnType<typeof setInterval> | null = null;

    const renderBrick = async () => {
      styleElement = document.createElement('style');
      styleElement.id = 'mp-svg-fix';
      styleElement.textContent = `
          svg { max-width: 100% !important; max-height: 100% !important; }
          svg[width=""], svg[width="auto"], svg[height=""], svg[height="auto"] {
            width: 100% !important; height: auto !important;
          }
          #payment-brick-container svg { width: 100% !important; height: auto !important; }
        `;
      document.head.appendChild(styleElement);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const container = document.getElementById('payment-brick-container');
      if (!container) return;

      observer = new MutationObserver(() => fixSvgAttributes(container));
      observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['width', 'height'] });
      intervalFix = setInterval(() => fixSvgAttributes(container), 500);

      try {
        const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
        const MercadoPagoCtor = (window as MercadoPagoWindow).MercadoPago;
        if (!publicKey || !MercadoPagoCtor) return;

        const mp = new MercadoPagoCtor(publicKey, { locale: 'pt-BR' });
        const bricksBuilder = mp.bricks();

        const settings: MercadoPagoBrickSettings = {
          initialization: {
            amount: Number(cartTotal) / 100,
          },
          mercadoPago: mp,
          customization: {
            visual: { theme: 'flat' },
            paymentMethods: {
              ticket: "all",
              bankTransfer: "all",
              creditCard: "all",
              debitCard: "all",
            }
          },
          callbacks: {
            onReady: () => {
              console.log("MERCADO PAGO: Multi-meios pronto!");
              setTimeout(() => {
                if (container) {
                  fixSvgAttributes(container);
                  setTimeout(() => fixSvgAttributes(container), 500);
                }
              }, 100);
              setLoading(false);
            },
            onSubmit: ({ selectedPaymentMethod, formData }: BrickSubmitPayload) => {
              const currentOrderId = orderIdRef.current;
              return new Promise((resolve, reject) => {
                const payload = {
                  ...formData,
                  orderId: currentOrderId,
                  payment_method_id: selectedPaymentMethod,
                  cartItems: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
                  cartTotal,
                  customerInfo: {
                    email,
                    nome,
                    telefone,
                    cpf,
                  },
                  payer: {
                    email,
                    identification: {
                      type: "CPF",
                      number: cpf.replace(/\D/g, ""),
                    }
                  }
                };

                const request = fetch("/api/process_payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });

                console.log("[Checkout] orderId enviado para process_payment:", currentOrderId, {
                  selectedPaymentMethod,
                  payload,
                });

                request
                  .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.details || data.error || "Erro ao processar");

                    const sessionPayload: LastPaymentSessionData = {
                      id: data.id,
                      status: data.status,
                      payment_method_id: data.payment_method_id,
                      point_of_interaction: data.point_of_interaction,
                    };
                    persistLastPayment(sessionPayload);

                    if (data.status === 'approved') {
                      clearCart();
                    }

                    const shouldRedirectToSuccess = data.status === 'approved' || data.payment_method_id === 'pix';
                    if (typeof window !== "undefined" && shouldRedirectToSuccess) {
                      window.location.href = `/sucesso?payment_id=${data.id}&status=${data.status}`;
                    }

                    console.log("[Checkout] resposta process_payment:", data);
                    resolve(data);
                  })
                  .catch((error) => {
                    const message = error instanceof Error ? error.message : "Erro ao processar";
                    alert(`Erro: ${message}`);
                    reject(error);
                  });
              });
            },
            onError: (error: Error) => {
              console.error("MERCADO PAGO ERRO:", error);
              setLoading(false);
            },
          },
        };

        controller = await bricksBuilder.create('payment', 'payment-brick-container', settings);
      } catch (err) {
        console.error("Falha ao criar Brick:", err);
      }
    };

    renderBrick();

    return () => {
      if (observer) observer.disconnect();
      if (controller && typeof controller.unmount === 'function') {
        try { controller.unmount(); } catch { }
      }
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
      if (intervalFix) clearInterval(intervalFix);
    };
  }, [step, orderId, isMpReady, cartTotal, email, cpf, clearCart, cartItems, nome, telefone]);

  if (itemCount === 0 && !orderId) {
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
    if (!email.includes("@") || email.length < 5) return alert("Por favor, insira um e-mail válido");
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          emailCliente: email,
          nomeCliente: nome,
          cpfCliente: cpf,
          cartTotal
        }),
      });

      const data = await response.json();
      if (data.orderId) {
        setOrderId(data.orderId);
        setStep(2);
      } else {
        throw new Error(data.error || "Erro ao criar order");
      }
    } catch (error: unknown) {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao processar o checkout.";
      alert(`Erro: ${errorMessage}`);
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
          {/* Summary Column */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6 order-2 lg:order-1">
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-blue-50 relative overflow-hidden">
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
                    <motion.div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50">
                      <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                        <Image src={produto?.imagens?.[0] || "/img/placeholder.png"} width={64} height={64} alt={item.nome} className="w-full h-full object-cover" />
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
                <div className="flex justify-between text-gray-500 font-medium font-bold">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center gap-2 shadow-sm">
                <div className="bg-pink-50 p-2 rounded-full text-pink-400"><Lock size={20} /></div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 leading-tight">Pagamento 100% Seguro</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center gap-2 shadow-sm">
                <div className="bg-blue-50 p-2 rounded-full text-blue-400"><ShieldCheck size={20} /></div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 leading-tight">Acesso Imediato ao Material</span>
              </div>
            </div>

            <Link href="/carrinho" className="flex items-center justify-center gap-2 text-gray-400 font-bold hover:text-blue-400 transition-colors text-sm mt-6">
              <ChevronLeft size={16} /> Editar carrinho
            </Link>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-12 xl:col-span-7 order-1 lg:order-2">
            <div className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(149,157,165,0.06)] border border-pink-50 min-h-[600px] relative">
              {step === 1 ? (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <div className="inline-block bg-pink-50 p-3 rounded-2xl mb-2"><Sparkles className="text-pink-400" size={32} /></div>
                    <h2 className="text-2xl font-black text-gray-800">Vamos começar! ✨</h2>
                    <p className="text-gray-400 font-medium">Onde você deseja receber seu material mágico?</p>
                  </div>
                  <div className="space-y-6">
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
                    <button onClick={handleCheckout} disabled={loading} className="w-full bg-blue-400 hover:bg-blue-500 disabled:bg-gray-100 disabled:text-gray-300 text-white font-black py-7 rounded-[2.5rem] text-xl transition-all flex items-center justify-center gap-3">
                      {loading ? <Loader2 className="animate-spin" /> : <>CONTINUAR PARA PAGAMENTO <ArrowRight size={22} /></>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <button onClick={() => setStep(1)} className="flex items-center gap-1 text-gray-400 hover:text-blue-500 font-bold transition-colors text-sm"><ChevronLeft size={16} /> Mudar e-mail</button>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full text-green-600 text-[10px] font-black uppercase"><CheckCircle2 size={12} /> E-mail Identificado</div>
                  </div>
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-black text-gray-800">Finalizar Compra Segura</h2>
                    <p className="text-gray-400 text-sm font-medium">Escolha a melhor forma de pagamento para você</p>
                  </div>
                  <div key={orderId || 'no-id'} id="payment-brick-container" className="w-full" style={{ minHeight: "400px" }}>
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
          </div>
        </div>
      </div>

      <style jsx global>{`
        #payment-brick-container svg { max-width: 100% !important; max-height: 100% !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
      `}</style>
    </div>
  );
}
