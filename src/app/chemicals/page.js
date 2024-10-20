"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Импортируем useRouter для навигации
import Header from '@/app/components/Module/Header';
import { UserProvider } from '@/app/components/Auth/UserProvider';
import SearchSVG from '/public/search.svg';
import Image from "next/image";
import TypingText from '@/app/components/TypingText'; 
import ChemicalList from '@/app/components/Chemicals/ChemicalList';
import Circle from '@/app/components/Loaders/Circle';

const ChemicalsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [chemicalList, setChemicalList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter(); 
    const [debounceTimeout, setDebounceTimeout] = useState(null);
  // Fetch chemicals based on search query
  // Fetch chemicals based on search query
  useEffect(() => {
    // Clear the previous timeout if it exists
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set a new timeout to delay the fetch
    const timeout = setTimeout(() => {
      const fetchChemicals = async () => {
        if (searchTerm.length < 3) {
          setChemicalList([]);
          return;
        }

        setLoading(true); // Start loading
        try {
          const res = await fetch(`https://test.kimix.space/api/chemicals/search?q=${encodeURIComponent(searchTerm)}`);
          if (!res.ok) {
            throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
          }
          const data = await res.json();
          setChemicalList(data); // Set fetched data
        } catch (err) {
          setError(err.message); // Handle any errors
        } finally {
          setLoading(false); // End loading
        }
      };

      fetchChemicals();
    }, 500); // Delay of 500ms

    // Save the timeout to state
    setDebounceTimeout(timeout);

    // Cleanup function to clear timeout on component unmount or when searchTerm changes
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleSearch = (event) => {
    event.preventDefault(); 
    if (searchTerm.trim()) {
      router.push(`/chemicals/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
        <UserProvider>
        <Header />
        </UserProvider>

        <div className=" bg-gray-100 container overflow-hidden mx-auto m-4 rounded-lg shadow-md ">


        <div className="flex items-center flex-col lg:flex-row justify-center w-full p-4 gap-4 ">
            <Image src={SearchSVG} width={500} height={150} className="inline-block max-w-xs" />

            <form onSubmit={handleSearch} className=" w-full   p-4 ">
                <TypingText
                words={['Aspirin', 'C9H8O4', '50-78-2']}
                className="text-xl font-semibold text-black-600 mb-4 inline-block"
                />
                <div className='flex items-center'>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Введите название вещества/Формула/CAS"
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                    <button
                        type="submit"
                        className="ml-2 bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-600"
                    >
                        Найти
                    </button>
                </div>
            </form>
            
            </div>
        </div>

        <div className=" container mx-auto">
            {loading && <Circle />} {/* Show loader if loading */}
            {error && <div>Ошибка: {error}</div>} {/* Show error if any */}
            {!loading && !error && chemicalList.length > 0 && (
            <ChemicalList chemicals={chemicalList} />
            )}
            {!loading && !error && chemicalList.length === 0 && searchTerm.length >= 3 && (
            <div className="text-gray-500">Не найдено результатов</div>
            )}
        </div>


    </>
  );
};

export default ChemicalsPage;
