'use client'; 

import React, { useState } from 'react';
import { useUser } from '../Auth/UserProvider'; 
import OrdersBuyer from '@/app/components/Personal/Role/OrdersBuyer'; 
import StudentContent from '@/app/components/Personal/Role/StudentContent'; 
import AddProductSeller from '@/app/components/Personal/Role/AddProductSeller'; 
import GeneralContent from '@/app/components/Personal/Role/GeneralContent';
import OrdersSeller from '@/app/components/Personal/Role/OrdersSeller';
import Loader from '../Loaders/Loader';

const Dashboard = () => {
  const { user, token } = useUser();
  const [activeSection, setActiveSection] = useState('general'); // Состояние для текущей секции

  if (!user) {
    return <Loader />; // Выводим что-то, пока пользователь загружается
  }

  // Функция для рендеринга контента в зависимости от выбранной секции
  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralContent userId={user.id} userToken={token} userName={user.name} userEmail={user.email} userRole={user.role} />;
      case 'OrdersBuyer':
        return <OrdersBuyer userId={user.id} userToken={token} />;
      case 'student':
        return <StudentContent userId={user.id} userToken={token} />;
      case 'AddProductSeller':
        return <AddProductSeller userId={user.id} userToken={token} />;
      case 'OrdersSeller':
        return <OrdersSeller userId={user.id} userToken={token} />;
      default:
        return <div>Выберите раздел</div>;
    }
  };

  return (
    <div className="flex lg:flex-row flex-col h-auto">
      {/* Sidebar */}
      <aside className="lg:w-64 w-full bg-gray-100 lg:h-screen sticky top-0">
        <div className="p-4 m-2 bg-white rounded-lg ">
          <h2 className="text-xl font-bold">Панель</h2>
          <ul className="mt-4 flex flex-col gap-2">
            <li
              className={`p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer ${
                activeSection === 'general' ? 'bg-gray-200' : ''
              }`}
              onClick={() => setActiveSection('general')}
            >
              Общая информация
            </li>
            {user.role === 'buyer' && (
              <li
                className={`p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer ${
                  activeSection === 'OrdersBuyer' ? 'bg-gray-200' : ''
                }`}
                onClick={() => setActiveSection('OrdersBuyer')}
              >
                Заказы
              </li>
            )}
            {user.role === 'student' && (
              <li
                className={`p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer ${
                  activeSection === 'student' ? 'bg-gray-200' : ''
                }`}
                onClick={() => setActiveSection('student')}
              >
                Информация для студентов
              </li>
            )}
            {user.role === 'seller' && (
              <>
              <li
                className={`p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer ${
                  activeSection === 'AddProductSeller' ? 'bg-gray-200' : ''
                }`}
                onClick={() => setActiveSection('AddProductSeller')}
              >
                Ваши товары
              </li>
              <li
                className={`p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer ${
                  activeSection === 'OrdersSeller' ? 'bg-gray-200' : ''
                }`}
                onClick={() => setActiveSection('OrdersSeller')}
              >
                Заказы покупателей
              </li>
              </>


            )}
          </ul>
        </div>
      </aside>


      {/* Main Content */}
      <main className="flex-1 bg-gray-100 lg:p-6 p-2">
        <h1 className="text-2xl font-bold mb-4">Добро пожаловать в ваш аккаунт!</h1>
    
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
