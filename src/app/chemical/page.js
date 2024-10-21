"use client"; 

import React, { Suspense, useEffect, useState } from 'react';
import Header from '@/app/components/Module/Header';
import Loader from '@/app/components/Loaders/Loader';
import { UserProvider } from '@/app/components/Auth/UserProvider';
import ChemicalProduct from '@/app/components/Chemicals/ChemicalProduct';


const ChemicalDetail = () => {


  return (
    <>
      <UserProvider>
        <Header />
        <ChemicalProduct />
      </UserProvider>

    </>
  );
};

export default function ChemicalPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ChemicalDetail />
    </Suspense>
  );
}
