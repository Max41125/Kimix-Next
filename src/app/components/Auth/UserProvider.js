'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState('');
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            const storedUser = JSON.parse(localStorage.getItem('user')); 
            setToken(storedToken || '');
            setUser(storedUser);

            // Check for CSRF token cookie and get it if not present
            const existingCsrfToken = getCookie('XSRF-TOKEN');
            if (!existingCsrfToken) {
                fetchCsrfToken();
            } else {
                setCsrfToken(existingCsrfToken);
            }
        }
    }, []);

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const fetchCsrfToken = async () => {
        try {
            const response = await fetch('https://test.kimix.space/sanctum/csrf-cookie', {
                credentials: 'include' // Include cookies in the request
            });

            if (!response.ok) {
                console.error('Error fetching CSRF token:', response.statusText);
            } else {
                const token = getCookie('XSRF-TOKEN');
                setCsrfToken(token);
                console.log('CSRF token fetched and set:', token);
            }
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
        }
    };

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
        <UserContext.Provider value={{ user, token, login, logout, csrfToken }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
