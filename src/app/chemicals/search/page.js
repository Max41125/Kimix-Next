"use client"; // Поскольку мы работаем с роутингом на клиенте

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Используем useSearchParams для работы с query-параметрами
import Header from '@/app/components/Module/Header';
import Loader from '@/app/components/Loader';
import ChemicalList from '@/app/components/Chemicals/ChemicalList';
import { UserProvider } from '@/app/components/Auth/UserProvider';
const ChemicalDetail = ({ query }) => {
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

  if (loading) return <Loader />;
  if (error) return <div>Ошибка: {error}</div>;

  return <ChemicalList chemicals={chemicalList} />;
};

const SearchPage = () => {
  return (
    <>
     <UserProvider>
      <Header />
      </UserProvider>
      <Suspense fallback={<Loader />}>
        <ChemicalDetailWithParams />
      </Suspense>
      
    </>
  );
};

const ChemicalDetailWithParams = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  return <ChemicalDetail query={query} />;
};

export default SearchPage;
