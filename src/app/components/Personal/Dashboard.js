'use client'; 

import React, { useState, useEffect } from 'react';
import { useUser } from '../Auth/UserProvider'; 
import { useRouter } from 'next/navigation'; 
import OrdersBuyer from '@/app/components/Personal/Role/Buyer/OrdersBuyer'; 
import StudentContent from '@/app/components/Personal/Role/Student/StudentContent'; 
import AddProductSeller from '@/app/components/Personal/Role/Seller/AddProductSeller'; 
import GeneralContent from '@/app/components/Personal/Role/GeneralContent';
import OrdersSeller from '@/app/components/Personal/Role/Seller/OrdersSeller';
import Subscriptions from '@/app/components/Personal/Role/Subscriptions';
import {useSearchParams } from 'next/navigation'
import Loader from '../Loaders/Loader';
import axios from 'axios';

const Dashboard = () => {
  const { user, token } = useUser();

  const router = useRouter();  // Создаем роутер
  const [activeSection, setActiveSection] = useState('general');  // Инициализируем состояние с дефолтным значением
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sectionFromUrl = searchParams.get('section');  
    if (sectionFromUrl) {
      setActiveSection(sectionFromUrl);
    }

    if (!user.id) return;

    const fetchSubscription = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/subscriptions/${user.id}`,
                { withCredentials: true }
            );

            if (response.status === 204) {
                setSubscription([]); // Делаем пустым массивом, а не null
                return;
            }

            
            const activeSubscriptions = response.data.filter(sub => new Date(sub.end_date) > new Date());
            setSubscription(activeSubscriptions); // Сохраняем массив
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchSubscription();
}, [searchParams, user.id]);


  if (!user) {
    return <Loader />;
  }
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">Ошибка: {error}</p>;

  const handleSectionChange = (section) => {
    setActiveSection(section);
    router.push(`/dashboard?section=${section}`);  // Обновляем URL
  };


  // Функция для рендеринга контента в зависимости от выбранной секции
  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralContent userId={user.id} userToken={token} userName={user.name} 
        userEmail={user.email} userRole={user.role} subscription={subscription} />;
      case 'сustomer-orders':
        return <OrdersBuyer userId={user.id} userToken={token} />;
      case 'student-info':
        return <StudentContent userId={user.id} userToken={token} />;
      case 'your-products':
        return <AddProductSeller userId={user.id} userToken={token} />;
      case 'seller-orders':
        return <OrdersSeller userId={user.id} userToken={token} />;
      case 'customer-subscriptions':
        return <Subscriptions subscription={subscription} />;
      default:
        return <div>Выберите раздел</div>;
    }
  };


  return (
<div className="flex lg:flex-row flex-col h-auto">
   
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
            <li
              className={`p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer ${activeSection === 'customer-subscriptions' ? 'bg-gray-200' : ''}`}
              onClick={() => handleSectionChange('customer-subscriptions')}
            >
              Подписки
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

    
      <main className="flex-1 bg-gray-100 lg:px-6 p-2">
        
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
