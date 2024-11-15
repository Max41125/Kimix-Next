'use client'; 

import React, { useState, useEffect } from 'react';
import Loader from '@/app/components/Loaders/Loader';
import { useUser } from '@/app/components/Auth/UserProvider';
import { ReactSVG } from 'react-svg';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../Cart/CartProvider';
import BlurredContent from '@/app/components/Auth/BlurredContent';
import Image from 'next/image';
import NotFound from '/public/notfound.svg';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CiCircleCheck } from "react-icons/ci";


const ChemicalProduct = () => {
    const searchParams = useSearchParams(); 
    const id = searchParams.get('id'); 
    const csrfUrl = 'https://test.kimix.space/sanctum/csrf-cookie';
    const [chemical, setChemical] = useState(null);
    const [synonyms, setSynonyms] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantities, setQuantities] = useState({}); // Состояние для количеств
    const [isAdded, setIsAdded] = useState(false);

    const { user } = useUser() || {};
  
    useEffect(() => {
      const fetchChemical = async () => {
        if (!id) return; 
  
        try {
          await axios.get(csrfUrl, { withCredentials: true });
          const res = await axios.get(`https://test.kimix.space/api/chemicals/${id}`, { withCredentials: true });
          const supplierRes = await axios.get(`https://test.kimix.space/api/auth/chemicals/${id}/suppliers`, { withCredentials: true });
          setChemical(res.data.chemical);  // Сохраняет информацию о химическом веществе
          setSynonyms(res.data.synonyms); 
       
          setSuppliers(supplierRes.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchChemical();
    }, [id]);
  
    const { addToCart } = useCart();

    const handleAddToCart = (supplier, quantity) => {
 
      const newItem = {
        
        id: chemical.id,
        title: chemical.title,
        image:chemical.image,
        supplier: supplier.name,
        supplier_id: supplier.id,
        price: supplier.price,
        currency: supplier.currency,
        unit_type: supplier.unit_type,
        quantity: quantity || 1,
      };

      addToCart(newItem); 
      
      setIsAdded(true); // Устанавливаем состояние "добавлено"
      setTimeout(() => setIsAdded(false), 2000);
 
 
    };
    const handleQuantityChange = (supplierId, value) => {
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [supplierId]: value,
      }));
    };
  
    if (loading) return <Loader />;
    if (error) return <div>Ошибка: {error}</div>;
    if (!chemical) return <div>Нет данных для отображения.</div>;
  
    // Функция для отображения символов валют
    const getCurrencySymbol = (currency) => {
      switch (currency) {
        case 'RUB': return '₽';
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'CNY': return '¥';
        default: return currency;
      }
    };
  
    // Функция для перевода единиц измерения на русский
    const translateUnitType = (unitType) => {
      switch (unitType) {
        case 'grams': return 'Гр.';
        case 'kilograms': return 'Кг.';
        case 'tons': return 'Т.';
        case 'pieces': return 'Шт.';
        default: return unitType;
      }
    };
  
    return (
      <>
        <div className="container mx-auto p-4">
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
              {chemical.title && (<h1 className="lg:text-3xl text-xl font-bold">{chemical.title}</h1>)}
              {chemical.russian_common_name && (<h2 className="lg:text-3xl text-xl  font-bold">({chemical.russian_common_name})</h2>)}
              {chemical.cas_number && (<p><strong>CAS:</strong> {chemical.cas_number}</p>)}
              {chemical.formula && (<p><strong>Формула:</strong> {chemical.formula}</p>)}
              {chemical.molecular_weight && (<p><strong>Молекулярный вес:</strong> {chemical.molecular_weight} g/mol</p>)}
            
                {suppliers?.length > 0 && (
                  <div>
                    <h2 className="lg:text-xl text-lg font-semibold">Поставщики:</h2>
                    {user?.role === 'buyer' ? (
                      <>
                        {suppliers?.map((supplier) => (
                          <div key={supplier.id} className="lg:p-4 lg:mt-2 p-2  bg-gray-100 rounded-lg shadow-md grid grid-cols-2">
                            <div className="flex flex-col gap-4">
                              {supplier.name && (<p className='lg:text-lg text-base'><strong>Поставщик:</strong> {supplier.name}</p>)}
                              {supplier.price && (
                                <p className='lg:text-base text-sm'>
                                  <strong>Цена:</strong> {supplier.price} {getCurrencySymbol(supplier.currency)} за 1 ед. {translateUnitType(supplier.unit_type)}
                                </p>
                              )}
                            </div>
  
                            <div className="flex gap-2 justify-center relative items-center lg:flex-row flex-col">
                              <input
                                type="number"
                                min="1"
                                value={quantities[supplier.id] || 1}
                                onChange={(e) => handleQuantityChange(supplier.id, e.target.value)}
                                className="lg:w-16 w-full p-2 border rounded"
                              />
                              <motion.div
                                    className="relative w-full flex flex-col"
                                    initial={{ opacity: 1 }}
                                    animate={{ opacity: 1 }}
                                  >
                                    {/* Кнопка */}
                                    <motion.button
                                      onClick={() => handleAddToCart(supplier, quantities[supplier.id])} 
                                      className={`inline-block lg:px-6 lg:py-3 py-2 text-sm px-2 ${
                                        isAdded ? 'bg-green-500' : 'bg-green-500'
                                      } text-white rounded-lg justify-center items-center flex flex-col text-sm font-medium hover:${
                                        isAdded ? 'bg-green-600' : 'bg-green-600'
                                      } transition-colors justify-center items-center flex flex-col   duration-300`}
                                    >
                                        {!isAdded ? (
                                          <motion.span
                                            key="add"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.3 }}
                                          >
                                            Добавить в корзину
                                          </motion.span>
                                        ) : (
                                          <motion.span
                                            key="check"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.3 }}
                                            className='flex  text-center items-center gap-2'
                                          >
                                            <CiCircleCheck size={25} />
                                            
                                             В корзине
                                          </motion.span>
                                        )}
                                   
                                    </motion.button>
                              
                                  </motion.div>


                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <BlurredContent role="buyer">
                        {suppliers?.map((supplier) => (
                          <div key={supplier.id} className="p-4 mt-2 bg-gray-100 rounded-lg shadow-md grid grid-cols-2">
                            <div className="flex flex-col gap-4">
                              <p> Lorem ipsum Lorem ipsum Lorem ipsum </p>
                              <p>Lorem ipsum Lorem ipsum</p>
  
                                
  
  
                            </div>
                          </div>
                        ))}
                      </BlurredContent>
                    )}
  
                  </div>
                )}
           
            </div>
          </div>
  
          {chemical.russian_description && (
            <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Описание</h2>
              <p>{chemical.russian_description}</p>
            </div>
          )}
          {synonyms?.length > 0 && (
            <>
            <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Синонимы</h2>
              {synonyms?.map((synonym) => (
                <>
                <p>en:{synonym.name}</p>
                <p>ru:{synonym.russian_name}</p>
                </>
              ))}

             </div>
          </>
          )}


          {chemical.inchi && (
            <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">InChi</h2>
              <p>{chemical.inchi}</p>
            </div>
          )}
          {chemical.smiles && (
            <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Smiles</h2>
              <p>{chemical.smiles}</p>
            </div>
          )}







        </div>
      </>
    );
  };


export default ChemicalProduct;