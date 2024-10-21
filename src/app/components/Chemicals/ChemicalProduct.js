'use client'; 

import React, { useState, useEffect } from 'react';
import Loader from '@/app/components/Loaders/Loader';
import { useUser } from '@/app/components/Auth/UserProvider';
import BlurredContent from '@/app/components/Auth/BlurredContent';
import Image from 'next/image';
import { ReactSVG } from 'react-svg';
import NotFound from '/public/notfound.svg';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';


const ChemicalProduct = () => {
    const searchParams = useSearchParams(); 
    const id = searchParams.get('id'); 
    const csrfUrl = 'https://test.kimix.space/sanctum/csrf-cookie';
    const [chemical, setChemical] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]); // Состояние для корзины
    const [quantities, setQuantities] = useState({}); // Состояние для количеств
  
    const { user } = useUser() || {};
  
    useEffect(() => {
      const fetchChemical = async () => {
        if (!id) return; 
  
        try {
          await axios.get(csrfUrl, { withCredentials: true });
          const res = await axios.get(`https://test.kimix.space/api/chemicals/${id}`, { withCredentials: true });
          const supplierRes = await axios.get(`https://test.kimix.space/api/auth/chemicals/${id}/suppliers`, { withCredentials: true });
  
          setChemical(res.data);
          setSuppliers(supplierRes.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchChemical();
    }, [id]);
  
    const addToCart = (supplier, quantity) => {
      const newItem = {
        name: supplier.name,
        price: supplier.price,
        currency: supplier.currency,
        unit_type: supplier.unit_type,
        quantity: quantity || 1, 
      };
      
      setCart((prevCart) => [...prevCart, newItem]);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg p-6">
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
              {chemical.title && (<h1 className="text-3xl font-bold">{chemical.title}</h1>)}
              {chemical.cas_number && (<p><strong>CAS:</strong> {chemical.cas_number}</p>)}
              {chemical.formula && (<p><strong>Формула:</strong> {chemical.formula}</p>)}
              {chemical.molecular_weight && (<p><strong>Молекулярный вес:</strong> {chemical.molecular_weight} g/mol</p>)}
            
                {suppliers?.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold">Поставщики:</h2>
                    {user?.role === 'buyer' ? (
                      <>
                        {suppliers?.map((supplier) => (
                          <div key={supplier.id} className="p-4 mt-2 bg-gray-100 rounded-lg shadow-md grid grid-cols-2">
                            <div className="flex flex-col gap-4">
                              {supplier.name && (<p><strong>Поставщик:</strong> {supplier.name}</p>)}
                              {supplier.price && (
                                <p>
                                  <strong>Цена:</strong> {supplier.price} {getCurrencySymbol(supplier.currency)} за 1 ед. {translateUnitType(supplier.unit_type)}
                                </p>
                              )}
                            </div>
  
                            <div className="flex gap-2 justify-center items-center">
                              <input
                                type="number"
                                min="1"
                                value={quantities[supplier.id] || 1}
                                onChange={(e) => handleQuantityChange(supplier.id, e.target.value)}
                                className="w-16 p-2 border rounded"
                              />
                              <button
                                onClick={() => addToCart(supplier, quantities[supplier.id])}
                                className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors duration-300"
                              >
                                Добавить в корзину
                              </button>
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
        </div>
      </>
    );
  };


export default ChemicalProduct;