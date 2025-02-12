import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Loader from '@/app/components/Loaders/Circle'
const ContractVerification = ({ userRole, userId, userToken, orderId, contractStatus }) => {
  const [status, setStatus] = useState(null); // Исправлено на null
  const [loading, setLoading] = useState(true); // Изначально состояние загрузки
  const [error, setError] = useState(null);
  const csrfUrl = process.env.NEXT_PUBLIC_CSRF_URL;

  useEffect(() => {
    const fetchContractStatus = async () => {
      if (!userId || !userToken || !orderId) return;

      try {
        await axios.get(csrfUrl, { withCredentials: true });

        const response = await axios.get(`https://test.kimix.space/api/contract-orders/${orderId}`, {
          headers: { Authorization: `Bearer ${userToken}` },
          withCredentials: true,
          withXSRFToken: true,
        });

        const statusInfo = response.data;
        setStatus(statusInfo); // Устанавливаем данные правильно

      } catch (err) {
        setError('Произошла ошибка при подтверждении контракта');
        console.error('Fetch address error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContractStatus();
  }, [userId, userToken, orderId]);

  // Если данные загружаются, показываем лоадер
  if (loading) {
    return <Loader/>;
  }

  // Если произошла ошибка, показываем ошибку
  if (error) {
    return <div>{error}</div>;
  }

  // Если статус еще не загружен
  if (!status) {
    return null;
  }

  return (
    <div>
      
        <div className='p-4 rounded-lg bg-white'>
        
         {userRole == 'buyer' ? (
            <div>
            {contractStatus === 'contract_verification' ? (

                <h2 className='mb-4'>Контракт на проверке</h2>
            ):(

                <div>
                {contractStatus === 'waiting_payment' ? (

                  <h2 className='mb-4'>Контракт проверен ожидает оплаты</h2>
                ):(

                  <h2 className='mb-4'>Интерактивный контракт</h2>
                )}
               </div>

            )}
             </div>

         ):(
            <div>
            {contractStatus === 'contract_verification' ? (

                <h2 className='mb-4'>Контракт на проверку</h2>
            ):(
                <div>
                {contractStatus === 'waiting_payment' ? (

                  <h2 className='mb-4'>Контракт проверен. Ожидание оплаты</h2>
                ):(

                  <h2 className='mb-4'>Интерактивный контракт</h2>
                )}
               </div>
            )}

            </div>
         )}

          {status.contract_order.language === 'ru' ? (
            <Link
              href={`/dashboard/chat/contract?orderId=${orderId}&lang=ru`}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Контракт (RU)
            </Link>
          ) : (
            <Link
              href={`/dashboard/chat/contract?orderId=${orderId}&lang=en`}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Контракт (EN)
            </Link>
          )}
        </div>
    
    </div>
  );
};

export default ContractVerification;
