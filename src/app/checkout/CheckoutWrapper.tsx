"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const DynamicCheckoutClient = dynamic(() => import('./CheckoutClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#fce7f3_0%,#f8faff_50%,#ecfeff_100%)] font-fredoka gap-4">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-blue-500 font-black uppercase tracking-[0.2em] animate-pulse">Preparando checkout seguro</p>
    </div>
  ),
});

export default function CheckoutWrapper() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#fce7f3_0%,#f8faff_50%,#ecfeff_100%)] font-fredoka gap-4">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-blue-500 font-black uppercase tracking-[0.2em] animate-pulse">Carregando checkout</p>
      </div>
    );
  }

  return (
    <DynamicCheckoutClient />
  );
}
