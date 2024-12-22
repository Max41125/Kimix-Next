import React from 'react';
import { useUser } from '../Auth/UserProvider';
import Link from 'next/link';
import Loader from '../Loaders/Circle';

const BlurredContent = ({ children, role }) => {
  const { user } = useUser() || {};
  
  // Добавим проверку на состояние загрузки


  const isAuthorized = user && user.role === role;


  return (
    <div className="relative">
      {isAuthorized ? (
        children // Если роль пользователя совпадает, показываем содержимое
      ) : (
        <>
          {/* Заблюренный контент для всех, кроме авторизованных пользователей */}
          <div className="blur-sm pointer-events-none">
            {children}
          </div>

          {/* Информация по каждой роли */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 p-4 text-center">
            {role === 'buyer' && (
              <p className="mb-4 text-gray-600">Для доступа к этой информации нужно быть покупателем.</p>
            )}
            {role === 'student' && (
              <p className="mb-4 text-gray-600">Для доступа к этой информации нужно быть студентом.</p>
            )}
            {role === 'seller' && (
              <p className="mb-4 text-gray-600">Для доступа к этой информации нужно быть продавцом.</p>
            )}

            {/* Кнопка для регистрации */}
            <Link 
              href="/auth" 
              className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-600"
            >
              Зарегистрироваться
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default BlurredContent;
