'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import userStore from '@/app/components/Auth/userStore'; // Импортируем MobX-хранилище
import axios from 'axios';
import Loader from '@/app/components/Loaders/Loader';
import parseCookies from '@/app/lib/parseCookies';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [loading, setLoading] = useState(true); // Состояние загрузки данных пользователя
    const router = useRouter();
    const csrfUrl = process.env.NEXT_PUBLIC_CSRF_URL;
    const pathname = usePathname()

    useEffect(() => {
      if (typeof window !== 'undefined') {
        
          const storedToken = localStorage.getItem('token');
          const cookies = parseCookies();  
          const rememberToken = cookies['remember_token'];
          //if (rememberToken && storedToken)
          // Проверка, если токен найден в localStorage
          if (storedToken) {
              userStore.setToken(storedToken); // Устанавливаем токен в MobX

              // Отправка CSRF запроса
              axios.get(csrfUrl, { withCredentials: true }).then(() => {
                  // После того как получили CSRF токен, проверяем есть ли данные пользователя в MobX
                  if (!userStore.user) {
                      axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user`, {
                          headers: { Authorization: `Bearer ${storedToken}` },
                          withCredentials: true,
                          withXSRFToken: true,
                      }).then(response => {
                          userStore.setUser(response.data); // Устанавливаем данные пользователя в MobX
                          setLoading(false); // Данные загружены, изменяем состояние
                      }).catch(error => {
                          console.error('Error fetching user data:', error);
                          setLoading(false); // Ошибка загрузки, изменяем состояние
                      });
                  } else {
                      setLoading(false); // Если данные пользователя уже в MobX, сразу меняем состояние
                  }
              }).catch(error => {
                  console.error('Error fetching CSRF token:', error);
                  setLoading(false); // Ошибка получения CSRF токена, меняем состояние
              });
          }

          
          else {

            if (pathname.includes('/dashboard')) {
                router.push('/auth');
            }
            
                setLoading(false); // Если токен отсутствует, сразу меняем состояние
          }
      }
  }, []);

    // Логин: сохраняем данные пользователя и токен в MobX
    const login = (userData, authToken) => {
        userStore.setUser(userData);
        userStore.setToken(authToken);
        localStorage.setItem('token', authToken);
       
    };

    // Логаут: очищаем состояние в MobX и удаляем токен из localStorage
    const logout = async () => {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`;
        try {
            await axios.get(csrfUrl, { withCredentials: true });
            const response = await axios.post(
                url,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${userStore.token}`,
                    },
                    withCredentials: true,
                    withXSRFToken:true,
                }
            );

            if (response.status >= 200 && response.status < 300) {
                userStore.logout();
                localStorage.removeItem('token');  // Удаляем токен из localStorage
                console.log('Logout successful');
                router.push('/auth');
            } else {
                console.error('Logout error:', response.data);
            }
        } catch (error) {
            console.error('Logout request error:', error);
        }
    };

    if (loading) {
        return <Loader />; // Можно показать спиннер или загрузочный экран
    }

    return (
        <UserContext.Provider value={{ user: userStore.user, token: userStore.token, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

// Хук для доступа к контексту пользователя
export const useUser = () => useContext(UserContext);
