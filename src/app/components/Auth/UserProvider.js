'use client'; 
import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState('');

    useEffect(() => {

            const getCsrfToken = async () => {
              try {
                await fetch('https://test.kimix.space/sanctum/csrf-cookie');
              } catch (error) {
                console.error('Ошибка получения CSRF токена:', error);
              }
            };
          
            getCsrfToken();
 


        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            const storedUser = JSON.parse(localStorage.getItem('user')); // Предполагаем, что вы также сохраняете пользователя
            setToken(storedToken || '');
            setUser(storedUser); // Устанавливаем пользователя из localStorage
        }
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken); // Сохраняем токен в localStorage
        localStorage.setItem('user', JSON.stringify(userData)); // Сохраняем пользователя в localStorage
    };

    const logout = async () => {
        try {
            const response = await fetch('https://test.kimix.space/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}` // Передача токена для авторизации
                }
            });
    
            if (response.ok) {
                // Если сервер успешно обработал выход
                setUser(null);
                setToken('');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                console.log('Выход выполнен успешно');
            } else {
                const data = await response.json();
                console.error('Ошибка при выходе:', data);
            }
        } catch (error) {
            console.error('Ошибка запроса при выходе:', error);
        }
    };
    

    return (
        <UserContext.Provider value={{ user, token, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
