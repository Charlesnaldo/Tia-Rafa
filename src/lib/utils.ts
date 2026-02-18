import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(valueInCents: number): string {
  return (valueInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatPaymentStatus(status: string | null | undefined): string {
  const normalized = String(status || "").toLowerCase();
  const labels: Record<string, string> = {
    approved: "Aprovado",
    pending: "Pendente",
    in_process: "Em processamento",
    rejected: "Recusado",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
    charged_back: "Estornado",
    action_required: "Acao necessaria",
    pending_waiting_transfer: "Aguardando transferencia",
  };

  return labels[normalized] || "Pendente";
}
