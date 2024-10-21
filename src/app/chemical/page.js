'use client';

import React, { Suspense } from 'react';
import Header from '@/app/components/Module/Header';
import Loader from '@/app/components/Loaders/Loader';
import { UserProvider } from '@/app/components/Auth/UserProvider';
import { CartProvider } from '@/app/components/Cart/CartProvider';
import ChemicalProduct from '@/app/components/Chemicals/ChemicalProduct';

const ChemicalDetail = () => {
  return (
    
      <UserProvider>
        <Header />
        <CartProvider>
          <ChemicalProduct />
        </CartProvider>
      </UserProvider>

  );
};

export default function ChemicalPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ChemicalDetail />
    </Suspense>
  );
}
