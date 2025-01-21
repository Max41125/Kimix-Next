'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Module/Header';
import ResetPassword from '@/app/components/Auth/ResetPassword';
import { UserProvider } from '@/app/components/Auth/UserProvider';



const AuthPage = () => {


  return (
    <>
      <UserProvider>
          <Header />
          <ResetPassword />
      </UserProvider>
    </>
  );
};

export default AuthPage;
