import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DynamicCheckoutClient = dynamic(() => import('./CheckoutClient'), {
  ssr: false,
  loading: () => <div>Loading checkout...</div>,
});

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <DynamicCheckoutClient />
    </Suspense>
  );
}
