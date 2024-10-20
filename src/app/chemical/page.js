"use client"; 

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; 
import Header from '@/app/components/Module/Header';
import Loader from '@/app/components/Loaders/Loader';
import { UserProvider } from '@/app/components/Auth/UserProvider';
import Image from 'next/image';
import { ReactSVG } from 'react-svg';
import NotFound from '/public/notfound.svg';
import axios from 'axios';

const ChemicalDetail = () => {
  const searchParams = useSearchParams(); 
  const id = searchParams.get('id'); 
  const csrfUrl = 'https://test.kimix.space/sanctum/csrf-cookie';
  const [chemical, setChemical] = useState(null);
  const [suppliers, setSuppliers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChemical = async () => {
      if (!id) return; 

      try {
        // Получаем CSRF токен
        await axios.get(csrfUrl, { withCredentials: true });

        // Запрос данных химического вещества
        const res = await axios.get(`https://test.kimix.space/api/chemicals/${id}`, { withCredentials: true });
        const supplier = await axios.get(`https://test.kimix.space/api/auth/chemicals/${id}/suppliers`, { withCredentials: true });

        setChemical(res.data);
        setSuppliers(supplier.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChemical();
  }, [id]); 

  if (loading) return <Loader />;
  if (error) return <div>Ошибка: {error}</div>;
  if (!chemical) return <div>Нет данных для отображения.</div>;

  return (
    <>
      <UserProvider>
        <Header />
      </UserProvider>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-center items-center">
            {chemical.image ? (
              <ReactSVG 
                src={`data:image/svg+xml;utf8,${encodeURIComponent(chemical.image)}`} 
                className="min-h-96 w-full h-full"
                beforeInjection={(svg) => {
                  svg.classList.add('product__image');
                }}
              />
            ) : (
              <Image
                src={NotFound} // Иконка по умолчанию
                alt="No image"
                className="flex flex-col" // Чтобы иконка сохраняла пропорции
              />
            )}
          </div>

          {/* Правая колонка: информация о товаре */}
          <div className="flex flex-col space-y-4">
            {chemical.title && (<h1 className="text-3xl font-bold">{chemical.title}</h1>)}
            {chemical.cas_number && (<p><strong>CAS:</strong> {chemical.cas_number}</p>)}
            {chemical.formula && (<p><strong>Формула:</strong> {chemical.formula}</p>)}
            {chemical.molecular_weight && (<p><strong>Молекулярный вес:</strong> {chemical.molecular_weight} g/mol</p>)}      

            {suppliers.length > 0 &&(
              <div>
              <h2 className="text-xl font-semibold">Поставщики:</h2>
              {suppliers?.map((supplier) => (
                <div key={supplier.id} className="p-4 mt-2 bg-gray-100 rounded-lg shadow-md">
                  {supplier.name && (<p><strong>Поставщик:</strong> {supplier.name}</p>)}
                
                  {supplier.price && (<p><strong>Цена:</strong> {supplier.price} {supplier.currency}</p>)}
              

                </div>
              ))}
              </div>
            )}

          </div>
        </div>

        {/* Блок описания на всю ширину */}
        {chemical.russian_description && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Описание</h2>
            <p>{chemical.russian_description}</p>
          </div>
        )}
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
