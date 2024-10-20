import React from 'react';
import { useUser } from '../Auth/UserProvider';
import Link from 'next/link';

const BlurredContent = ({ children }) => {
    
  const { user } = useUser();




  return (
    <div className="relative">
      {user ? (
        children // Если пользователь авторизован, показываем содержимое
      ) : (
        <>
          {/* Контент будет заблюрен, если пользователь не авторизован */}
          <div className="blur-sm pointer-events-none">
            {children}
          </div>
          {/* Кнопка для регистрации */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">

            <Link 
            href="/auth"
            className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-600"
            >Зарегистрироваться </Link>
    
          </div>
        </>
      )}
    </div>
  );
};

export default BlurredContent;
