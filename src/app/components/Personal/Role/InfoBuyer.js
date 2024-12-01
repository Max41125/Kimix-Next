'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const InfoBuyer = ({ userId, userToken, userRole }) => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const csrfUrl = 'https://test.kimix.space/sanctum/csrf-cookie';
  // Получение данных адреса пользователя
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!userId || !userToken) return;

      setLoading(true);
      setError(null);
      try {
        await axios.get(csrfUrl, { withCredentials: true });
        
        const response = await axios.get(`https://test.kimix.space/api/user-address/${userId}`, {
          headers: { Authorization: `Bearer ${userToken}` },
          withCredentials: true,
          withXSRFToken:true,
        });
        const address = response.data;
        setFormData({
            buyer_fullname: address.buyer_fullname || '',
            inn: address.inn || '',
            phone: address.phone || '',
            city: address.city || '',
            street: address.street || '',
            house: address.house || '',
            building: address.building || '',
            office: address.office || '',
        });
      } catch (err) {
        setError('Заполните данные для ваших заказов');
        console.error('Fetch address error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAddress();
  }, [userId, userToken]);

  // Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Отправка данных на сервер
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        'https://test.kimix.space/api/user-address',
        { ...formData, user_id: userId },
        {
          headers: { Authorization: `Bearer ${userToken}` },
          withCredentials: true,
          withXSRFToken:true,
        }
      );

      console.log('Address saved:', response.data);
      setSuccess(true);
    } catch (err) {
      setError('Ошибка при сохранении данных');
      console.error('Save address error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h2 className="text-xl font-bold mb-4">Информация для заказов</h2>
      {error && <div className="text-red-300 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">Данные успешно сохранены</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block">Телефон:</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="city" className="block">ИНН:</label>
          <input
            type="text"
            id="inn"
            name="inn"
            value={formData.inn}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="buyer_fullname" className="block">Полное название организации:</label>
          <input
            type="text"
            id="buyer_fullname"
            name="buyer_fullname"
            value={formData.buyer_fullname}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        
        <div>
          <label htmlFor="city" className="block">Город:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="street" className="block">Улица:</label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="house" className="block">Дом:</label>
          <input
            type="text"
            id="house"
            name="house"
            value={formData.house}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="building" className="block">Корпус:</label>
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
          <label htmlFor="office" className="block">Офис:</label>
          <input
            type="text"
            id="office"
            name="office"
            value={formData.office}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          Сохранить
        </button>
      </form>
    </div>
  );
};

export default InfoBuyer;
