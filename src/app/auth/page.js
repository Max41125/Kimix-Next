'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Module/Header';
import { UserProvider } from '@/app/components/Auth/UserProvider';
import { CiCircleCheck } from "react-icons/ci"; 
import { CiCircleRemove } from "react-icons/ci";
import { useRouter } from 'next/navigation';
import Link from "next/link";

const AuthPage = () => {
  const router = useRouter(); // Инициализация useRouter
  const [csrfToken, setCsrfToken] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [remember, setRemember] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // Успешная регистрация
  const [errors, setErrors] = useState(null); // Ошибки сервера
  const [verificationMessage, setVerificationMessage] = useState(null); // Сообщение о подтверждении

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
  };


  const fetchCsrfToken = async () => {
    try {
      const response = await fetch('/api/csrf-token', { // Измените URL на путь к вашему API
        method: 'GET',
        credentials: 'include',
      });
  
      if (response.ok) {
        const data = await response.json(); // Получаем JSON из ответа
        const token = data.cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
        if (token) {
          const tokenValue = token.split(';')[0].split('=')[1]; // Извлекаем только значение токена
          setCsrfToken(decodeURIComponent(tokenValue));
        }
      } else {
        console.error('Failed to fetch CSRF token:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  useEffect(() => {

      fetchCsrfToken();

    }, []);



  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoginMode) {
      await loginUser(); // Логика логина
    } else {
      // Проверка совпадения паролей
      if (password !== confirmPassword) {
        setErrors({ message: "Пароли не совпадают." });
        return;
      }
      await registerUser(); // Логика регистрации
    }
  };

  const registerUser = async () => {
    const url = 'https://test.kimix.space/api/auth/register';
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken || ''
        },
        body: JSON.stringify({
          email,
          name,
          password,
          password_confirmation: confirmPassword,
          role
        })
      });
  
      const data = await response.json();
      if (response.status === 201) { // Проверяем код ответа
        console.log('Success:', data);
        setIsRegistered(true); // Устанавливаем состояние успешной регистрации
        setErrors(null); // Сброс ошибок
      } else {
        console.error('Error:', data);
        // Обработка ошибок, если они существуют
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat(); // Извлечение ошибок из объекта
          setErrors({ message: errorMessages });
        } else {
          setErrors({ message: data.message }); // Устанавливаем общее сообщение об ошибке
        }
      }
    } catch (error) {
      console.error('Request error:', error);
      setErrors({ message: "Произошла ошибка при отправке запроса." });
    }
  };

  const loginUser = async () => {
    const url = 'https://test.kimix.space/api/auth/login';
    try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-CSRF-TOKEN': csrfToken || ''
          },
          body: JSON.stringify({
              email,
              password,
              remember // Добавлено
          })
      });

      const data = await response.json();
      if (response.ok) {
        if (!data.verify) {
          setVerificationMessage("Пожалуйста, подтвердите вашу почту."); // Устанавливаем сообщение о подтверждении
          setErrors(null); // Сброс ошибок
        } else {
          console.log('Success:', data);

          login({ email: data.email, role: data.role, name: data.name, id:data.id }, data.token);
          // И выполнить редирект
          router.push('/dashboard'); // Перенаправляем на дашборд
        }
      } else {
          console.error('Error:', data);
          setErrors(data.errors || { message: data.message }); // Устанавливаем ошибки сервера
      }
    } catch (error) {
      console.error('Request error:', error);
      setErrors({ message: "Произошла ошибка при отправке запроса." });
    }
  };

  return (
    <>
      <UserProvider>
          <Header />
      </UserProvider>

      <div className="flex justify-center h-screen container mx-auto p-4 items-center">
          <div className="bg-white shadow-2xl p-10 rounded-lg">

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

              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                  {!isLoginMode && (
                    <input
                        type="text"
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border rounded w-full p-2 mb-4"
                        required={!isLoginMode}
                    />
                  )}
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded w-full p-2 mb-4"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded w-full p-2 mb-4"
                    required
                  />
                  {!isLoginMode && (
                    <>
                      <input
                        type="password"
                        placeholder="Подтверждение пароля"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border rounded w-full p-2 mb-4"
                        required={!isLoginMode}
                      />
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

              {/* Отображение ошибок */}
              {errors && (
                <div className="mt-4 flex items-center text-red-600">
                  <CiCircleRemove className="w-6 h-6 mr-2" />
                  <span>{errors.message || "Ошибка!"}</span>
                </div>
              )}

          </div>
      </div>
    </>
  );
};

export default AuthPage;
