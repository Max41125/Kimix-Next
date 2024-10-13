import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ReactSVG } from 'react-svg';
import Image from "next/image";
import Logo from '/public/logo.svg';


const SellerContent = ({ userId, userToken }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chemicals, setChemicals] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const csrfUrl = 'https://test.kimix.space/sanctum/csrf-cookie';
  // Получение всех товаров пользователя при загрузке компонента
  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const response = await axios.get(`https://test.kimix.space/api/users/${userId}/products`, {
          headers: {
            Authorization: `Bearer ${userToken}` // Включаем токен в заголовок
          }
        });
        const products = response.data;
        setUserProducts(products); // Сохраняем данные о товарах пользователя
      } catch (error) {
        console.error("Ошибка при получении товаров пользователя:", error);
      }
    };

    fetchUserProducts();
  }, [userId, userToken]);

  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    if (query.length >= 2) {
      try {
        const response = await axios.get(`https://test.kimix.space/api/chemicals/search?q=${query}`);
        setChemicals(response.data);
      } catch (error) {
        console.error("Ошибка при поиске товаров:", error);
      }
    } else {
      setChemicals([]); // Очистка результатов, если меньше 2 символов
    }
  };

  const handleSelectProduct = (id, title) => {
    if (!selectedProducts.some(product => product.id === id)) {
      setSelectedProducts((prev) => [...prev, { id, title }]);
    }
  };

  const handleSubmit = async () => {
    try {


      const productIds = selectedProducts.map(product => product.id);
      await axios.get(csrfUrl, {
        withCredentials: true,

    });
      await axios.put(`https://test.kimix.space/api/users/${userId}/products`, 
        { products: productIds },
        {
          headers: {
            Authorization: `Bearer ${userToken}` 
          },
          withCredentials: true,
          withXSRFToken:true,
        }
      );
      alert('Товары успешно обновлены!');
      setSelectedProducts([]);
    } catch (error) {
      console.error("Ошибка при обновлении товаров:", error);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await axios.get(csrfUrl, {
        withCredentials: true,

    });
      await axios.delete(`https://test.kimix.space/api/users/${userId}/products`, {
        data: { products: [productId] },
        headers: {
          Authorization: `Bearer ${userToken}`
        },
        withCredentials: true,
        withXSRFToken:true,
      });
      setUserProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
    } catch (error) {
      console.error("Ошибка при удалении товара:", error);
    }
  };

  return (
    <>
      <div className="p-4">
        <h2 className="text-lg font-bold">Контент для покупателя</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Поиск товара..."
          className="border border-gray-300 p-2 rounded w-full"
        />
        {chemicals.length > 0 && (
          <ul className="mt-2 border border-gray-300 rounded max-h-40 overflow-y-auto">
            {chemicals.map((chemical) => (
              <li
                key={chemical.id}
                className={`p-2 cursor-pointer hover:bg-gray-200 ${selectedProducts.some(product => product.id === chemical.id) ? 'bg-gray-300' : ''}`}
                onClick={() => handleSelectProduct(chemical.id, chemical.title)}
              >
                <p>Название: {chemical.title}</p>
                <p>CAS Number: {chemical.cas_number}</p>
                <p>Формула: {chemical.formula}</p>
              </li>
            ))}
          </ul>
        )}
        {selectedProducts.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Выбранные товары:</h3>
            <ul>
              {selectedProducts.map((product) => (
                <li key={product.id}>{product.title}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="mt-4 bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-600"
          style={{ backgroundColor: '#14D8B5' }}
        >
          Отправить
        </button>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-bold">Ваши товары</h2>
        {userProducts.length > 0 ? (
          <ul className="mt-2 border border-gray-300 rounded overflow-y-auto flex flex-col gap-5">
            {userProducts.map((product) => (
              <li key={product.id} className="p-2 flex justify-between items-center">
                <div>
                  <p>Название: {product.title}</p>
                  <div className="flex justify-center items-center w-full h-40 mb-4 border rounded">
                  {product.image ? (
                    <ReactSVG 
                      src={`data:image/svg+xml;utf8,${encodeURIComponent(product.image)}`} 
                      className=" object-contain" // Задаем ширину и высоту
                    />
                  ) : (
                    <Image
                      src={Logo} // Иконка по умолчанию
                      alt="No image"
                       // Используйте fill, чтобы занять всю доступную область
                      className="object-contain" // Чтобы иконка сохраняла пропорции
                    />
                  )}
                </div>


                  <p>CAS Number: {product.cas_number}</p>
                  <p>Формула: {product.formula}</p>
                </div>
                <button
                  onClick={() => handleRemoveProduct(product.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>У вас пока нет товаров.</p>
        )}
      </div>
    </>
  );
};

export default SellerContent;
