"use client";

import dynamic from 'next/dynamic';

const DynamicCheckoutClient = dynamic(() => import('./CheckoutClient'), {
  ssr: false,
  loading: () => <div>Loading checkout...</div>,
});

export default function CheckoutWrapper() {
  return (
    <DynamicCheckoutClient />
  );
}
