"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const DynamicCheckoutClient = dynamic(() => import('./CheckoutClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFF] font-fredoka gap-4">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-400 rounded-full animate-spin" />
      <p className="text-blue-400 font-bold animate-pulse">Preparando checkout seguro...</p>
    </div>
  ),
});

export default function CheckoutWrapper() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFF] font-fredoka gap-4">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-400 rounded-full animate-spin" />
        <p className="text-blue-400 font-bold animate-pulse">Carregando magia...</p>
      </div>
    );
  }

  return (
    <DynamicCheckoutClient />
  );
}
