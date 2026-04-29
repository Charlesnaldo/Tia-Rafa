"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronUp, Send, Sparkles, X, MessageCircle } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
};

const storageKey = "tia-rafa-site-chat-session";

function getSessionId() {
  if (typeof window === "undefined") return crypto.randomUUID();
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(storageKey, next);
  return next;
}

export default function SiteChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Oi! Posso te ajudar com materiais, pedidos ou dúvidas?",
      createdAt: new Date().toISOString(),
    },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const sessionId = useMemo(() => getSessionId(), []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/chat/evolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          sessionId,
          page: window.location.pathname,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel enviar a mensagem.");
      }

      const replyText = Array.isArray(data?.messages) && data.messages[0]?.text
        ? String(data.messages[0].text)
        : "Mensagem enviada.";

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: replyText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado.";
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `Erro ao conectar: ${message}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-24 left-4 z-[95] sm:bottom-8 sm:left-6">
      {open ? (
        <div className="w-[min(92vw,360px)] overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <Bot size={22} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em]">Atendimento</p>
                <p className="text-[11px] font-medium text-white/85">Tia Rafa ao vivo</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-white/15 p-2 transition hover:bg-white/25"
              aria-label="Fechar chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.12),_transparent_40%),linear-gradient(180deg,#fff_0%,#f8fafc_100%)] p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-[1.4rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-700 border border-gray-100"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="border-t border-gray-100 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Digite sua mensagem..."
                rows={2}
                className="max-h-28 flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={sending || !input.trim()}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 text-white shadow-lg shadow-purple-200 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Enviar mensagem"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
              <span className="inline-flex items-center gap-1">
                <Sparkles size={12} /> WhatsApp integrado
              </span>
              <span>{sending ? "Enviando..." : "Online"}</span>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 px-4 py-3 text-white shadow-[0_18px_40px_rgba(236,72,153,0.28)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(236,72,153,0.35)] active:scale-95"
          aria-label="Abrir chat"
        >
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <span className="absolute inset-0 rounded-full bg-white/25 animate-ping" />
            <MessageCircle size={22} className="relative z-10" />
          </span>
          <span className="hidden text-sm font-black uppercase tracking-[0.14em] sm:inline">
            Falar agora
          </span>
          <ChevronUp size={16} className="hidden rotate-90 sm:block" />
        </button>
      )}
    </div>
  );
}
