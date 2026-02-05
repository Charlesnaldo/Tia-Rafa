"use client";

import Link from 'next/link';
import { Download, Package, Loader2 } from "lucide-react";
import { Produto } from "@/constants/produtos";

export default function BotaoCompra({ produto }: { produto: Produto }) {
  const buttonText = produto.tipo === 'digital' ? 'Baixar Agora' : 'Receber em Casa';
  const buttonIcon = produto.tipo === 'digital' ? <Download size={22} /> : <Package size={22} />;

  return (
    <Link
      href={`/checkout?id=${produto.id}`}
      className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-purple-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
    >
      {buttonIcon}
      {buttonText}
    </Link>
  );
}

