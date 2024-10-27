'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import RussianContract from '@/app/components/Chat/Contract/RussianContract';
import EnglishContract from '@/app/components/Chat/Contract/EnglishContract';

const ContractPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const lang = searchParams.get('lang');
  const currentDate = new Date().toLocaleDateString();

  if (!orderId ||!lang) {
    return <div>Error: Invalid parameters</div>;
  }

  return (
    <div className="container mx-auto p-6">
         
    {lang === 'ru' ? (
      <h1 className="text-2xl font-bold mb-4">Интерактивный контракт</h1> ) : (
      <h1 className="text-2xl font-bold mb-4">Interactive contract</h1> 
   
      )}
      {lang === 'ru' ? (
        <RussianContract orderId={orderId} currentDate={currentDate} />
      ) : (
        <EnglishContract orderId={orderId} currentDate={currentDate}  />
      )}
    </div>
  );
};

export default ContractPage;
