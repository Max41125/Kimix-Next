'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Loader from '@/app/components/Loaders/Circle';

const ContractPayment = ({ userRole, supplierId, userToken, orderId}) => {
  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!supplierId) return;

      try {
        const responseSupplier = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seller/${supplierId}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
            withCredentials: true,
            withXSRFToken: true,
          }
        );
        setSupplier(responseSupplier.data);
      } catch (err) {
        setError('Не удалось загрузить данные о поставщике.');
        console.error('Ошибка загрузки поставщика:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [supplierId, userToken]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const handleSubmitPayment = async () => {
    try {

  
      const statusChangeResponse = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/${orderId}/status`,

        { status: "packing" },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
          withXSRFToken: true,
        }
      );
  
      // Проверка ответа на изменение статуса
      if (statusChangeResponse.status === 200) {
        

          alert('Оплата подтверждена статус изменен на "Комплектация" ');
  
        
      } else {
        alert('Ошибка при изменении статуса заказа');
      }
    } catch (error) {
      console.error('Ошибка при отправке контракта:', error);
      alert('Ошибка при отправке контракта');
    }
  };
  






  return (
    <div>
      <div className="p-4 rounded-lg bg-white">
        {userRole === 'buyer' ? (
          <div>
            <h1 className="mb-4 font-bold">Оплата заказа</h1>
            <p>Вы можете оплатить заказ по следующим реквизитам:</p>
            <p><strong>Название банка:</strong> {supplier?.bank_name || 'Информация отсутствует'}</p>
            <p><strong>БИК:</strong> {supplier?.bik || 'Информация отсутствует'}</p>
            <p><strong>Р/C:</strong> {supplier?.settlement_account || 'Информация отсутствует'}</p>
            <p><strong>К/C:</strong> {supplier?.settlement_account || '-'}</p>
          </div>
        ) : (
            <div>
                <h1 className="mb-4">Оплата заказа пользователем</h1>
                <button className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition" onClick={handleSubmitPayment}>
                    Подтвердить оплату
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ContractPayment;
