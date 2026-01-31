import { Suspense } from 'react';
import CheckoutWrapper from './CheckoutWrapper';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutWrapper />
    </Suspense>
  );
}
