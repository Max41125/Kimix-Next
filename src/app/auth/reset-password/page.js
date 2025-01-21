'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Module/Header';
import ResetPasswordForm from '@/app/components/Auth/ResetPasswordForm';
import { UserProvider } from '@/app/components/Auth/UserProvider';



const AuthPage = () => {


  return (
    <>
      <UserProvider>
          <Header />
          <ResetPasswordForm />
      </UserProvider>
    </>
  );
};

export default AuthPage;
