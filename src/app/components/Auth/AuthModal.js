'use client';

import React, { useState, useEffect } from 'react';
import { RxCross1 } from 'react-icons/rx';
import { useUser } from '../Auth/UserProvider';
import { useRouter } from 'next/navigation';
import cookies from 'js-cookie'


const Modal = ({ isOpen, toggleModal, isLoginMode, setIsLoginMode }) => {

  const [email, setEmail] = useState('');
  const { login } = useUser();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [remember, setRemember] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [errors, setErrors] = useState({}); // Состояние для хранения ошибок
  const router = useRouter();
  





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
    } else if (password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
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
      if (response.ok) {
        console.log('Success:', data);
        setIsVerificationModalOpen(true); // Открываем модальное окно подтверждения почты
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
    const csrfUrl = 'https://test.kimix.space/sanctum/csrf-cookie';
    const loginUrl = 'https://test.kimix.space/api/auth/login';
  
    try {
      // Получаем CSRF-токен
      await axios.get(csrfUrl, { withCredentials: true });
  
      // После получения токена выполняем вход
      const response = await axios.post(loginUrl, {
        email,
        password,
        remember
      }, {
        headers: {
          'X-CSRF-TOKEN': cookies.get('XSRF-TOKEN') // Используем токен
        },
        withCredentials: true // Обязательно
      });
  
      const data = response.data;
  
      if (data.verify) {
        console.log('Success:', data);
        login({ email: data.email, role: data.role, name: data.name, id: data.id }, data.token);
        toggleModal();
        router.push('/dashboard'); // Редирект на страницу dashboard
      } else {
        setIsVerificationModalOpen(true);
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
      await loginUser();
    } else {
      await registerUser();
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
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div id="modal" className="bg-white w-max lg:w-6/12 relative p-6 rounded shadow-md">
            <h2 className="text-xl mb-4">{isLoginMode ? "Вход" : "Регистрация"}</h2>
            <form onSubmit={handleSubmit}>
              {!isLoginMode && (
                <div>
                  <input
                    type="text"
                    placeholder="Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`border rounded w-full p-2 mb-2 ${errors.name ? 'border-red-500' : ''}`}
                    required={!isLoginMode}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
              )}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`border rounded w-full p-2 mb-2 ${errors.email ? 'border-red-500' : ''}`}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`border rounded w-full p-2 mb-2 ${errors.password ? 'border-red-500' : ''}`}
                  required
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
              {!isLoginMode && (
                <div>
                  <input
                    type="password"
                    placeholder="Подтверждение пароля"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`border rounded w-full p-2 mb-2 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    required={!isLoginMode}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </div>
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
              
              {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
              {errors.network && <p className="text-red-500 text-sm">{errors.network}</p>}

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
