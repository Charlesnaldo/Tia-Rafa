"use client";

import { useState } from "react";
import {
  Loader2,
  Sparkles,
  ShieldCheck,
  Lock,
  Zap,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { PRODUTOS_LISTA } from "@/constants/produtos";
import { LastPaymentSessionData, PaymentPointOfInteraction } from "@/types/payment";

export default function CheckoutClient() {
  const { cartItems, cartTotal, itemCount, clearCart } = useCart();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");
  const [pixPointOfInteraction, setPixPointOfInteraction] = useState<PaymentPointOfInteraction | null>(null);
  const [pixPaymentStatus, setPixPaymentStatus] = useState<string | null>(null);
  const [pixCodeCopied, setPixCodeCopied] = useState(false);

  const persistLastPayment = (payload: LastPaymentSessionData) => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem("lastPayment", JSON.stringify(payload));
    } catch (error) {
      console.warn("Falha ao guardar pagamento recente:", error);
    }
  };

  const handleCopyPixCode = async () => {
    const pixCode = pixPointOfInteraction?.transaction_data?.qr_code;
    if (!pixCode || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setPixCodeCopied(true);
      setTimeout(() => setPixCodeCopied(false), 1800);
    } catch (error) {
      console.error("Falha ao copiar o código Pix:", error);
    }
  };

  const handleCheckout = async () => {
    if (!email.includes("@") || email.length < 5) return alert("Por favor, insira um e-mail válido.");
    if (cpf.replace(/\D/g, "").length < 11) return alert("CPF inválido.");
    if (!nome.trim()) return alert("Informe o nome completo.");
    if (itemCount === 0) {
      return alert("Seu carrinho está vazio.");
    }

    setLoading(true);
    setPixPointOfInteraction(null);
    setPixPaymentStatus(null);
    setPixCodeCopied(false);

    try {
      const processResponse = await fetch("/api/process_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          emailCliente: email,
          nomeCliente: nome,
          cpfCliente: cpf,
          paymentMethod,
        }),
      });
      const paymentData = await processResponse.json();
      if (!processResponse.ok) {
        throw new Error(paymentData.error || "Erro ao processar pagamento.");
      }

      if (paymentMethod === "credit_card") {
        if (!paymentData.checkout_url) {
          throw new Error("Nao foi possivel iniciar o checkout do cartao.");
        }
        if (typeof window !== "undefined") {
          window.location.href = paymentData.checkout_url;
          return;
        }
      }

      const sessionPayload: LastPaymentSessionData = {
        id: paymentData.id,
        status: paymentData.status,
        payment_method_id: paymentData.payment_method_id,
        point_of_interaction: paymentData.point_of_interaction,
      };
      persistLastPayment(sessionPayload);

      if (paymentData.status === "approved") {
        clearCart();
        if (typeof window !== "undefined") {
          window.location.href = `/sucesso?payment_id=${paymentData.id}&status=${paymentData.status}`;
          return;
        }
      }

      if (paymentData.payment_method_id === "pix") {
        setPixPointOfInteraction(paymentData.point_of_interaction ?? null);
        setPixPaymentStatus(paymentData.status ?? "action_required");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      alert(`Erro: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-48 h-48 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-bounce duration-3000">
          <ShoppingBag size={80} className="text-blue-300" />
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-2">Ops! Seu carrinho está vazio</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Selecione alguns produtos e volte aqui para gerar o Pix.</p>
        <Link href="/" className="bg-pink-400 hover:bg-pink-500 text-white font-black px-10 py-4 rounded-full shadow-lg shadow-pink-100 transition-all hover:scale-105 active:scale-95">
          VER MATERIAIS
        </Link>
      </div>
    );
  }

  const pixTransactionData = pixPointOfInteraction?.transaction_data;
  const pixQrImageSrc = pixTransactionData?.qr_code_base64 ? `data:image/jpeg;base64,${pixTransactionData.qr_code_base64}` : undefined;
  const pixCode = pixTransactionData?.qr_code;
  const pixTicketUrl = pixTransactionData?.ticket_url;
  const pixStatusLabel = pixPaymentStatus ? pixPaymentStatus.replace(/_/g, " ").toUpperCase() : "AGUARDANDO";

  return (
    <div className="min-h-screen bg-[#F8FAFF] font-fredoka py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
              <ArrowRight size={16} className="rotate-180" /> Editar carrinho
            </Link>
          </div>

          <div className="lg:col-span-12 xl:col-span-7 order-1 lg:order-2">
            <div className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(149,157,165,0.06)] border border-pink-50">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-block bg-pink-50 p-3 rounded-2xl mb-2"><Sparkles className="text-pink-400" size={32} /></div>
                  <h2 className="text-3xl font-black text-gray-800">Escolha como pagar</h2>
                  <p className="text-gray-500 font-medium">Pix instantaneo ou cartao de credito pelo Mercado Pago.</p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pix")}
                      className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.2em] transition ${
                        paymentMethod === "pix"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      Pix
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("credit_card")}
                      className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.2em] transition ${
                        paymentMethod === "credit_card"
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      Cartao
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 block">Nome completo</label>
                    <input
                      type="text"
                      placeholder="Seu nome aqui"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-6 py-4 bg-[#F8FAFF] border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] outline-none font-bold text-gray-700 transition-all text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 block">Email</label>
                    <input
                      type="email"
                      placeholder="voce@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-6 py-4 bg-[#F8FAFF] border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] outline-none font-bold text-gray-700 transition-all text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 block">CPF</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full px-6 py-4 bg-[#F8FAFF] border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] outline-none font-bold text-gray-700 transition-all text-lg"
                    />
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-blue-400 hover:bg-blue-500 disabled:bg-gray-100 disabled:text-gray-300 text-white font-black py-5 rounded-[2.5rem] text-xl transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        {paymentMethod === "pix" ? "Gerar Pix" : "Pagar com cartao"}
                        <ArrowRight size={22} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {pixPointOfInteraction && (
                <div className="bg-white mt-8 rounded-[3rem] border border-dashed border-green-100 shadow-[0_20px_60px_rgba(72,211,153,0.2)] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-semibold">Pagamento Pix</p>
                      <h4 className="text-2xl font-black text-gray-900">Escaneie ou copie</h4>
                    </div>
                    <span className="text-xs uppercase tracking-[0.4em] font-black text-emerald-600">
                      {pixStatusLabel}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    {pixQrImageSrc ? (
                      <div className="rounded-[2rem] border border-dashed border-gray-200 bg-gray-50 p-6">
                        <img
                          src={pixQrImageSrc}
                          alt="QR Code Pix"
                          className="w-64 h-64 object-contain rounded-[1.5rem]"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 text-xs uppercase tracking-[0.2em] text-gray-400 text-center px-4">
                        QR Code em geração
                      </div>
                    )}

                    {pixCode && (
                      <div className="w-full max-w-2xl flex flex-col gap-3">
                        <p className="text-xs text-gray-500 text-center">Código Pix</p>
                        <div className="rounded-[1.5rem] border border-gray-200 bg-gray-100 p-4 text-[11px] sm:text-xs text-gray-700 font-mono break-words">
                          {pixCode}
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyPixCode}
                          className="mx-auto mt-2 bg-emerald-600 hover:bg-emerald-500 text-white uppercase text-[10px] tracking-[0.4em] font-black px-6 py-3 rounded-full transition"
                        >
                          {pixCodeCopied ? "Copiado!" : "Copiar código Pix"}
                        </button>
                      </div>
                    )}

                    {pixTicketUrl && (
                      <a
                        href={pixTicketUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 hover:text-blue-400"
                      >
                        Abrir comprovante Pix
                      </a>
                    )}

                    <p className="text-[11px] text-gray-500 text-center px-4">
                      O QR expira em cerca de 30 minutos. Assim que o pagamento for confirmado, liberamos o material automaticamente.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


