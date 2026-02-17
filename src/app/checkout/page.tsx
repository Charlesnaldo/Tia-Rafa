import { Suspense } from 'react';
import CheckoutWrapper from './CheckoutWrapper';

export const dynamic = 'force-dynamic'; 

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[radial-gradient(circle_at_top,#fce7f3_0%,#f8faff_50%,#ecfeff_100%)]" />}>
      <CheckoutWrapper />
    </Suspense>
  );
}
