'use client'; 

import React from 'react';
import { useUser } from '../Auth/UserProvider'; 
import BuyerContent from '@/app/components/Personal/Role/BuyerContent'; // Импортируйте контент для Buyer
import StudentContent from '@/app/components/Personal/Role/StudentContent'; // Импортируйте контент для Student
import SellerContent from '@/app/components/Personal/Role/SellerContent'; // Импортируйте контент для Seller
import Loader from '../Loader';

const Dashboard = () => {



  const { user, token } = useUser();
  if (!user) {
    return <Loader />; // Выводим что-то, пока пользователь загружается
  }
  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white h-screen">
        <div className="p-4">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <ul className="mt-4">
            <li className="py-2 hover:bg-gray-700 cursor-pointer">Общая информация</li>
            {user.role === 'buyer' && (
              <li className="py-2 hover:bg-gray-700 cursor-pointer">Контент для покупателя</li>
            )}
            {user.role === 'student' && (
              <li className="py-2 hover:bg-gray-700 cursor-pointer">Контент для студента</li>
            )}
            {user.role === 'seller' && (
              <li className="py-2 hover:bg-gray-700 cursor-pointer">Контент для продавца</li>
            )}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Добро пожаловать в ваш аккаунт!</h1>
        <div>
          {/* Здесь будет отображаться контент в зависимости от роли */}
          {user.role === 'buyer' && <BuyerContent />}
          {user.role === 'student' && <StudentContent  />}
          {user.role === 'seller' && <SellerContent userId={user.id} userToken={token} />}
          {/* Общая информация */}
          <div className="mt-4 p-4 border rounded bg-gray-100">
            <h2 className="text-lg font-bold">Общая информация об аккаунте</h2>
            <p>Email: {user.email}</p>
            <p>Роль: {user.role}</p>
            {/* Другие данные о пользователе */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
