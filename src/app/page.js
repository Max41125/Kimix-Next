"use client";
import { useState, useEffect } from "react";
import Header from "./components/Module/Header"; // импортируем Header
import { UserProvider } from './components/Auth/UserProvider';
import Cookie from "js-cookie";
import { parseCookies } from "./lib/parseCookies";

const getCsrfToken = async () => {
  try {
    const response = await fetch('https://test.kimix.space/sanctum/csrf-cookie', {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Ошибка получения CSRF токена: ' + response.statusText);
    }

    console.log('CSRF токен успешно получен');
    console.log('Токен из cookies:', Cookie.get('XSRF-TOKEN'));
    return Cookie.get('XSRF-TOKEN'); // получаем токен из cookies
  } catch (error) {
    console.error('Ошибка получения CSRF токена:', error);
  }
};

const Home = ({ initialTokenValue = '' }) => {
  const [CSRFtoken, setCSRFtoken] = useState(initialTokenValue);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getCsrfToken();
      if (token) {
        setCSRFtoken(token);
        

        Cookie.set("XSRF-TOKEN", token); // Устанавливаем токен в куки
        
      }
    };

    fetchToken();
  }, []);

  return (
    <main>
      <UserProvider csrfToken={CSRFtoken}>
        <Header />
      </UserProvider>
    </main>
  );
};

Home.getInitialProps = ({ req }) => {
  const cookies = parseCookies(req);
  return {
    initialTokenValue: cookies['XSRF-TOKEN'] || null // Получаем токен из cookies
  };
};

export default Home;
