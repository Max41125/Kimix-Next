'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { useUser } from '../Auth/UserProvider';
import { useSearchParams } from 'next/navigation';
import Loader from '../Loaders/Loader';
import Link from 'next/link';
import { TbHandClick } from "react-icons/tb";

const ChatOrder = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [contractStatus, setContractStatus] = useState('not_filled'); // Статус контракта: not_filled, filled, under_review, canceled
  const [isContractOpen, setIsContractOpen] = useState(false);
  const csrfUrl = 'https://test.kimix.space/sanctum/csrf-cookie';
  const { user, token } = useUser() || { user: null, token: null };

  useEffect(() => {
    if (!user || !token || !orderId) return;

    const fetchMessages = async () => {
      await axios.get(csrfUrl, { withCredentials: true });
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
        const response = await axios.get(`https://test.kimix.space/api/auth/chat/contract/status/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          withXSRFToken:true,
        });
        setContractStatus(response.data.status);
      } catch (error) {
        console.error('Ошибка при получении статуса контракта:', error);
      }
    };

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

  const renderContractStatusIcon = () => {
    switch (contractStatus) {
      case 'filled':
      case 'not_filled':
        return (
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 animate-pulse mr-2"></span>
        );
      case 'under_review':
        return (
          <span className="inline-block w-3 h-3 mr-2">
            <svg
              className="text-green-500 w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m2 9a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-block w-3 h-3 mr-2">
            <svg
              className="text-red-500 w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        );
      default:
        return null;
    }
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
          <label className="ml-2 p-2 cursor-pointer text-gray-500 hover:text-blue-600 transition duration-200">
            <input type="file" className="hidden" onChange={handleFileChange} />
            📎
          </label>
          <button onClick={handleSendMessage} className="ml-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
            Отправить
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
          </div>
        )}
      </div>

      <div className="p-6 bg-gray-100 rounded-lg shadow-md w-4/12 flex flex-col gap-2">
        <p className="text-xl font-semibold">Информация по заказу</p>
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

        <div className="mt-4">
          <div
            className={`flex items-center p-2 cursor-pointer rounded-lg bg-white rounded-xl group`}
            onClick={toggleContract}
          >
            {renderContractStatusIcon()}
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
      </div>
    </div>
  );
};

export default ChatOrder;
