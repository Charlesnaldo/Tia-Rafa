"use client";

import { MessageCircle } from "lucide-react";

const whatsappUrl = "https://wa.me/5585991477806?text=Ol%C3%A1%2C%20quero%20tirar%20uma%20d%C3%BAvida.";

export default function WhatsAppFloatingButton() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-[60] group flex items-center gap-3 rounded-full bg-green-500 px-4 py-3 text-white shadow-[0_18px_40px_rgba(34,197,94,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(34,197,94,0.45)] active:scale-95"
    >
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
        <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
        <span className="absolute inset-1 rounded-full bg-white/15 animate-pulse" />
        <MessageCircle size={24} className="relative z-10" />
      </span>
      <span className="pr-1 text-sm font-black uppercase tracking-[0.14em]">
        WhatsApp
      </span>
    </a>
  );
}
