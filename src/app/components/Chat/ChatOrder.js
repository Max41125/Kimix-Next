'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { useUser } from '../Auth/UserProvider';
import { useSearchParams } from 'next/navigation';
import Loader from '../Loaders/Loader';
import Link from 'next/link';
import { TbHandClick, TbSend  } from "react-icons/tb";
import { GiPaperClip } from "react-icons/gi";
import SendIcon from '/public/send.svg';
import Image from 'next/image';
import { RxCross1 } from 'react-icons/rx';
import OrderProgressLine from '@/app/components/Personal/OrderProgressLine';
import { useRouter } from 'next/navigation';
import ContractVerification from '@/app/components/Chat/ContractVerification';
import ContractPayment from '@/app/components/Chat/ContractPayment';
import ContractShipping from '@/app/components/Chat//ContractShipping';


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
  const [hasPermission, setHasPermission] = useState(true); 
  const [loading, setLoading] = useState(true); 
  const csrfUrl = 'https://test.kimix.space/sanctum/csrf-cookie';
  const { user, token } = useUser() || { user: null, token: null };
  const router = useRouter();

  useEffect(() => {
    if (!user || !token || !orderId) return;

    const fetchOrder = async () => {
      try {
        await axios.get(csrfUrl, { withCredentials: true });
        const response = await axios.get(`https://test.kimix.space/api/user/order/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true,
          withXSRFToken:true,

        });

        const dataOrder = response.data;
        setOrder(dataOrder);
        if (dataOrder.user_id !== user.id && dataOrder.products?.[0].pivot?.supplier_id !== user.id) {
          setHasPermission(false); // Если нет прав доступа
          setLoading(false); // Завершаем загрузку
          return;
        }else{

          setLoading(false);
        }
        
      } catch (err) {
        console.error('Ошибка при получении заказа:', err);
      }
    };


    
    const fetchMessages = async () => {
      
      try {
        const response = await axios.get(`https://test.kimix.space/api/auth/chat/messages/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          withXSRFToken:true,
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Ошибка при получении сообщений:', error);
      }
    };

    const fetchDocuments = async () => {
      try {
        const response = await axios.get(`https://test.kimix.space/api/auth/chat/documents/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          withXSRFToken:true,
        });
        setDocuments(response.data);
      } catch (error) {
        console.error('Ошибка при получении документов:', error);
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
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [orderId, token, user]);

  const handleSendMessage = async () => {
    if (!message) return;
    try {
      await axios.post('https://test.kimix.space/api/auth/send-message', {
        message,
        user_id: user.id,
        username: user.name,
        order_id: orderId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        withXSRFToken:true,
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('order_id', orderId);
    formData.append('user_id', user.id);

    try {
      await axios.post('https://test.kimix.space/api/auth/chat/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        withXSRFToken:true,
      });
      setSelectedFile(null);
      fetchDocuments();
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
    }
  };

  const toggleContract = () => {
    setIsContractOpen((prev) => !prev);
  };



  if (!user) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />; // Пока идет перенаправление, показываем лоадер
  }

  if (!loading && !hasPermission) {
    router.push('/dashboard');
    return <Loader />; 
  }




  const handleDeleteFile = () => {
    if (!selectedFile) return;
  
    // Сбрасываем состояние выбранного файла
    setSelectedFile(null);
  
    console.log('Файл удалён из состояния.');
  };
  
  return (
    <div className="my-6 flex gap-4 flex-col lg:flex-row container mx-auto">
      <div className="p-6 bg-gray-100 rounded-lg shadow-md w-8/12">
        <h2 className="text-xl font-semibold mb-4">Чат по заказу №{orderId}</h2>
        <div className="h-96 overflow-y-auto mb-4 p-4 bg-white rounded-md shadow-inner">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <strong className="text-blue-600">{msg.username}: </strong>
              <span className="text-gray-800">{msg.message}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите сообщение"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="ml-2 p-2 cursor-pointer text-gray-500 transition duration-200">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <GiPaperClip size={40} className='border p-1 border-gray-300 hover:bg-blue-500 transition duration-200  rounded-full' />
          </label>
          <button onClick={handleSendMessage} className="ml-2 p-1 border  border-gray-300 rounded-full cursor-pointer text-gray-500 hover:bg-blue-500 transition duration-200">
              <Image
                src={SendIcon}
                width={30}
                height={30}
                className=' p-1   transition duration-200 '
              />
          </button>
        </div>
        {selectedFile && (
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-sm text-gray-600">{selectedFile.name}</span>
            <button
              onClick={handleFileUpload}
              className="p-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition duration-200"
            >
              Загрузить
            </button>
            <button
              onClick={handleDeleteFile}
              className='ml-2'
              >
                <RxCross1 color='red'/>
              </button>
          </div>
        )}
      </div>

      <div className="p-6 bg-gray-100 rounded-lg shadow-md w-4/12 flex flex-col gap-2">
        <p className="text-xl font-semibold">Статус заказа</p>
        <OrderProgressLine status={contractStatus} />


      
        {documents?.length > 0 && (
          <div className="bg-white p-2 flex flex-col rounded-xl">
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

    
        {contractStatus == 'new' && (
          
          <div className="mt-4 bg-white rounded-lg bg-white rounded-xl">
          <div
            className={`flex items-center p-2 cursor-pointer rounded-lg bg-white rounded-xl group`}
            onClick={toggleContract}
          >
          
            <span className="font-semibold">Интерактивный контракт</span>
            <TbHandClick
              fontSize={30}
              className='ml-auto mr-4 border border-1 border-black p-1  rounded-full group-hover:scale-90 transition'
            />
          </div>
          {isContractOpen && (
            <div className="mt-2 p-2 flex gap-4 items-center rounded-md transition rounded-lg bg-white rounded-xl ">
              <Link 
              href={`/dashboard/chat/contract?orderId=${orderId}&lang=ru`}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Контракт (RU)
              </Link>
              <Link href={`/dashboard/chat/contract?orderId=${orderId}&lang=en`}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">

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
       
       {(contractStatus === 'packing' || contractStatus === 'shipping' || contractStatus === 'shipped') &&
          user.role === 'seller' && (
            <ContractShipping userToken={token} orderId={orderId} currentStatus={contractStatus} />
        )}
      </div>
    </div>
  );
};

export default ChatOrder;
