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

    // Получение CSRF-токена
    const fetchCsrf = async () => {
      await axios.get(csrfUrl, { withCredentials: true });
    };

    const fetchMessages = async () => {
      try {
        await fetchCsrf();
        const response = await axios.get(`https://test.kimix.space/api/auth/chat/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true,
          withXSRFToken: true,
        });

        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();


    Pusher.logToConsole = true;
    // Подключение к Pusher и подписка на канал
    const pusher = new Pusher('a511ccd3ff6dbde81a48', {
      cluster: 'eu',
    });

    // Подписка на приватный канал
    const channel = pusher.subscribe(`chat.${orderId}`);

    // Обработка новых сообщений
    channel.bind('messageSent', (data) => {
      console.log('Event MessageSent received');
      console.log('Received data:', data);
      if (data && data.user_id && data.message) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { user_id: data.user_id, message: data.message, id: Date.now() } // Используйте Date.now() для уникального ID
        ]);
      } else {
        console.error('Invalid message format:', data);
      }
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
    <div>
      <h2>Chat for Order ID: {orderId}</h2>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.user_id}: </strong>
            {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatOrder;
