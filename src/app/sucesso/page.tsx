 "use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { CheckCircle, Mail, Download, ArrowRight, Sparkles } from "lucide-react";
import { LastPaymentSessionData } from "@/types/payment";

// 1. Criamos o conteúdo da página em um componente separado
function SucessoContent() {
  const [lastPayment] = useState<LastPaymentSessionData | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.sessionStorage.getItem("lastPayment");
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored) as LastPaymentSessionData;
      window.sessionStorage.removeItem("lastPayment");
      return parsed;
    } catch (error) {
      console.error("Falha ao ler os dados do pagamento recente:", error);
      window.sessionStorage.removeItem("lastPayment");
      return null;
    }
  });
  const [copied, setCopied] = useState(false);

  const pixTransaction = lastPayment?.point_of_interaction?.transaction_data;
  const pixCode = pixTransaction?.qr_code;
  const qrImageSrc = pixTransaction?.qr_code_base64 ? `data:image/png;base64,${pixTransaction.qr_code_base64}` : undefined;
  const ticketUrl = pixTransaction?.ticket_url;
  const isPix = lastPayment?.payment_method_id === "pix";
  const statusLabel = lastPayment?.status ? lastPayment.status.replace(/_/g, " ").toUpperCase() : "AGUARDANDO";
  const heroTitle = isPix && lastPayment?.status !== "approved" ? "Pagamento PIX aguardando confirmação" : "Pagamento Confirmado!";
  const heroMessage = isPix
    ? "Use o QR code abaixo para pagar via Pix. Assim que o banco confirmar, o material fica disponível."
    : "Oba! Seu material premium já está sendo preparado e será enviado para o seu e-mail em instantes.";

  const handleCopyPixCode = async () => {
    if (!pixCode || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Não foi possível copiar o código Pix:", error);
    }
  };

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

        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{heroTitle}</h1>

        <p className="text-gray-500 text-lg mb-4 font-medium">{heroMessage}</p>
        {isPix && (
          <span className="text-xs uppercase tracking-[0.4em] font-black text-green-600 mb-8 block">
            Status: {statusLabel}
          </span>
        )}

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

        {isPix && (
          <div className="bg-white rounded-[3rem] border border-dashed border-green-100 shadow-[0_20px_60px_rgba(72,211,153,0.25)] p-6 mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs uppercase text-gray-500 font-semibold">Pagamento Pix</p>
                  <h4 className="text-2xl font-black text-gray-900">Leia e pague com QR Code</h4>
                </div>
                <span className="text-xs uppercase tracking-[0.4em] font-black text-emerald-600">
                  {statusLabel}
                </span>
              </div>

              <div className="flex flex-col items-center gap-4">
                {qrImageSrc ? (
                  <div className="rounded-[2rem] border border-dashed border-gray-200 bg-gray-50 p-6">
                    <img
                      src={qrImageSrc}
                      alt="QR Code Pix"
                      className="w-64 h-64 object-contain rounded-[1.5rem]"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 text-gray-400 text-xs text-center px-4">
                    QR Code não encontrado. Atualize a página ou aguarde alguns segundos.
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
                      {copied ? "Copiado!" : "Copiar código Pix"}
                    </button>
                  </div>
                )}

                {ticketUrl && (
                  <a
                    href={ticketUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 hover:text-blue-400"
                  >
                    Abrir comprovante Pix
                  </a>
                )}

                <p className="text-[11px] text-gray-500 text-center px-4">
                  O QR code expira em cerca de 30 minutos. Após a confirmação, liberamos o material automaticamente.
                </p>
              </div>
            </div>
          </div>
        )}

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
