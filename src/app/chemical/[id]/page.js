"use client"; // Убедитесь, что вы добавили эту строку

import { useEffect, useState } from 'react';
import ChemicalClientComponent from '@/app/components/ChemicalClientComponent';
import Header from '@/app/components/Header';
import Loader from '@/app/components/Loader'; 
const ChemicalDetail = ({ params }) => {
  const { id } = params; // Получаем id из параметров маршрута
  const [chemical, setChemical] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChemical = async () => {
      try {
        const res = await fetch(`https://test.kimix.space/api/chemicals/${id}`);

        // Проверяем, не является ли ответ ошибочным
        if (!res.ok) {
          throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
        }

        // Прочитаем ответ как JSON
        const data = await res.json();
        setChemical(data);
      } catch (error) {
        console.error('Ошибка при получении данных:', error.message);
        setError(error.message);
      }
    };

    fetchChemical();
  }, [id]);

  if (error) {
    return <div>Error: {error}</div>; // Выводим ошибку на странице
  }

  if (!chemical) {
    return <Loader/>; // Показываем загрузку, пока данные не получены
  }

  return (
    <>
    <Header /> 
    <div>
      <h2>{chemical.title}</h2>
      <p>CAS: {chemical.cas_number}</p>
      <p>Formula: {chemical.formula}</p>
      <p>Molecular Weight: {chemical.molecular_weight}</p>

      {/* Отображение клиентского компонента */}
      <ChemicalClientComponent chemical={chemical} />
    </div>
    </>
  );
};

export default ChemicalDetail;
