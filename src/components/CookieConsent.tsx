"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";
import { OPEN_CONSENT_EVENT, useConsent, writeConsent } from "@/lib/consent";

const subscribeNoop = () => () => {};

// Bottom banner asking for analytics/advertising cookies. Essential cookies (cart, payment status)
// do not depend on it. Reopened from the footer link "Preferências de cookies".
export default function CookieConsent() {
  const pathname = usePathname();
  const consent = useConsent();
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  if (!hydrated || pathname.startsWith("/admin") || (consent !== null && !reopened)) return null;

  const choose = (value: "granted" | "denied") => {
    setReopened(false);
    writeConsent(value);
  };

  return (
    <div role="dialog" aria-live="polite" aria-label="Preferências de cookies"
      className="fixed inset-x-3 bottom-24 z-[90] mx-auto max-w-3xl rounded-2xl border border-purple-100 bg-white p-4 shadow-2xl sm:bottom-4 md:flex md:items-center md:gap-4">
      <p className="flex items-start gap-2 text-sm text-gray-700">
        <Cookie size={18} className="mt-0.5 shrink-0 text-purple-600" aria-hidden="true" />
        <span>
          Usamos cookies para medir visitas e o resultado dos nossos anúncios (Google Analytics, Meta e Pinterest).
          O carrinho e o pagamento funcionam de qualquer forma.{" "}
          <Link href="/privacidade" className="font-semibold text-purple-700 underline">Saiba mais</Link>
        </span>
      </p>
      <div className="mt-3 flex shrink-0 gap-2 md:mt-0">
        <button type="button" onClick={() => choose("denied")}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">
          Recusar
        </button>
        <button type="button" onClick={() => choose("granted")}
          className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700">
          Aceitar
        </button>
      </div>
    </div>
  );
}

export function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
      Preferências de cookies
    </button>
  );
}
