'use client'; 

import React, { Suspense } from 'react';
import Header from '@/app/components/Module/Header';
import Loader from '@/app/components/Loaders/Loader';
import { UserProvider } from '@/app/components/Auth/UserProvider';
import { CartProvider } from '@/app/components/Cart/CartProvider';
import ChatOrder from '@/app/components/Chat/ChatOrder';

const ChatDetail = () => {
  return (
    <UserProvider>
      <Header />
      <CartProvider>
        <ChatOrder /> 
      </CartProvider>
    </UserProvider>
  );
};

// Здесь вы можете получить orderId через параметры маршрута
export default function ChatPage({ params }) {
  
  return (
    <Suspense fallback={<Loader />}>
      <ChatDetail  />
    </Suspense>
  );
}
