"use client"; // Поскольку мы работаем с роутингом на клиенте

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Используем useSearchParams для работы с query-параметрами
import Header from '@/app/components/Module/Header';
import Loader from '@/app/components/Loader';

const ChemicalDetail = () => {
  const searchParams = useSearchParams(); // Получаем доступ к параметрам запроса
  const id = searchParams.get('id'); // Получаем `id` из параметров запроса
  
  const [chemical, setChemical] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChemical = async () => {
      if (!id) return; // Ждем пока `id` будет доступен

      try {
        const res = await fetch(`https://test.kimix.space/api/chemicals/${id}`);
        if (!res.ok) {
          throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setChemical(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChemical();
  }, [id]); // Вызываем каждый раз, когда `id` меняется

  if (loading) return <Loader />;
  if (error) return <div>Ошибка: {error}</div>;
  if (!chemical) return <div>Нет данных для отображения.</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto">
        <h2>{chemical.title}</h2>
        <p>CAS: {chemical.cas_number}</p>
        <p>Formula: {chemical.formula}</p>
        <p>Molecular Weight: {chemical.molecular_weight}</p>
      </div>
    </>
  );
};

export default function ChemicalPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ChemicalDetail />
    </Suspense>
  );
}
