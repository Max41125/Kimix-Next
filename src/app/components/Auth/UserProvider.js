'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children, csrfToken }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState('');


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
        try {
            const response = await fetch('https://test.kimix.space/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setUser(null);
                setToken('');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                console.log('Logout successful');
            } else {
                const data = await response.json();
                console.error('Logout error:', data);
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
