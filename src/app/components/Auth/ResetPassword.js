'use client';

import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const csrfUrl = 'https://test.kimix.space/sanctum/csrf-cookie';
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {

        await axios.get(csrfUrl, {
            withCredentials: true,

        });

        const response = await axios.post('https://test.kimix.space/api/auth/forgot-password', {
            email,
        }, {
       
            withCredentials: true,
            withXSRFToken:true,
        });

        if (response.status === 200) {
            setMessage('Инструкции по сбросу пароля отправлены на вашу почту.');
        }
    } catch (err) {
        setError('Ошибка при отправке. Проверьте email и попробуйте снова.');
    }
  };

  return (
    <div className="flex justify-center h-screen container mx-auto p-4 items-center">
      <div className="bg-white shadow-2xl p-10 rounded-lg w-full lg:w-6/12">
        <h2 className="text-xl font-semibold mb-4">Сброс пароля</h2>
        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Введите email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded w-full p-2 mb-4"
          />
          <button type="submit" className="bg-teal-500 text-white px-4 py-2 rounded w-full">
            Отправить
          </button>
        </form>
        {message && <p className="text-green-500 mt-4">{message}</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
