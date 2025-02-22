'use client'; 

import React, { useState, useEffect } from 'react';
import Loader from '@/app/components/Loaders/Loader';
import { useUser } from '@/app/components/Auth/UserProvider';
import { ReactSVG } from 'react-svg';
import { useSearchParams } from 'next/navigation';
import BlurredContent from '@/app/components/Auth/BlurredContent';
import Image from 'next/image';
import NotFound from '/public/notfound.svg';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronDown, HiChevronUp } from "react-icons/hi"; // Иконки стрелочек
import SubscriptionForm from './Subscribe/SubscribeForm';
import SubscribeSliderChemical from './Subscribe/SubscribeSliderChemical';



const ChemicalProduct = () => {
    const searchParams = useSearchParams(); 
    const id = searchParams.get('id'); 
    const csrfUrl = process.env.NEXT_PUBLIC_CSRF_URL;
    const [chemical, setChemical] = useState(null);
    const [synonyms, setSynonyms] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantities, setQuantities] = useState({}); // Состояние для количеств
    const [isAdded, setIsAdded] = useState(false);
    const [openSynonyms, setOpenSynonyms] = useState(false);
    const [openInchi, setOpenInchi] = useState(false);
    const [openSmiles, setOpenSmiles] = useState(false);
    const [hasSuppliers, setHasSuppliers] = useState(false); // Добавляем состояние
    const { user } = useUser() || {};
  
    useEffect(() => {
      const fetchChemical = async () => {
        if (!id) return; 
  
        try {
          
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chemicals/${id}`, { withCredentials: true });
          setChemical(res.data.chemical);  
          setSynonyms(res.data.synonyms); 

        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      const fetchChemicalSuppliers = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/chemicals/${id}/suppliers`,
                { withCredentials: true }
            );
            setHasSuppliers(response.data.has_suppliers); // Устанавливаем флаг
        } catch (err) {
            setError(err.message);
        } 
      };
      fetchChemicalSuppliers();

      fetchChemical();
    }, [id]);
  


    if (loading) return <Loader />;
    if (error) return <div>Ошибка: {error}</div>;
    if (!chemical) return <div>Нет данных для отображения.</div>;
  

  
    return (
      <>
        <div className="container mx-auto lg:p-4 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-8 gap-2 bg-white rounded-lg shadow-lg lg:p-6 p-2">
            <div className="flex justify-center items-center">
              {chemical.image ? (
                <ReactSVG 
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(chemical.image)}`} 
                  className="min-h-96 w-full h-full flex"
                  beforeInjection={(svg) => {
                    svg.classList.add('product__image');
                  }}
                />
              ) : (
                <Image
                  src={NotFound}
                  alt="No image"
                  className="flex flex-col"
                />
              )}
            </div>
  
            <div className="flex flex-col space-y-4">
              {chemical.title && (<h1 className="lg:text-3xl text-lg font-bold">{chemical.title}</h1>)}
              {chemical.russian_common_name && (<h2 className="lg:text-3xl text-lg font-bold">({chemical.russian_common_name})</h2>)}
              {chemical.cas_number && (<p><strong>CAS:</strong> {chemical.cas_number}</p>)}
              {chemical.formula && (<p><strong>Формула:</strong> {chemical.formula}</p>)}
              {chemical.molecular_weight && (<p><strong>Молекулярный вес:</strong> {chemical.molecular_weight} g/mol</p>)}
            
              {chemical.russian_description && (
                <div>
                  <p><strong>Описание:</strong></p>
                  <p className='text-sm text-gray-600'>{chemical.russian_description}</p>
                </div>
               )}
           
            </div>
          </div>
          {hasSuppliers !== false && (
            user?.role === 'buyer' ? (
                <div className='w-full border rounded-lg my-5 bg-white shadow-lg'>
                    <SubscriptionForm 
                        userId={user.id}
                        chemicalId={chemical.id}
                        role={user.role}
                        setSubscription={setSubscription}
                    />
                    <SubscribeSliderChemical 
                        chemical={chemical} 
                        subscription={subscription} 
                        userId={user.id} 
                    />
                </div>
            ) : (
                <BlurredContent role="buyer">
                    <div className="p-4 mt-2 bg-gray-100 rounded-lg shadow-md grid grid-cols-2">
                        <div className="flex flex-col gap-4">
                            <p>Lorem ipsum Lorem ipsum Lorem ipsum</p>
                            <p>Lorem ipsum Lorem ipsum</p>
                        </div>
                    </div>
                </BlurredContent>
            )
        )}

  
               
            


      {synonyms?.length > 0 && (

        <>
        <div className='mt-8 bg-white p-6 rounded-lg shadow-lg'>
          <h2 className="lg:text-2xl text-lg  font-bold mb-4 cursor-pointer flex items-center gap-2" onClick={() => setOpenSynonyms(!openSynonyms)}>
            Синонимы
            {openSynonyms ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
          </h2>
          <AnimatePresence initial={false}>
          {openSynonyms && (
          <motion.div 
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
          
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Английский</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Русский</th>
                  </tr>
                </thead>
                <tbody>
                  {synonyms.map((synonym, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2">{synonym.name || '—'}</td>
                      <td className="border border-gray-300 px-4 py-2">{synonym.russian_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         
          </motion.div>
           )}
          </AnimatePresence>
        </div>
        </>
      )}

      {chemical.inchi && (
        <>
          <div className='mt-8 bg-white p-6 rounded-lg shadow-lg'>
            <h2 className="lg:text-2xl text-lg  font-bold mb-4 cursor-pointer flex items-center gap-2" onClick={() => setOpenInchi(!openInchi)}>
              InChi
              {openInchi ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
            </h2>
          
            <AnimatePresence initial={false}>
            {openInchi &&
              <motion.div 
                key="content"
                initial="collapsed"
                animate="open"
                exit="collapsed"
                variants={{
                  open: { opacity: 1, height: "auto" },
                  collapsed: { opacity: 0, height: 0 }
                }}
                transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
              >
             <p>{chemical.inchi}</p>
           </motion.div>
            }
          </AnimatePresence>
        </div>
        </>
      )}

      {chemical.smiles && (
        <>
        <div className='mt-8 bg-white p-6 rounded-lg shadow-lg'>
          <h2 className="lg:text-2xl text-lg  font-bold mb-4 cursor-pointer flex items-center gap-2" onClick={() => setOpenSmiles(!openSmiles)}>
            Smiles
            {openSmiles ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
          </h2>
          <AnimatePresence initial={false}>
          {openSmiles &&
          <motion.div 
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
            >

             <p>{chemical.smiles}</p>
          </motion.div>
          }
          </AnimatePresence>
        </div>
        </>
      )}
      </div>
        </>
      );
  };
  
export default ChemicalProduct;