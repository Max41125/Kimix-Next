'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { CiCircleCheck } from 'react-icons/ci';
import { useCart } from '../../Cart/CartProvider';
import Circle from '../../Loaders/Circle';  // Импорт лоадера
import SwiperCore, { Navigation, Pagination, EffectFade } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

// Инициализация Swiper с необходимыми модулями
SwiperCore.use([Navigation, Pagination, EffectFade]);

const SubscribeSliderChemical = ({ chemical, subscription, userId }) => {

    if (!subscription) return null;

    const [suppliers, setSuppliers] = useState([]);
    const { addToCart, cart } = useCart();
    const [isAdded, setIsAdded] = useState({});
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState({}); 

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
    }, [subscription.chemical_id]);

    // Пока данные загружаются, отображаем лоадер
    if (loading) {
        return <Circle />;
    }

    // Если поставщики не найдены, показываем сообщение
    if (suppliers.length === 0) {
        return <p>Нет доступных поставщиков</p>;
    }

    const handleAddToCart = (supplier) => {
        const quantity = quantities[supplier.id] || 1; // Используем выбранное количество
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
        addToCart(newItem);
        setIsAdded((prev) => ({ ...prev, [supplier.id]: true }));
        setTimeout(() => {
          setIsAdded((prev) => ({ ...prev, [supplier.id]: false }));
        }, 2000);
    };

    const handleQuantityChange = (supplierId, value) => {
        setQuantities((prevQuantities) => ({
          ...prevQuantities,
          [supplierId]: value,
        }));
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

    return (
        <div className="relative w-full mx-auto my-4 overflow-hidden">
            <Swiper
                spaceBetween={10}
                slidesPerView={2}
                navigation={{
                    prevEl: '.swiper-button-prev',
                    nextEl: '.swiper-button-next',
                }}
                loop={true}
            >
                {suppliers.map((supplier) => (
                    <SwiperSlide key={supplier.id}>
                        <div className="p-6 bg-white rounded-lg shadow-lg text-center flex flex-col items-center">
                            <h3 className="text-lg font-bold">Поставщик: {supplier.name}</h3>
                            <p className="text-gray-700">Цена: {supplier.price} {getCurrencySymbol(supplier.currency)}/{translateUnitType(supplier.unit_type)}</p>
                            <div className="flex gap-2 justify-center relative items-center lg:flex-row flex-col">
                              <input
                                type="number"
                                min="1"
                                value={quantities[supplier.id] || 1}
                                onChange={(e) => handleQuantityChange(supplier.id, e.target.value)}
                                className="lg:w-16 w-full p-2 border rounded"
                              />
                           </div>
                            <button
                                onClick={() => handleAddToCart(supplier)}
                                className={`mt-4 px-4 py-2 rounded text-white transition-colors ${
                                    isAdded[supplier.id] ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                            >
                                {isAdded[supplier.id] ? (
                                    <span className="flex items-center gap-2"><CiCircleCheck size={20} /> В корзине</span>
                                ) : (
                                    'Добавить в корзину'
                                )}
                            </button>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Кнопки навигации */}
            <button className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-md swiper-button-prev">
                <HiChevronLeft size={24} />
            </button>
            <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-md swiper-button-next">
                <HiChevronRight size={24} />
            </button>
        </div>
    );
};

export default SubscribeSliderChemical;
