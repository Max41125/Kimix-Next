'use client'; 

import React, { useState, useEffect } from 'react';
import { useUser } from '../Auth/UserProvider'; 
import { useRouter } from 'next/navigation'; 
import OrdersBuyer from '@/app/components/Personal/Role/OrdersBuyer'; 
import StudentContent from '@/app/components/Personal/Role/StudentContent'; 
import AddProductSeller from '@/app/components/Personal/Role/AddProductSeller'; 
import GeneralContent from '@/app/components/Personal/Role/GeneralContent';
import OrdersSeller from '@/app/components/Personal/Role/OrdersSeller';
import {useSearchParams } from 'next/navigation'
import Loader from '../Loaders/Loader';

const Dashboard = () => {
  const { user, token } = useUser();

  const router = useRouter();  // Создаем роутер
  const [activeSection, setActiveSection] = useState('general');  // Инициализируем состояние с дефолтным значением
  const searchParams = useSearchParams();

  useEffect(() => {
    const sectionFromUrl = searchParams.get('section');  // Извлекаем параметр 'section' из URL
    if (sectionFromUrl) {
      setActiveSection(sectionFromUrl);  // Обновляем состояние, если параметр 'section' существует
    }
  }, [searchParams]);  // Перезапускаем эффект при изменении параметров

  if (!user) {
    return <Loader />;
  }

  const handleSectionChange = (section) => {
    setActiveSection(section);
    router.push(`/dashboard?section=${section}`);  // Обновляем URL
  };


  // Функция для рендеринга контента в зависимости от выбранной секции
  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralContent userId={user.id} userToken={token} userName={user.name} userEmail={user.email} userRole={user.role} />;
      case 'сustomer-orders':
        return <OrdersBuyer userId={user.id} userToken={token} />;
      case 'student-info':
        return <StudentContent userId={user.id} userToken={token} />;
      case 'your-products':
        return <AddProductSeller userId={user.id} userToken={token} />;
      case 'seller-orders':
        return <OrdersSeller userId={user.id} userToken={token} />;
      default:
        return <div>Выберите раздел</div>;
    }
  };


  return (
<div className="flex lg:flex-row flex-col h-auto">
      {/* Sidebar */}
      <aside className="lg:w-64 w-full bg-gray-100 lg:h-screen z-50 sticky top-0">
        <div className="p-4 m-2 bg-white rounded-lg ">
          <h2 className="text-xl font-bold">Панель</h2>
          <ul className="mt-4 flex flex-col gap-2">
            <li
              className={`p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer ${activeSection === 'general' ? 'bg-gray-200' : ''}`}
              onClick={() => handleSectionChange('general')}
            >
              Общая информация
            </li>
            {user.role === 'buyer' && (
              <li
                className={`p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer ${activeSection === 'сustomer-orders' ? 'bg-gray-200' : ''}`}
                onClick={() => handleSectionChange('сustomer-orders')}
              >
                Заказы
              </li>
            )}
            {user.role === 'student' && (
              <li
                className={`p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer ${activeSection === 'student-info' ? 'bg-gray-200' : ''}`}
                onClick={() => handleSectionChange('student-info')}
              >
                Информация для студентов
              </li>
            )}
            {user.role === 'seller' && (
              <>
                <li
                  className={`p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer ${activeSection === 'your-products' ? 'bg-gray-200' : ''}`}
                  onClick={() => handleSectionChange('your-products')}
                >
                  Ваши товары
                </li>
                <li
                  className={`p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer ${activeSection === 'seller-orders' ? 'bg-gray-200' : ''}`}
                  onClick={() => handleSectionChange('seller-orders')}
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
