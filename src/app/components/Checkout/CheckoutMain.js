'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/app/components/Cart/CartProvider';
import { useUser } from '@/app/components/Auth/UserProvider';
import { ReactSVG } from 'react-svg';
import Loader from '@/app/components/Loaders/Circle';
import axios from 'axios';
import Image from 'next/image';
import NotFound from '/public/notfound.svg';
import { useRouter } from 'next/navigation';
const CheckoutMain = () => {
  const csrfUrl = process.env.NEXT_PUBLIC_CSRF_URL;
  const router = useRouter();
  const { cart, clearCart } = useCart() || {};
  const { user, token } = useUser() || {};
  const [isClient, setIsClient] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    buyer_fullname: '',
    phone: '',
    inn: '',
    city: '',
    street: '',
    house: '',
    building: '',
    office: '',
  });

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const BuyerApiUrl = `https://test.kimix.space/api/user-address`; // Обновить URL
  useEffect(() => {
    if (cart.length > 0) {
      const uniqueSuppliers = [...new Set(cart.map(item => item.supplier))];
      setSuppliers(uniqueSuppliers);
      setSelectedSupplier(uniqueSuppliers[0] || '');
      setIsClient(true);
    }


      if (user) {
        setFormData((prevData) => ({
          ...prevData,
          name: user.name || '',
          email: user.email || '',
        }));
     
      // Получение адреса пользователя
      const fetchUserAddress = async () => {
        try {
          const response = await axios.get(`${BuyerApiUrl}/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
            withXSRFToken:true,
          });
          const address = response.data;

          setFormData((prevData) => ({
            ...prevData,
            buyer_fullname: address.buyer_fullname || '',
            inn: address.inn || '',
            phone: address.phone || '',
            city: address.city || '',
            street: address.street || '',
            house: address.house || '',
            building: address.building || '',
            office: address.office || '',
          }));
        } catch (error) {
          console.error('Error fetching user address:', error);
        }
      };

      fetchUserAddress();
    }
  }, [cart, user, token]);

  if (!isClient) {
    return <Loader />;
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const supplierItems = cart.filter(item => item.supplier === selectedSupplier);

    const orderData = {
      user_id: user.id,  // ID пользователя
      products: supplierItems.map(item => ({
        id: item.id,
        supplier_id: item.supplier_id,
        quantity: item.quantity,
        unit_type: item.unit_type,
        price: item.price,
        currency: item.currency,
      })),
      total_price: supplierItems.reduce((total, item) => total + item.price * item.quantity, 0),
      currency: supplierItems.length > 0 ? supplierItems[0].currency : '',
      ...formData,  // Данные пользователя
    };

    try {
      await axios.get(csrfUrl, { withCredentials: true });
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        withXSRFToken:true,
      });

      

      console.log('Order submitted:', response.data);
      router.push('/dashboard');
      clearCart();  // Очищаем корзину после успешного заказа
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  if (cart.length === 0) {
    return <div className="container mx-auto p-4">Ваша корзина пуста.</div>;
  }

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

  const calculateTotalPrice = () => {
    const supplierItems = cart.filter(item => item.supplier === selectedSupplier);
    
    if (supplierItems.length === 0) return 0;
  
    const totalPrice = supplierItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  
    // Предполагаем, что все товары одного поставщика имеют одну и ту же валюту
    const supplierCurrency = supplierItems[0].currency;
  
    return {
      totalPrice,
      currency: supplierCurrency,
    };
  };
  
  const { totalPrice, currency } = calculateTotalPrice();
  return (
    <>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Оформление заказа</h2>
        <div className="flex lg:flex-row flex-col justify-between gap-8">
        <form onSubmit={handleSubmit} className="border-2 border-gray-300 rounded-lg p-10 w-full lg:w-2/4">
            <div>
            <label htmlFor="name" className="block">Имя <span className="text-red-500">*</span></label>
            <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="border rounded px-2 py-1 w-full"
            />
            </div>
            <div>
            <label htmlFor="email" className="block">Email <span className="text-red-500">*</span></label>
            <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border rounded px-2 py-1 w-full"
            />
            </div>
            <div>
            <label htmlFor="phone" className="block">Телефон <span className="text-red-500">*</span></label>
            <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="border rounded px-2 py-1 w-full"
            />
            </div>
            <div>
            <label htmlFor="inn" className="block">ИНН </label>
            <input
                type="text"
                id="inn"
                name="inn"
                value={formData.inn}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
            />
            </div>

            <div>
            <label htmlFor="buyer_fullname" className="block">Полное наименование организации</label>
            <input
                type="text"
                id="buyer_fullname"
                name="buyer_fullname"
                value={formData.buyer_fullname}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
            />
            </div>


            <div>
            <label htmlFor="city" className="block">Город доставки <span className="text-red-500">*</span></label>
            <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="border rounded px-2 py-1 w-full"
            />
            </div>
            <div>
            <label htmlFor="street" className="block">Улица <span className="text-red-500">*</span></label>
            <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
                className="border rounded px-2 py-1 w-full"
            />
            </div>
            <div>
            <label htmlFor="house" className="block">Дом <span className="text-red-500">*</span></label>
            <input
                type="text"
                id="house"
                name="house"
                value={formData.house}
                onChange={handleChange}
                required
                className="border rounded px-2 py-1 w-full"
            />
            </div>
            <div>
            <label htmlFor="building" className="block">Корпус </label>
            <input
                type="text"
                id="building"
                name="building"
                value={formData.building}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
            />
            </div>
            <div>
            <label htmlFor="office" className="block">Офис </label>
            <input
                type="text"
                id="office"
                name="office"
                value={formData.office}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
            />
            </div>
            <button type="submit" className="mt-4 p-4 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors duration-300">Подтвердить заказ</button>
        </form>

          <div className="border-2 border-gray-300 rounded-lg flex flex-col p-10 w-full lg:w-2/4">
            <h3 className="text-xl font-semibold">Информация о товарах:</h3>

          
            <label htmlFor="supplier" className="block mt-4">Выберите поставщика:</label>
            <select
              id="supplier"
              name="supplier"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="border rounded px-2 py-1 w-full mb-4"
            >
              {suppliers.map((supplier, index) => (
                <option key={index} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>

            <ul className="mt-2 flex flex-col gap-4 mb-2">
              {cart
                .filter(item => item.supplier === selectedSupplier)
                .map((item, index) => {
                  const itemTotal = item.price * item.quantity;
                  return (
                    <li key={index} className="flex flex-wrap lg:gap-8 lg:border-none lg:p-0 gap-2 p-2  border-2 rounded border-gray-300 ">
                  
                      {item.image ? (
                        <ReactSVG
                          src={`data:image/svg+xml;utf8,${encodeURIComponent(item.image)}`}
                          className="border-2 border-gray-300 w-20 h-20 flex rounded-lg"
                          beforeInjection={(svg) => {
                            svg.classList.add('checkout__product__image');
                        }}
                        />
                      ) : (
                        <Image src={NotFound} alt="No image" className="flex flex-col w-20 h-20" />
                      )}
                      <div className="flex flex-col lg:border-r-2 border-gray-300 pr-4">
                        <span>{item.title}</span>
                        <p><strong>Количество:</strong> {item.quantity}</p>
                        <p><strong>Ед. измерения:</strong> {translateUnitType(item.unit_type)}</p>
                        <p><strong>Цена за единицу:</strong> {item.price} {getCurrencySymbol(item.currency)}</p>
                      </div>
                      <div className='lg:ml-auto flex flex-col'>
                        <p><strong>Цена:</strong> {itemTotal} {getCurrencySymbol(item.currency)}</p>
                      </div>
                    </li>
                  );
                })}
            </ul>

         
            <div className="mt-auto flex flex-col">
              <h3 className="text-lg font-bold">Итоговая сумма по корзине:</h3>
              <p>{totalPrice} {getCurrencySymbol(currency)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutMain;
