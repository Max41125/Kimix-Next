import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ReactSVG } from 'react-svg';
import NotFound from '/public/notfound.svg';
import Link from 'next/link';
import Image from 'next/image';
import Loader from '../../../Loaders/Circle';

const BuyerContent = ({ userId, userToken }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const csrfUrl = process.env.NEXT_PUBLIC_CSRF_URL;






  useEffect(() => {
    const fetchOrders = async () => {
      try {
        await axios.get(csrfUrl, { withCredentials: true });
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/${userId}/orders/`, {

          headers: {
            Authorization: `Bearer ${userToken}`
          },
          withCredentials: true,
          withXSRFToken:true,

        });

        const sortedOrders = response.data.sort((a, b) => b.id - a.id);
        setOrders(sortedOrders);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p>{error}</p>;
  }
  const translateStatus = (status) => {

    switch (status) {
      case 'new': return 'Новый заказ';
      case 'contract_verification': return 'Проверка контракта';
      case 'waiting_payment': return 'Ожидание оплаты';
      case 'packing': return 'Комплектация¥';
      case 'shipping': return 'Отгрузка';
      case 'shipped': return 'Отгружен';
      default: return status;
    }

  };

  return (
    <div className="w-full my-8 p-4 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Ваши заказы</h2>
      {orders?.length > 0 ? (
        <ul className="space-y-4">
          {orders.map(order => (
            <li key={order.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
              <div className='flex flex-row justify-between'>
                <div className='flex flex-col'>
                  <div className="mb-2">
                    <span className="font-semibold">ID заказа:</span> {order.id}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Общая сумма:</span> {order.total_price} {order.currency}
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold">Дата создания:</span> {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className='flex flex-col'>
                  <span className='py-2 px-4 bg-blue-200 rounded-full' >
                    {translateStatus(order.status)}
                  </span>
                </div>

              </div>
              {order.products.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Продукты:</h3>
                  <ul className="space-y-2">
                    {order.products.map(product => (
                      <li key={product.id} className="p-2 bg-white border rounded-md shadow-sm">
                        <div className="flex lg:flex-row flex-col items-center">
                        {product.image ? (
                          <ReactSVG 
                            src={`data:image/svg+xml;utf8,${encodeURIComponent(product.image)}`} 
                            className="flex items-center w-16 h-16" 
                            beforeInjection={(svg) => {
                              svg.classList.add('checkout__product__image');
                            }}
                          />
                        ) : (
                          <Image
                            src={NotFound} // Иконка по умолчанию
                            alt="No image"
                            height={150}
                            className="flex flex-col w-16 h-16" // Чтобы иконка сохраняла пропорции
                          />
                        )}
                          <div>
                            <div className="font-semibold">{product.name} ({product.formula})</div>
                            <div>{product.title}</div>
                            <div className="text-sm text-gray-500">CAS номер: {product.cas_number}</div>
                          </div>
                          <div className='flex flex-col ml-auto items-center justify-center lg:w-auto w-full'>
                          <Link
                          href={`/dashboard/chat?orderId=${order.id}`}
                          className=' p-4 rounded-full bg-gray-300 transition transition-colors hover:bg-indigo-400 lg:w-auto  text-center w-full'>
                            Чат с продавцом
                          </Link>

                        </div>


                        </div>

                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Продукты не указаны</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-600">Заказы не найдены.</p>
      )}
    </div>
  );
};

export default BuyerContent;
