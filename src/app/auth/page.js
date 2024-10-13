'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Module/Header';
import LoginForm from '@/app/components/Auth/LoginForm';
import { UserProvider } from '@/app/components/Auth/UserProvider';



const AuthPage = () => {


  return (
    <>
      <UserProvider>
          <Header />
      
      
          <LoginForm />
      </UserProvider>
    </>
  );
};

export default AuthPage;
