'use client';

import React, { Suspense } from 'react';
import Header from '@/app/components/Module/Header';
import Loader from '@/app/components/Loaders/Loader';
import { UserProvider } from '@/app/components/Auth/UserProvider';
import { CartProvider } from '@/app/components/Cart/CartProvider';
import CheckoutMain from '@/app/components/Checkout/CheckoutMain';

const CheckoutDetail = () => {
  return (
    
      <UserProvider>
        <Header />
        <CartProvider>
          <CheckoutMain />
        </CartProvider>
      </UserProvider>

  );
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Loader />}>
      <CheckoutDetail />
    </Suspense>
  );
}
