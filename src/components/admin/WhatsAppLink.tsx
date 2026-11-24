import { MessageCircle } from "lucide-react";

// Brazilian numbers are stored without country code; wa.me needs it.
export default function WhatsAppLink({ phone, name }: { phone: string | null | undefined; name?: string | null }) {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const number = digits.length <= 11 ? `55${digits}` : digits;
  const firstName = name ? name.split(" ")[0] : "";
  const text = encodeURIComponent(`Oi${firstName ? `, ${firstName}` : ""}! Aqui é a Tia Rafa 💜`);
  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-xs font-semibold text-green-800 hover:bg-green-100"
      aria-label={`Abrir WhatsApp de ${name || "contato"}`}
    >
      <MessageCircle size={14} /> WhatsApp
    </a>
  );
}
