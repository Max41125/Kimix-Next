'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';


const InfoSeller = ({ userId, userToken, userRole }) => {
    const [type, setType] = useState('ИП'); // По умолчанию выбран "ИП"
    const [formData, setFormData] = useState({
      full_name: '',
      short_name: '',
      legal_address: '',
      actual_address: '',
      email: '',
      phone: '',
      inn: '',
      ogrn: '',
      bank_name: '',
      bik: '',
      corr_account: '',
      settlement_account: '',
      okved: '',
      tax_system: '',
      kpp: '',
      ogrn: '',
      director: '',
      chief_accountant: '',
      authorized_person: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  // URL API для работы с данными продавца
  const csrfUrl = process.env.NEXT_PUBLIC_CSRF_URL;
  const sellerApiUrl = `https://test.kimix.space/api/seller`; // Обновить URL

  // Запросы выполняются только если userRole === "seller"
  useEffect(() => {
    if (userRole !== 'seller') return; // Не выполняем запросы, если роль не "seller"
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Запрос на получение CSRF токена
        await axios.get(csrfUrl, { withCredentials: true });

        // Получение данных продавца
        const response = await axios.get(`${sellerApiUrl}/${userId}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          withCredentials: true,
          withXSRFToken:true,
        });

        const data = response.data;
        if (data) {
          setType(data.type || 'ИП');
          setFormData((prevData) => ({
            ...prevData,
            ...data,
          }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userToken, userRole]); // Добавлен userRole в зависимость


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(sellerApiUrl, {
        ...formData,
        type,
        user_id: userId, // Добавляем user_id
      }, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        withCredentials: true,
        withXSRFToken:true,
      });

      alert('Данные успешно сохранены.');
      console.log('Результат:', response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (

    
    <div className="mt-4 lg:p-4 p-2 border rounded-lg bg-white">
    <h2 className="text-lg font-bold">Карта партнера</h2>
    {loading ? (
      <p>Загрузка данных...</p>
    ) : (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-500">{error}</p>}

     
        <label>
          <span className="font-medium">Тип:</span>
          <select
            className="border rounded p-2 w-full mt-1"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="ИП">ИП</option>
            <option value="ООО">ООО</option>
          </select>
        </label>

      
        <label>
          <span className="font-medium">Полное наименование:</span>
          <input
            type="text"
            name="full_name"
            className="border rounded p-2 w-full mt-1"
            value={formData.full_name}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <span className="font-medium">Краткое наименование:</span>
          <input
            type="text"
            name="short_name"
            className="border rounded p-2 w-full mt-1"
            value={formData.short_name}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <span className="font-medium">Адрес регистрации:</span>
          <input
            type="text"
            name="legal_address"
            className="border rounded p-2 w-full mt-1"
            value={formData.legal_address}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <span className="font-medium">Фактический адрес:</span>
          <input
            type="text"
            name="actual_address"
            className="border rounded p-2 w-full mt-1"
            value={formData.actual_address}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <span className="font-medium">Адрес электронной почты:</span>
          <input
            type="email"
            name="email"
            className="border rounded p-2 w-full mt-1"
            value={formData.email}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <span className="font-medium">Контактный телефон:</span>
          <input
            type="text"
            name="phone"
            className="border rounded p-2 w-full mt-1"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </label>

      
        {type === 'ИП' && (
          <>
            <label>
              <span className="font-medium">ИНН:</span>
              <input
                type="text"
                name="inn"
                className="border rounded p-2 w-full mt-1"
                value={formData.inn}
                onChange={handleInputChange}
              />
            </label>
            <label>
              <span className="font-medium">ОГРНИП:</span>
              <input
                type="text"
                name="ogrn"
                className="border rounded p-2 w-full mt-1"
                value={formData.ogrn}
                onChange={handleInputChange}
              />
            </label>
          </>
        )}

        {type === 'ООО' && (
          <>
            <label>
              <span className="font-medium">ИНН / КПП:</span>
              <input
                type="text"
                name="inn"
                className="border rounded p-2 w-full mt-1"
                value={formData.inn}
                onChange={handleInputChange}
              />
            </label>
            <label>
              <span className="font-medium">ОГРН:</span>
              <input
                type="text"
                name="ogrn"
                className="border rounded p-2 w-full mt-1"
                value={formData.ogrn}
                onChange={handleInputChange}
              />
            </label>
            <label>
              <span className="font-medium">Руководитель (должность, ФИО):</span>
              <input
                type="text"
                name="director"
                className="border rounded p-2 w-full mt-1"
                value={formData.director}
                onChange={handleInputChange}
              />
            </label>

            <label>
              <span className="font-medium">Главный бухгалтер:</span>
              <input
                type="text"
                name="chief_accountant"
                className="border rounded p-2 w-full mt-1"
                value={formData.chief_accountant}
                onChange={handleInputChange}
              />
            </label>

            <label>
              <span className="font-medium">Лицо, уполномоченное подписывать договоры по доверенности:</span>
              <input
                type="text"
                name="authorized_person"
                className="border rounded p-2 w-full mt-1"
                value={formData.authorized_person}
                onChange={handleInputChange}
              />
            </label>
          </>
        )}

    
        <label>
          <span className="font-medium">Наименование банка:</span>
          <input
            type="text"
            name="bank_name"
            className="border rounded p-2 w-full mt-1"
            value={formData.bank_name}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <span className="font-medium">БИК:</span>
          <input
            type="text"
            name="bik"
            className="border rounded p-2 w-full mt-1"
            value={formData.bik}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <span className="font-medium">Корреспондентский счет:</span>
          <input
            type="text"
            name="corr_account"
            className="border rounded p-2 w-full mt-1"
            value={formData.corr_account}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <span className="font-medium">Расчетный счет:</span>
          <input
            type="text"
            name="settlement_account"
            className="border rounded p-2 w-full mt-1"
            value={formData.settlement_account}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <span className="font-medium">ОКВЭД:</span>
          <input
            type="text"
            name="okved"
            className="border rounded p-2 w-full mt-1"
            value={formData.okved}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <span className="font-medium">Система налогообложения:</span>
          <input
            type="text"
            name="tax_system"
            className="border rounded p-2 w-full mt-1"
            value={formData.tax_system}
            onChange={handleInputChange}
          />
        </label>

      
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Сохранение...' : 'Отправить'}
        </button>
      </form>
    )}
    </div>
  )

};

export default InfoSeller;
