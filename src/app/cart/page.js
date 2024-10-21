'use client';

import React from 'react';
import { CartProvider } from '@/app/components/Cart/CartProvider';
import { UserProvider } from '@/app/components/Auth/UserProvider';

import Header from '@/app/components/Module/Header';
import CartList from '@/app/components/Cart/CartList';
const CartPage = () => {


  return (
    <>
    
      <UserProvider>
        <Header />

        <CartProvider>
            <CartList />
        </CartProvider>
        
      </UserProvider>

    </>
  )
};

export default CartPage;
