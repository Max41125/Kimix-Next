'use client'; 

import React, { useState, useEffect } from 'react';
import { RxCross1 } from 'react-icons/rx';
import { useUser } from '../Auth/UserProvider'; 

const Modal = ({ isOpen, toggleModal, isLoginMode, setIsLoginMode }) => {
  const [email, setEmail] = useState('');
  const { login } = useUser();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [remember, setRemember] = useState(false); // Состояние для чекбокса
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const handleOutsideClick = (event) => {
    const modal = document.getElementById('modal');
    if (modal && !modal.contains(event.target)) {
      toggleModal();
    }
  };

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    } else {
      window.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
  };

  // Функция для отправки данных при регистрации
  const registerUser = async () => {
    const url = 'https://test.kimix.space/api/auth/register';
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]*)/)?.[1] || ''
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
      if (response.ok) {
        console.log('Success:', data);
        // Обработка успешной регистрации
      } else {
        console.error('Error:', data);
      }
    } catch (error) {
      console.error('Request error:', error);
    }
  };

  // Функция для отправки данных при логине
  // Функция для отправки данных при логине
const loginUser = async () => {
  const url = 'https://test.kimix.space/api/auth/login';
  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-CSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]*)/)?.[1] || ''
          },
          body: JSON.stringify({
              email,
              password,
              remember // Добавлено
          })
      });

      const data = await response.json();
      if (response.ok) {
        if (!data.verified) {
          setIsVerificationModalOpen(true);
          return;
        } else {
              console.log('Success:', data);
              login({ name: data.name, email: data.email }, data.token);
              toggleModal();
          }
      } else {
          console.error('Error:', data);
      }
  } catch (error) {
      console.error('Request error:', error);
  }
};



  

  // Основная функция для отправки формы
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (isLoginMode) {
      await loginUser(); // Вызов функции логина
    } else {
      await registerUser(); // Вызов функции регистрации
    }

    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setRole(''); // Сбрасываем роль
    toggleModal();
  };

  return (
   <>
    {isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div id="modal" className="bg-white relative p-6 rounded shadow-md">
          <h2 className="text-xl mb-4">{isLoginMode ? "Вход" : "Регистрация"}</h2>
          <form onSubmit={handleSubmit}>
            {!isLoginMode && (
              <input
                type="text"
                placeholder="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border rounded w-full p-2 mb-2"
                required={!isLoginMode}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded w-full p-2 mb-2"
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
              <input
                type="password"
                placeholder="Подтверждение пароля"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border rounded w-full p-2 mb-4"
                required={!isLoginMode}
              />
            )}
            {!isLoginMode && (
              <div className="mb-4 flex space-x-2">
                <label
                  className={`flex-1 p-2 text-center border rounded ${role === 'buyer' ? 'bg-green-500 text-white' : ''}`}
                  onClick={() => handleRoleChange('buyer')}
                >
                  <input type="radio" name="role" value="buyer" checked={role === 'buyer'} onChange={() => setRole('buyer')} className="hidden" />
                  Покупатель
                </label>
                <label
                  className={`flex-1 p-2 text-center border rounded ${role === 'student' ? 'bg-blue-500 text-white' : ''}`}
                  onClick={() => handleRoleChange('student')}
                >
                  <input type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} className="hidden" />
                  Студент
                </label>
                <label
                  className={`flex-1 p-2 text-center border rounded ${role === 'seller' ? 'bg-orange-500 text-white' : ''}`}
                  onClick={() => handleRoleChange('seller')}
                >
                  <input type="radio" name="role" value="seller" checked={role === 'seller'} onChange={() => setRole('seller')} className="hidden" />
                  Продавец
                </label>
              </div>
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
              {isLoginMode ? "Вход" : "Регистрация"}
            </button>
          </form>
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="mt-4 text-teal-500 underline"
          >
            {isLoginMode ? "Нет еще аккаунта? Регистрация." : "Уже зарегистрированы? Вход."}
          </button>
          <button onClick={toggleModal} className="absolute top-2 right-2">
            <RxCross1 />
          </button>
        </div>
      </div>
    )}
    {isVerificationModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white relative p-6 rounded shadow-md">
              <h2 className="text-xl mb-4">Подтверждение почты</h2>
              <p>Пожалуйста, подтвердите ваш адрес электронной почты, чтобы войти в систему.</p>
              <button onClick={() => setIsVerificationModalOpen(false)} className="mt-4 bg-teal-500 text-white px-4 py-2 rounded">
                  Закрыть
              </button>
          </div>
      </div>
  )}
  </>
  );
};

export default Modal;
