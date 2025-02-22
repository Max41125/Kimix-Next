'use client';

import React, { useState, useEffect, useRef} from 'react';
import axios from 'axios';
import shopSvg from '/public/shop.svg';
import Image from 'next/image';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { CiCircleCheck } from 'react-icons/ci';
import { useCart } from '../../Cart/CartProvider';
import Circle from '../../Loaders/Circle';  // Импорт лоадера
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const SubscribeSliderChemical = ({ chemical, subscription, userId }) => {
    const [suppliers, setSuppliers] = useState([]);
    const { addToCart, cart } = useCart();
    const [isAdded, setIsAdded] = useState({});
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState({}); 

    const navigationNextRef = useRef(null);
    const navigationPrevRef = useRef(null);

    


    useEffect(() => {
        const fetchChemical = async () => {
            if (!subscription.chemical_id) return;

            try {
                const supplierRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/chemicals/${subscription.chemical_id}/suppliers/${userId}`, { withCredentials: true });
                setSuppliers(supplierRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchChemical();
    }, [subscription.chemical_id, userId]);

    // Пока данные загружаются, отображаем лоадер
    if (loading) {
        return <Circle />;
    }

    // Если поставщики не найдены, показываем сообщение
    if (suppliers.length === 0) {
        return <p>Нет доступных поставщиков</p>;
    }

    const handleAddToCart = (supplier) => {
        const uniqueKey = getUniqueKey(supplier);  
        const quantity = quantities[uniqueKey] || 1;
        const newItem = {
            id: chemical.id,
            title: chemical.title,
            image: chemical.image,
            supplier: supplier.name,
            supplier_id: supplier.id,
            price: supplier.price,
            currency: supplier.currency,
            unit_type: supplier.unit_type,
            quantity,  // Передаем количество
        };
        console.log(quantities[supplier.uniqueKey]);
        // Добавляем товар в корзину
        addToCart(newItem);
        
        // Обновляем состояние кнопки (отображение "В корзине")
        // Обновляем состояние кнопки (отображение "В корзине")
        setIsAdded((prev) => ({ ...prev, [uniqueKey]: true }));

        // Ожидаем 2 секунды, чтобы показать изменение на кнопке
        setTimeout(() => {
            setIsAdded((prev) => ({ ...prev, [uniqueKey]: false }));
        }, 2000);
    };
    

    const handleQuantityChange = (supplierKey, value) => {
        setQuantities((prevQuantities) => {
            const newQuantities = {
                ...prevQuantities,
                [supplierKey]: Number(value),
            };
            console.log(newQuantities); // Теперь логи будут показывать актуальное состояние
            return newQuantities;
        });
    };
    

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
    const getUniqueKey = (supplier) => `${supplier.id}-${supplier.unit_type}-${supplier.currency}`;
    return (
        <div className="relative w-full mx-auto my-4 p-10 ">
            <Swiper
                spaceBetween={10}
                slidesPerView={3}
                modules={[Navigation]}
                navigation={{
                    prevEl: navigationPrevRef.current,
                    nextEl: navigationNextRef.current,
                }}
                className='flex'
                loop={true}

 

            >
            {suppliers.map((supplier) => {
                const uniqueKey = getUniqueKey(supplier);
                return (
                    <SwiperSlide key={uniqueKey} className='!h-auto flex flex-col'>
                        <div className="p-5 bg-white rounded-3xl border-2 border-gray-200 flex flex-col h-full">
                            <div className='flex flex-row justify-between mb-3'>
                                <div className='flex flex-row gap-4'>
                                    <Image
                                        src={shopSvg}
                                        width={33}
                                        height={33}
                                    />
                                    <h3 className="text-lg font-bold">{supplier.name}</h3>
                                </div>
                                <p className="text-lg font-bold">{supplier.price} {getCurrencySymbol(supplier.currency)}/{translateUnitType(supplier.unit_type)}</p>
                            </div>

                            <p className='mb-3 text-lg text-gray-500'>{supplier.description}</p>

                            <div className='flex flex-row gap-3 items-center justify-end mt-auto'>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantities[uniqueKey] || 1}
                                    onChange={(e) => handleQuantityChange(uniqueKey, Number(e.target.value))}

                                    className="lg:w-16 w-full p-2 border rounded"
                                />
                                <button
                                    onClick={() => handleAddToCart(supplier)}
                                    className={`px-4 py-2 rounded text-white transition-colors ${
                                        isAdded[uniqueKey] ? 'bg-green-500' : 'bg-green-500 hover:bg-green-600'
                                    }`}
                                >
                                    {isAdded[uniqueKey] ? (
                                        <span className="flex items-center gap-2"><CiCircleCheck size={20} /> В корзине</span>
                                    ) : (
                                        'Добавить в корзину'
                                    )}
                                </button>
                            </div>
                        </div>
                    </SwiperSlide>
                );
            })}



            </Swiper>

            <button ref={navigationPrevRef}  className="z-10 absolute left-[20px] top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-md swiper-button-prev">
                <HiChevronLeft size={24} />
            </button>
            <button ref={navigationNextRef} className="z-10 absolute right-[20px] top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-md swiper-button-next">
                <HiChevronRight size={24} />
            </button>

        </div>
    );
};

export default SubscribeSliderChemical;
