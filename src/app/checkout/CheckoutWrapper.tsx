"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const DynamicCheckoutClient = dynamic(() => import('./CheckoutClient'), {
  ssr: false,
  loading: () => <div>Loading checkout...</div>,
});

export default function CheckoutWrapper() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div>Loading checkout...</div>; // Or a more elaborate loading spinner
  }

  return (
    <DynamicCheckoutClient />
  );
}
