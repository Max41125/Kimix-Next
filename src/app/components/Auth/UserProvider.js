'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const UserContext = createContext();
import axios from 'axios';


export const UserProvider = ({ children, csrfToken }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState('');
    const router = useRouter();
    const csrfUrl = 'https://test.kimix.space/sanctum/csrf-cookie';

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            const storedUser = JSON.parse(localStorage.getItem('user')); 
            setToken(storedToken || '');
            setUser(storedUser);

        }
    }, []);



    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        const url = 'https://test.kimix.space/api/auth/logout';
        try {
          // Запрос для получения CSRF токена
          await axios.get(csrfUrl, {
            withCredentials: true,
          });
      
          // Запрос на логаут
          const response = await axios.post(url, {}, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            withCredentials: true,
            withXSRFToken:true,
          });
      
          // Проверка успешности запроса
          if (response.status >= 200 && response.status < 300) {
            setUser(null);
            setToken('');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            console.log('Logout successful');
            router.push('/');
          } else {
            console.error('Logout error:', response.data);
          }
        } catch (error) {
          console.error('Logout request error:', error);
        }
      };
      
    return (
        <UserContext.Provider value={{ user, token, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
