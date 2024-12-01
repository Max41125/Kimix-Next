'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContractShipping = ({ userToken, orderId, currentStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Возможные статусы с фильтрацией
  const statuses = [
    { value: 'shipping', label: 'Отгрузка' },
    { value: 'shipped', label: 'Отгружено' },
  ].filter((status) => {
    if (currentStatus === 'shipped') return false; // Убираем все, если статус "Отгружено"
    if (currentStatus === 'shipping' && status.value === 'shipping') return false; // Убираем "Отгрузка", если она уже выбрана
    return true; // Остальное оставляем
  });

  const handleChangeStatus = async () => {
    if (!selectedStatus) {
      alert('Пожалуйста, выберите статус.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.patch(
        `https://test.kimix.space/api/orders/${orderId}/status`,
        { status: selectedStatus },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
          withXSRFToken: true,
        }
      );

      if (response.status === 200) {
        alert(`Статус успешно изменен на "${statuses.find(s => s.value === selectedStatus)?.label}"`);
      } else {
        alert('Ошибка при изменении статуса заказа');
      }
    } catch (err) {
      console.error('Ошибка при изменении статуса:', err);
      setError('Произошла ошибка при изменении статуса.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg">
  
     {error && <div className="text-red-500 mb-2">{error}</div>}
      {statuses.length > 0 ? (
        <>
        <h1 className="mb-4">Изменение статуса заказа</h1>
        
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded-md mb-4 w-full"
          >
            <option value="" disabled>Выберите статус</option>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleChangeStatus}
            disabled={loading}
            className={`p-2 rounded-md text-white transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Сохранение...' : 'Подтвердить статус'}
          </button>
        </>
      ) : (
        <div className="text-green-600">Поздравляем! Заказ завершен!</div>
      )}
    </div>
  );
};

export default ContractShipping;
