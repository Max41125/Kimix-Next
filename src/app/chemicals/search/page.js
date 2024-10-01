// app/chemicals/search/page.js
"use client"; // Убедитесь, что это добавлено

import React, { useEffect, useState } from 'react';
import ChemicalList from '@/app/components/ChemicalList';
import Header from '@/app/components/Header';
import Loader from '@/app/components/Loader'; 


const SearchPage = ({ searchParams }) => {
  const { query } = searchParams; // Извлекаем запрос из параметров
  const [chemicalList, setChemicalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChemicals = async () => {
      if (!query) return;

      try {
        const res = await fetch(`https://test.kimix.space/api/chemicals/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setChemicalList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChemicals();
  }, [query]);

  if (loading) return <Loader/>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <>
    <Header/>
   
    <ChemicalList chemicals={chemicalList} />
 
    </>
  );
};

export default SearchPage;
