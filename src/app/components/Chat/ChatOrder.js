'use client';

import React, { useEffect, useState, useRef, useLayoutEffect} from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { useUser } from '../Auth/UserProvider';
import { useSearchParams } from 'next/navigation';
import Loader from '../Loaders/Loader';
import Link from 'next/link';
import { TbHandClick, TbSend } from "react-icons/tb";
import { GiPaperClip } from "react-icons/gi";
import SendIcon from '/public/send.svg';
import Image from 'next/image';
import { RxCross1 } from 'react-icons/rx';
import OrderProgressLine from '@/app/components/Personal/OrderProgressLine';
import { useRouter } from 'next/navigation';
import ContractVerification from '@/app/components/Chat/ContractVerification';
import ContractPayment from '@/app/components/Chat/ContractPayment';
import ContractShipping from '@/app/components/Chat/ContractShipping';
import { MdFileDownload } from "react-icons/md";

const ChatOrder = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [messages, setMessages] = useState([]);
  const [order, setOrder] = useState([]);
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [contractStatus, setContractStatus] = useState('not_filled');
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true); 
  const [hasPermission, setHasPermission] = useState(true);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true); 
  const csrfUrl = process.env.NEXT_PUBLIC_CSRF_URL;
  const { user, token } = useUser() || { user: null, token: null };
  const router = useRouter();
  
  const fetchDocuments = async () => {
    try {
        const response = await axios.get(`https://test.kimix.space/api/auth/chat/documents/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
            withXSRFToken: true,
        });

        // Загружаем документы без сортировки, будем сортировать позже
        setDocuments(response.data);
    } catch (error) {
        console.error('Ошибка при получении документов:', error);
        setDocuments([]); // Очистка состояния документов в случае ошибки
    }
};
  
  
  
  useEffect(() => {
    if (!user || !token || !orderId) return;

    const fetchOrder = async () => {
      try {
        await axios.get(csrfUrl, { withCredentials: true });
        const response = await axios.get(`https://test.kimix.space/api/user/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          withXSRFToken:true,
        });

        const dataOrder = response.data;
        setOrder(dataOrder);
        if (dataOrder.user_id !== user.id && dataOrder.products?.[0].pivot?.supplier_id !== user.id) {
          setHasPermission(false);
          setLoading(false);
          return;
        }
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при получении заказа:', err);
      }
    };
    const fetchMessages = async () => {
      try {
          const response = await axios.get(`https://test.kimix.space/api/auth/chat/messages/${orderId}`, {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
              withXSRFToken: true,
          });

          const sortedMessages = response.data.map(msg => ({
              ...msg,
              isOwnMessage: msg.user_id === user.id, // Ваше ли это сообщение?
          })).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Сортировка по времени

          setMessages(sortedMessages); // Сохраняем отсортированные сообщения
      } catch (error) {
          console.error('Ошибка при получении сообщений:', error);
      }
  };
    
    

 

    const fetchContractStatus = async () => {
      try {
        const response = await axios.get(`https://test.kimix.space/api/orders/${orderId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          withXSRFToken:true,
        });
        setContractStatus(response.data.status);
      } catch (error) {
        console.error('Ошибка при получении статуса контракта:', error);
      }
    };

    fetchOrder();  
    fetchMessages();
    fetchDocuments();
    fetchContractStatus();

    Pusher.logToConsole = true;
    const pusher = new Pusher('a511ccd3ff6dbde81a48', { cluster: 'eu' });
    const channel = pusher.subscribe(`chat.${orderId}`);
    channel.bind('messageSent', (data) => {
      console.log('Received data:', data);
  
      const messageData = data;  // Данные уже являются объектом
  
      if (messageData) {
          // Определяем, ваше ли это сообщение
          const isOwnMessage = messageData.userId === user.id;
  
          // Генерация временной метки, если её нет
          const created_at = new Date().toISOString();
          
          // Формируем сообщение с добавлением флага isOwnMessage и временной метки
          const message = {
              ...messageData,
              created_at,  // Преобразуем в ISO строку
              isOwnMessage, // true, если сообщение отправлено вами, иначе false
          };

          // Добавляем новое сообщение в конец и сохраняем сортировку
          setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages, message];
              return updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Сортировка по времени
          });
      } else {
          console.error('Полученные данные пусты или не содержат нужные поля');
      }
      
  });
  
    
    
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [orderId, token, user]);




  const handleSendMessage = async () => {
    if (!message && !selectedFile) return; // Если нет текста и файла — не отправлять
  
    try {
      // Отправка текста сообщения
      if (message) {
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/send-message`, {
          message,
          user_id: user.id,
          username: user.name,
          order_id: orderId,
        }, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          withXSRFToken: true,
        });
        console.log('Сообщение отправлено:', message); // Логирование текста
      }
  
      // Отправка файла
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('order_id', orderId);
        formData.append('user_id', user.id);
  
        try {
          // Отправка формы с файлом
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/chat/upload`, formData, {
            headers: { 
              Authorization: `Bearer ${token}`, 
              'Content-Type': 'multipart/form-data' 
            },
            withCredentials: true,
            withXSRFToken: true,
          });
      
          if (response.status === 200) {
            // Успешная загрузка
            alert(`Файл ${selectedFile.name} загружен успешно`);
          }
        } catch (error) {
          // Ошибка при загрузке
          if (error.response && error.response.status === 422) {
            // Ошибка валидации файла (неправильный тип)
            alert('Ошибка: файл должен быть формата pdf, doc или docx.');
          } else {
            // Другие ошибки
            alert('Ошибка при загрузке файла. Попробуйте снова.');
          }
        }
        fetchDocuments();  // Обновление документов после загрузки
        console.log('Файл отправлен:', selectedFile.name); // Логирование файла
      }
  
      // Очистка состояния после отправки
      setMessage('');   // Очистка текста сообщения
      setSelectedFile(null);  // Очистка выбранного файла
      console.log('Состояния очищены: message и selectedFile');
    } catch (error) {
      console.error('Ошибка при отправке сообщения или загрузке файла:', error);
    }
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('Selected file:', file);
    setSelectedFile(file);
  };

  const handleDeleteFile = () => {
    if (!selectedFile) return;
    setSelectedFile(null);
  };

  const toggleContract = () => {
    setIsContractOpen((prev) => !prev);
  };

  useLayoutEffect(() => {
    if (isFirstLoad && messagesEndRef.current) {
    
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsFirstLoad(false);
    }
  }, [isFirstLoad, messages]);


  if (!user || !user.id) {
    return <Loader />; // Или другой индикатор загрузки
  }

  if (loading) {
    return <Loader />;
  }

  if (!loading && !hasPermission) {
    router.push('/dashboard');
    return <Loader />;
  }
  const mergedMessagesAndDocs = [
    ...messages.map(msg => ({
        type: 'message',
        timestamp: msg.created_at,
        content: msg.message,
        isOwnMessage: msg.isOwnMessage,
    })),
    ...documents.map(doc => ({
        type: 'document',
        timestamp: doc.created_at,
        content: doc.filename,
        filePath: `https://test.kimix.space${doc.path}`,
        isOwnMessage: doc.user_id === user.id,
    })),
];

// Сортируем объединенный массив по времени
const sortedItems = mergedMessagesAndDocs.sort((a, b) => {
  const timestampA = new Date(a.timestamp).getTime();
  const timestampB = new Date(b.timestamp).getTime();
  return timestampA - timestampB;
});


  return (
    <div className="my-6 flex gap-4 flex-col lg:flex-row lg:p-0 p-2 container mx-auto">
      <div className="lg:p-6 p-2 bg-gray-100 rounded-lg shadow-md lg:w-8/12 w-full">
        <h2 className="text-xl font-semibold mb-4">Чат по заказу №{orderId}</h2>
        <div className="h-96 overflow-y-auto overflow-x-hidden mb-4 p-4 bg-white rounded-md shadow-inner">
        {sortedItems.map((item, index) => {
          if (item.type === 'message') {
            // Это сообщение
            const isOwnMessage = item.isOwnMessage;

            return (
              <div
                key={`message-${index}`}
                className={`mb-2 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-2 rounded-lg ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`}
                >
                  <span>{item.content}</span>
                </div>
              </div>
            );
          } else if (item.type === 'document') {
            const isOwnMessage = item.isOwnMessage;
            return (
              <div key={`document-${index}`} className={`mb-2 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <a
                  href={item.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`max-w-xs flex items-center gap-2 p-2 rounded-lg ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`}
                >
                  <MdFileDownload
                    width={25}
                    height={25}
                    color={isOwnMessage ? '#FFF' : '#000'}  // Исправленный способ применения условного цвета
                    className="border border-gray-300 rounded-full"
                  />
                  {item.content}
                </a>
              </div>
            );
          }
        })}

    
          <div ref={messagesEndRef} />
     



        </div>
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Введите сообщение"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="ml-2 p-2 cursor-pointer text-gray-500 transition duration-200">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <GiPaperClip size={40} className='border p-1 border-gray-300 hover:bg-blue-300 transition duration-200 rounded-full' />
          </label>
          <button onClick={handleSendMessage} className="ml-2 p-1 border border-gray-300  text-white text-sm rounded-full hover:bg-blue-300 transition duration-200">
            <Image src={SendIcon} width={30} height={30} className="p-1 transition duration-200" />
          </button>
        </div>
        {selectedFile && (
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-sm text-gray-600">{selectedFile.name}</span>
            <button onClick={handleDeleteFile} className="p-1 text-red-500 hover:text-red-700">
              <RxCross1 />
            </button>
          </div>
        )}
      </div>

      <div className="lg:p-6 p-2 bg-gray-100 rounded-lg shadow-md  lg:w-4/12  w-full flex flex-col gap-2">
        <p className="text-xl font-semibold">Статус заказа</p>
        <OrderProgressLine status={contractStatus} />
        {documents?.length > 0 && (
          <div className="bg-white p-2 flex flex-col rounded-xl overflow-hidden">
            <p>Документы по заказу</p>
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={`https://test.kimix.space${doc.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {doc.filename}
              </a>
            ))}
          </div>
        )}

        {contractStatus === 'new' && (
          <div className="mt-4 bg-white rounded-lg">
            <div className="flex items-center p-2 cursor-pointer rounded-lg bg-white" onClick={toggleContract}>
              <span className="font-semibold">Интерактивный контракт</span>
              <TbHandClick fontSize={30} className="ml-auto border p-1 rounded-full hover:scale-90 transition" />
            </div>
            {isContractOpen && (
              <div className="mt-2 p-2 flex gap-4 items-center rounded-md transition bg-white">
                <Link href={`/dashboard/chat/contract?orderId=${orderId}&lang=ru`} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Контракт (RU)
                </Link>
                <Link href={`/dashboard/chat/contract?orderId=${orderId}&lang=en`} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Контракт (EN)
                </Link>
              </div>
            )}
          </div>
        )}

        {contractStatus !== 'new' && (
          <ContractVerification userRole={user.role} userId={user.id} userToken={token} orderId={orderId} contractStatus={contractStatus} />
        )}

        {contractStatus === 'waiting_payment' && (
          <ContractPayment userRole={user.role} supplierId={order.products?.[0].pivot?.supplier_id} userToken={token} orderId={orderId} />
        )}

        {(contractStatus === 'packing' || contractStatus === 'shipping' || contractStatus === 'shipped') && user.role === 'seller' && (
          <ContractShipping userToken={token} orderId={orderId} currentStatus={contractStatus} />
        )}
      </div>
    </div>
  );
};

export default ChatOrder;
