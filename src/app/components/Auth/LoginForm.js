'use client';

import React, { useState, useEffect } from 'react';

import { useUser } from '@/app/components/Auth/UserProvider';
import { CiCircleCheck } from "react-icons/ci"; 
import { CiCircleRemove } from "react-icons/ci";
import { useRouter } from 'next/navigation';
import axios from 'axios';

const LoginForm = () => {
  const router = useRouter(); // Инициализация useRouter
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const { login } = useUser();
  const [remember, setRemember] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // Успешная регистрация
  const [errors, setErrors] = useState({}); // Состояние для хранения ошибок
  const [verificationMessage, setVerificationMessage] = useState(null); // Сообщение о подтверждении
  const csrfUrl = 'https://test.kimix.space/sanctum/csrf-cookie';
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
  };







  // Валидация перед отправкой
  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Простой паттерн для email

    if (!email) {
      newErrors.email = 'Email обязателен';
    } else if (!emailPattern.test(email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!password) {
      newErrors.password = 'Пароль обязателен';
    } else if (password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }

    if (!isLoginMode) {
      if (!name) {
        newErrors.name = 'Имя обязательно';
      }

      if (confirmPassword !== password) {
        newErrors.confirmPassword = 'Пароли не совпадают';
      }

      if (!role) {
        newErrors.role = 'Выберите роль';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Возвращает true, если ошибок нет
  };





  const registerUser = async () => {
    const url = 'https://test.kimix.space/api/auth/register';
  
    try {
        await axios.get(csrfUrl, {
          withCredentials: true,

      });

      const response = await axios.post(url, {
        email,
        name,
        password,
        password_confirmation: confirmPassword,
        role
    }, {
       
        withCredentials: true,
        withXSRFToken:true,
    });

  
      const data = response.data;
      if (response.status >= 200 && response.status < 300) {
        console.log('Success:', data);
        setIsRegistered(true);
        setErrors({}); // Сброс ошибок после успешной регистрации
      } else {
        console.error('Error:', data);
        const errorMessages = data.errors || {};
        setErrors((prevErrors) => ({
          ...prevErrors,
          ...errorMessages
        }));
      }
    } catch (error) {
      console.error('Request error:', error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        network: 'Ошибка сети. Попробуйте снова.'
      }));
    }
  };



  const loginUser = async () => {
    const loginUrl = 'https://test.kimix.space/api/auth/login';
    
    try {
        // Получаем CSRF-токен
        await axios.get(csrfUrl, {
            withCredentials: true,

        });

            // Отправляем запрос на логин с заголовком X-XSRF-TOKEN
            const response = await axios.post(loginUrl, {
                email,
                password,
                remember
            }, {
               
                withCredentials: true,
                withXSRFToken:true,
            });

            const data = response.data;

            if (data.verify) {
              console.log('Success:', data);
              login({ email: data.email, role: data.role, name: data.name, id:data.id }, data.token);
              router.push('/dashboard'); // Перенаправляем на дашборд
            } else {
              setVerificationMessage("Пожалуйста, подтвердите вашу почту.");
              setErrors(null); // Сброс ошибок
            }
       
    } catch (error) {
        console.error('Request error:', error.response ? error.response.data : error);
        setErrors((prevErrors) => ({
            ...prevErrors,
            network: 'Ошибка сети. Попробуйте снова.'
        }));
    }
};


const handleSubmit = async (event) => {
  event.preventDefault();
  if (!validate()) return;

  if (isLoginMode) {
    await loginUser(); // Логика логина
  } else {

    await registerUser(); // Логика регистрации
  }

    // Сброс значений после успешной отправки (необходимо оставить только для успешного логина)
    if (isLoginMode) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setRole('');
      setErrors({}); // Сброс ошибок
    }

};






  return (
    <>

      
        <div className="flex justify-center h-screen container mx-auto p-4 items-center">
            <div className="bg-white shadow-2xl p-10 rounded-lg w-full lg:w-6/12">

                <div className="flex justify-center mb-4">
                    <button
                      className={`px-4 py-2 w-6/12 mr-2 rounded ${isLoginMode ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => setIsLoginMode(true)}
                    >
                      Вход
                    </button>
                    <button
                      className={`px-4 py-2 w-6/12 rounded ${!isLoginMode ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => setIsLoginMode(false)}
                    >
                      Регистрация
                    </button>
                </div>

                <form onSubmit={handleSubmit} className=" mx-auto  w-full">
                    {!isLoginMode && (
                      <div className='mb-4'>
                        <input
                            type="text"
                            placeholder="Имя"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border rounded w-full p-2 "
                            required={!isLoginMode}
                        />
                       {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                      </div>
                    )}
                    <div className='mb-4'>
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border rounded w-full p-2 "
                        required
                      />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                      </div>
                    <div className='mb-4'>
                    <input
                      type="password"
                      placeholder="Пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border rounded w-full p-2 "
                      required
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>
                    {!isLoginMode && (
                      <>
                      <div className='mb-4'>
                        <input
                          type="password"
                          placeholder="Подтверждение пароля"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="border rounded w-full p-2 "
                          required={!isLoginMode}
                        />
                         {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                        </div>
                        <div className="mb-4 flex space-x-2">
                            <label
                                className={`flex-1 p-2 text-center border rounded ${role === 'buyer' ? 'bg-green-500 text-white' : ''}`}
                                onClick={() => handleRoleChange('buyer')}
                            >
                                Покупатель
                            </label>
                            <label
                                className={`flex-1 p-2 text-center border rounded ${role === 'student' ? 'bg-blue-500 text-white' : ''}`}
                                onClick={() => handleRoleChange('student')}
                            >
                                Студент
                            </label>
                            <label
                                className={`flex-1 p-2 text-center border rounded ${role === 'seller' ? 'bg-orange-500 text-white' : ''}`}
                                onClick={() => handleRoleChange('seller')}
                            >
                                Продавец
                            </label>
                        </div>
                        {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
                        {errors.network && <p className="text-red-500 text-sm">{errors.network}</p>}
                      </>
                    )}

                    {isLoginMode && (
                      <div className="mb-4">
                          <input
                              type="checkbox"
                              id="remember"
                              checked={remember}
                              onChange={(e) => setRemember(e.target.checked)}
                          />
                          <label htmlFor="remember" className="ml-2">Запомнить меня</label>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 w-full"
                    >
                      {isLoginMode ? 'Вход' : 'Регистрация'}
                    </button>
                </form>

                {/* Уведомление о подтверждении регистрации */}
                {isRegistered && (
                  <div className="mt-4 flex items-center text-green-600">
                    <CiCircleCheck className="w-6 h-6 mr-2" />
                    <span>Регистрация успешна! Пожалуйста, подтвердите вашу почту.</span>
                  </div>
                )}

                {/* Сообщение о подтверждении почты */}
                {verificationMessage && (
                  <div className="mt-4 flex items-center text-yellow-600">
                    <CiCircleCheck className="w-6 h-6 mr-2" />
                    <span>{verificationMessage}</span>
                  </div>
                )}



            </div>
        </div>

    </>
  );
};

export default LoginForm;
