import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ReactSVG } from 'react-svg';
import Image from "next/image";
import NotFound from '/public/notfound.svg';

const SellerContent = ({ userId, userToken }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chemicals, setChemicals] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState({});
  const [productPrices, setProductPrices] = useState({}); // Состояние для хранения цен на товары
  const [currencyUnits, setCurrencyUnits] = useState({});
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
      setSelectedUnits((prev) => ({ ...prev, [id]: 'grams' })); // Устанавливаем по умолчанию граммы
      setProductPrices((prev) => ({ ...prev, [id]: '' })); // Инициализируем цену для нового товара
      setCurrencyUnits((prev) => ({ ...prev, [id]: 'RUB' }));
    }
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts(selectedProducts.filter(product => product.id !== id));
    const newSelectedUnits = { ...selectedUnits };
    delete newSelectedUnits[id]; // Удаляем выбранную единицу
    setSelectedUnits(newSelectedUnits);

    const newProductPrices = { ...productPrices };
    delete newProductPrices[id]; // Удаляем цену
    setProductPrices(newProductPrices);

    const newCurrencyUnits = { ...currencyUnits };
    delete newCurrencyUnits[id]; // Удаляем выбранную единицу
    setCurrencyUnits(newCurrencyUnits);


  };

  const handleRemoveProductStore = async (productId) => {
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


  const handleSubmit = async () => {
    try {
      const productIds = selectedProducts.map(product => ({
        id: product.id,
        unit_type: selectedUnits[product.id], // Получаем тип единицы
        currency: currencyUnits[product.id], // Добавляем валюту, можно изменить если хотите добавить выбор валюты для каждого товара
        price: productPrices[product.id], // Добавляем цену
      }));
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
          withXSRFToken: true,
        }
      );
      alert('Товары успешно обновлены!');
      setSelectedProducts([]);
      setSelectedUnits({});
      setProductPrices({});
      setCurrencyUnits({});
      
      const response = await axios.get(`https://test.kimix.space/api/users/${userId}/products`, {
        headers: {
          Authorization: `Bearer ${userToken}` // Включаем токен в заголовок
        }
      });
      const products = response.data;
      setUserProducts(products); // Сохраняем данные о товарах пользователя




    } catch (error) {
      console.error("Ошибка при обновлении товаров:", error);
    }
  };

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'RUB': return '₽';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'CNY': return '¥';
      default: return currency;
    }
  };


  const translateUnitType = (unitType) => {
    switch (unitType) {
      case 'grams': return 'Гр.';
      case 'kilograms': return 'Кг.';
      case 'tons': return 'Т.';
      case 'pieces': return 'Шт.';
      default: return unitType;
    }
  };
  return (
    <>
      <div className="p-4">
        <h2 className="text-lg font-bold">Добавление товаров</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Поиск товара..."
          className="border border-gray-300 p-2 rounded w-full"
        />
        {chemicals.length > 0 && (
          <ul className="mt-2 border border-gray-300 bg-white  rounded max-h-96 overflow-y-auto">
            {chemicals.map((chemical) => (
              <li
                key={chemical.id}
                className={`p-2 cursor-pointer transition hover:bg-gray-200 ${selectedProducts.some(product => product.id === chemical.id) ? 'bg-gray-300' : ''}`}
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
          <div className="mt-4 bg-white rounded-lg">
            <h3 className="font-semibold p-4">Выбранные товары:</h3>
            <ul>
              {selectedProducts.map((product) => (
                <li key={product.id} className="flex  border-gray-100 p-4 items-center justify-between">
                  <span>{product.title}</span>
                  <div className="flex items-center">
                    <select
                      value={selectedUnits[product.id]}
                      onChange={(e) => setSelectedUnits({ ...selectedUnits, [product.id]: e.target.value })}
                      className="ml-2 border border-gray-300 p-1 rounded"
                    >
                      <option value="grams">Граммы</option>
                      <option value="kilograms">Килограммы</option>
                      <option value="tons">Тонны</option>
                      <option value="pieces">Штуки</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Цена/ед."
                      value={productPrices[product.id] || ''}
                      onChange={(e) => setProductPrices({ ...productPrices, [product.id]: e.target.value })}
                      className="ml-2 border border-gray-300 p-1 rounded w-24"
                    />
                    <label htmlFor={`currency-${product.id}`} className="ml-2">Валюта:</label>
                    <select
                      id={`currency-${product.id}`}
                      onChange={(e) => setCurrencyUnits({ ...currencyUnits, [product.id]: e.target.value })}
                      className="ml-2 border border-gray-300 p-1 rounded"
                    >
                      <option value="RUB">RUB</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="CNY">CNY</option>
                    </select>
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="ml-2 text-red-500"
                    >
                      ✖️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="mt-4 bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-600"
          style={{ backgroundColor: '#14D8B5' }}
        >
          Добавить товары
        </button>
      </div>

      <div className="lg:p-4 p-2">
        <h2 className="text-lg font-bold">Ваши товары</h2>
        {userProducts.length > 0 ? (
          <ul className="mt-2  overflow-y-auto flex flex-col gap-5">
            {userProducts.map((product) => (
              <li key={product.id} className="p-2 flex lg:flex-row flex-col gap-2 bg-white rounded-xl justify-between items-center">
                <div className='flex lg:flex-row flex-col gap-2 w-full'>
                  
                  <div className="flex justify-center items-center lg:w-48 w-full h-40  border rounded">
                    {product.image ? (
                      <ReactSVG 
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(product.image)}`} 
                        className="flex items-center" // Задаем ширину и высоту
                      />
                    ) : (
                      <Image
                        src={NotFound} // Иконка по умолчанию
                        alt="No image"
                        height={150}
                        className="flex flex-col" // Чтобы иконка сохраняла пропорции
                      />
                    )}
                  </div>
                  <div className='flex flex-col gap-2'>
                    <p>Название: {product.russian_common_name} / ({product.title})</p>
                    <p>CAS Number: <strong>{product.cas_number}</strong></p>
                    <p>Формула: <strong>{product.formula}</strong></p>
                    <p>Цена: <strong> {product.pivot.price} {getCurrencySymbol(product.pivot.currency)} </strong> за Eд. {translateUnitType(product.pivot.unit_type)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveProductStore(product.id)}
                  className="bg-red-500 text-white lg:w-24 w-full px-2 py-1 rounded hover:bg-red-600"
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
