'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { useUser } from '../Auth/UserProvider';
import { useSearchParams } from 'next/navigation';
import Loader from '../Loaders/Loader';

const ChatOrder = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const csrfUrl = 'https://test.kimix.space/sanctum/csrf-cookie';
  const { user, token } = useUser() || { user: null, token: null };
  
  useEffect(() => {
    if (!user || !token || !orderId) return;

    const fetchMessages = async () => {
      await axios.get(csrfUrl, { withCredentials: true });

      try {
        const response = await axios.get(`https://test.kimix.space/api/auth/chat/messages/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true,
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Ошибка при получении сообщений:', error);
      }
    };

    fetchMessages();

    Pusher.logToConsole = true;
    const pusher = new Pusher('a511ccd3ff6dbde81a48', {
      cluster: 'eu',
    });

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
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) {
    return <Loader />;
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Chat for Order ID: {orderId}</h2>
      <div className="h-96 overflow-y-auto mb-4 p-4 bg-white rounded-md shadow-inner">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong className="text-blue-600">{msg.username}: </strong>
            <span className="text-gray-800">{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={handleSendMessage}
          className="ml-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default ChatOrder;
