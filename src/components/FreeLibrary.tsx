"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Gift, Loader2 } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import type { FreeMaterial } from "@/constants/free-materials";
import { analytics } from "@/lib/analytics";

const STORAGE_KEY = "tiarafa_lead_ok";
const subscribe = () => () => {};
const readUnlocked = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const inputClass = "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-blue-400";

// Free downloads in exchange for a name and e-mail. Server errors never block the download.
export default function FreeLibrary({ materials }: { materials: FreeMaterial[] }) {
  const storedUnlock = useSyncExternalStore(subscribe, readUnlocked, () => false);
  const [unlockedNow, setUnlockedNow] = useState(false);
  const unlocked = storedUnlock || unlockedNow;
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlock = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Private mode: unlock for this visit only.
    }
    setUnlockedNow(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, marketingConsent: consent, source: "atividades" }),
      });
      if (response.status === 400) {
        const data = await response.json();
        setError(data.error || "Confira os dados informados.");
        return;
      }
      if (response.ok) analytics.generateLead("atividades");
      unlock();
    } catch {
      unlock();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!unlocked && (
        <form onSubmit={submit} className="mb-10 rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] md:p-8">
          <h2 className="flex items-center gap-2 text-xl font-black text-gray-900">
            <Gift size={20} className="text-pink-500" /> Libere os downloads gratuitos
          </h2>
          <p className="mt-1 text-sm text-gray-600">Informe seu nome e e-mail: os materiais aparecem aqui na hora e também chegam no seu e-mail.</p>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Nome</span>
              <input required value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" className={inputClass} />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">E-mail</span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={inputClass} />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">WhatsApp (opcional)</span>
              <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} autoComplete="tel" placeholder="(85) 99999-9999" className={inputClass} />
            </label>
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            Quero receber novidades e materiais da Tia Rafa por e-mail e WhatsApp. Posso cancelar quando quiser.
          </label>
          {error ? <p role="alert" className="mt-3 text-sm font-bold text-red-500">{error}</p> : null}
          <button type="submit" disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-blue-700 disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Quero os materiais
          </button>
        </form>
      )}

      <section className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${unlocked ? "" : "pointer-events-none select-none opacity-50 blur-[2px]"}`} aria-hidden={!unlocked}>
        {materials.map((material) => (
          <ActivityCard
            key={material.id}
            title={material.title}
            description={material.description}
            downloadLink={unlocked ? material.downloadLink : "#"}
            image={material.image}
            category={material.category}
          />
        ))}
      </section>
    </>
  );
}
