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
  const [productPrices, setProductPrices] = useState({});
  const [currencyUnits, setCurrencyUnits] = useState({});
  const [debounceTimeout, setDebounceTimeout] = useState(null); 
  const [hasSearched, setHasSearched] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);

  const csrfUrl = process.env.NEXT_PUBLIC_CSRF_URL;

  // Получение всех товаров пользователя при загрузке компонента
  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}/products`, {
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

  // Обработчик поиска с дебаунсом
  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout); // Очищаем предыдущий таймер, если есть
    }

    const newTimeout = setTimeout(() => {
      if (query.length >= 2) {
        searchProducts(query); // Функция поиска
        setHasSearched(true); // Отметим, что поиск был выполнен
      } else {
        setChemicals([]); // Очистка результатов, если меньше 2 символов
        setHasSearched(false); // Если очистка, сбрасываем флаг поиска
      }
    }, 500); // 500 мс задержка после последнего ввода

    setDebounceTimeout(newTimeout);
  };

  const searchProducts = async (query) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chemicals/search?q=${query}`);
      setHasSearched(true); // Устанавливаем hasSearched в true после первого запроса
      if (response.data.length === 0) {
        setChemicals([]); // Сохраняем пустой массив, если ничего не найдено
      } else {
        setChemicals(response.data); // Сохраняем данные, если найдены товары
      }
    } catch (error) {
      console.error("Ошибка при поиске товаров:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleSelectProduct = (id, title) => {
    if (!selectedProducts.some(product => product.id === id)) {
      setSelectedProducts((prev) => [...prev, { id, title, description: '' }]);
      setSelectedUnits((prev) => ({ ...prev, [id]: 'grams' })); // Устанавливаем по умолчанию граммы
      setProductPrices((prev) => ({ ...prev, [id]: '' })); // Инициализируем цену для нового товара
      setCurrencyUnits((prev) => ({ ...prev, [id]: 'RUB' }));
    }
  };
  const handleDescriptionChange = (id, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, description: value } : product
      )
    );
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
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}/products`, {
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
        unit_type: selectedUnits[product.id],
        currency: currencyUnits[product.id],
        price: productPrices[product.id],
        description: product.description,
      }));
      await axios.get(csrfUrl, { withCredentials: true });
      await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}/products`, 
        { products: productIds },
        {
          headers: { Authorization: `Bearer ${userToken}` },
          withCredentials: true,
          withXSRFToken: true,
        }
      );
      alert('Товары успешно обновлены!');
      setSelectedProducts([]);
      setSelectedUnits({});
      setProductPrices({});
      setCurrencyUnits({});
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}/products`, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      setUserProducts(response.data);
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
    <div className="p-4 bg-white rounded-lg">
        <h2 className="text-lg font-bold">Добавление товаров</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Поиск товара..."
        className="border border-gray-300 p-2 rounded w-full"
      />
      
      {isLoading ? (
      <div className="flex justify-center items-center mt-4">
        <div className="loader"></div> 
      </div>
      ) : hasSearched && ( // Показываем результат поиска только после первого запроса
        <div>
          {chemicals.length > 0 ? (
            <ul className="mt-2 border border-gray-300 bg-white rounded max-h-96 overflow-y-auto">
              {chemicals.map((chemical) => (
                <li
                  key={chemical.id}
                  className={`p-2 cursor-pointer transition hover:bg-gray-200 ${selectedProducts.some(product => product.id === chemical.id) ? 'bg-gray-300' : ''}`}
                  onClick={() => handleSelectProduct(chemical.id, chemical.title)}
                >
                  <p>Название: {chemical.russian_common_name} / {chemical.title}</p>
                  <p>CAS Number: {chemical.cas_number}</p>
                  <p>Формула: {chemical.formula}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Ничего не найдено</p>
          )}
        </div>
      )}

          


        {selectedProducts.length > 0 && (
          <div className="mt-4 bg-white rounded-lg">
            <h3 className="font-semibold py-4">Выбранные товары:</h3>
            <ul className='flex flex-col gap-4'>
              {selectedProducts.map((product) => (
                <li key={product.id} className="flex border-gray-500 border-2 rounded border-gray-100 p-4 gap-2 flex-col justify-start items-start">
                  <span>{product.title}</span>

                      <textarea
                      placeholder="Описание товара..."
                      value={product.description}
                      onChange={(e) => handleDescriptionChange(product.id, e.target.value)}
                      className=" border border-gray-300 p-1 rounded w-full"
                    ></textarea>
                  <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto">
                    <select
                      value={selectedUnits[product.id]}
                      onChange={(e) => setSelectedUnits({ ...selectedUnits, [product.id]: e.target.value })}
                      className=" border border-gray-300 p-1 rounded w-full lg:w-auto"
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
                      onChange={(e) => setProductPrices({ 
                        ...productPrices, 
                        [product.id]: e.target.value 
                      })}
                      min="0" 
                      className="border border-gray-300 p-1 rounded w-full lg:w-auto"
                    />

                    <div className='flex flex-wrap gap-2 w-full lg:w-auto'>
                      <label htmlFor={`currency-${product.id}`} className="">Валюта:</label>
                      <select
                        id={`currency-${product.id}`}
                        onChange={(e) => setCurrencyUnits({ ...currencyUnits, [product.id]: e.target.value })}
                        className="border border-gray-300 p-1 rounded w-full lg:w-48"
                      >
                        <option value="RUB">RUB</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="CNY">CNY</option>
                      </select>
                    </div>
                  </div>
                  <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="rounded text-white bg-red-500 px-3 py-1"
                    >
                      Отменить
                    </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="mt-4 bg-[#14D8B5] text-white font-bold py-2 px-4 rounded hover:bg-teal-600"
          
        >
          Добавить товары
        </button>
      </div>

      <div className="lg:py-4 py-2">
        <h2 className="text-lg font-bold">Ваши товары</h2>
        {userProducts.length > 0 ? (
          <ul className="mt-2 overflow-y-auto flex flex-col gap-5">
            {userProducts.map((product) => (
              <li key={product.id} className="p-2 flex lg:flex-row flex-col gap-2 bg-white rounded-xl justify-between ">
                <div className='flex lg:flex-row flex-col gap-2 w-full'>
                  <div className="flex justify-center items-center lg:w-48 w-full h-40  border rounded">
                    {product.image ? (
                      <ReactSVG 
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(product.image)}`} 
                        className="flex items-center" 
                      />
                    ) : (
                      <Image
                        src={NotFound}
                        alt="No image"
                        height={150}
                        className="flex flex-col"
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
                {product.pivot.description && (
                  <div className='flex flex-col w-full'>
                    <p>Описание:</p>
                    <p>{product.pivot.description}</p>
                  </div>
                )}
                <button
                  onClick={() => handleRemoveProductStore(product.id)}
                  className="bg-red-500 text-white lg:w-auto w-full px-2 py-1 rounded hover:bg-red-600"
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
