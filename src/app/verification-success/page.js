"use client"; // We're working with client-side routing

import React, { Suspense } from 'react';
import Header from '@/app/components/Module/Header';
import Loader from '@/app/components/Loader';
import { UserProvider } from '@/app/components/Auth/UserProvider';
import Link from "next/link";
const VerificationSuccess = () => {
  return (
    <>
      <UserProvider>
        <Header />
      </UserProvider>
      <Suspense fallback={<Loader />}>
        <div className="bg-gradient-to-r from-emerald-400 from-30% via-violet-400 via-100% to-blue-500">
          <div className="mx-auto container px-4 py-12 min-h-screen flex flex-col items-center justify-center ">
        
            <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-lg w-full">
              <h1 className="text-3xl font-bold text-green-600 mb-4">Верификация прошла успешно!</h1>
              <p className="text-gray-700 mb-6">
                Спасибо за подтверждение! Ваш аккаунт был успешно верифицирован.
              </p>
              <Link href="/auth" className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors duration-300">
            
                Перейти к авторизации
      
              </Link>
            </div>
          </div>
        </div>
      </Suspense>
    </>
  );
};

export default VerificationSuccess;
