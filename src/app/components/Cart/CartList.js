'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/app/components/Cart/CartProvider';
import Link from 'next/link';

const CartList = () => {
  const { cart, removeFromCart, clearCart } = useCart() || {};
  const [isClient, setIsClient] = useState(false); // Track if we're on the client

  useEffect(() => {
    setIsClient(true); // Mark as client-side rendering
  }, []);

  if (!isClient) {
    return null; // Prevent rendering until on the client
  }

  if (cart.length === 0) {
    return <div className="container mx-auto p-4">Ваша корзина пуста.</div>;
  }
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
    <div className="container mx-auto p-4">
      <ul className="space-y-4">
        {cart.map((item, index) => (
          <li key={index} className="p-4 bg-white rounded-lg shadow-md flex justify-between">
            <div>
              <p><strong>Название:</strong> {item.title}</p>
              <p><strong>Количество:</strong> {item.quantity}</p>
              <p><strong>Цена:</strong> {item.price} {getCurrencySymbol(item.currency)}</p>
              <p><strong>Ед. измерения:</strong> {translateUnitType(item.unit_type)}</p>
            </div>
            <button
              onClick={() => removeFromCart(index)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between">
        <button
          onClick={clearCart}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Очистить корзину
        </button>
        <Link href="/checkout" className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
          Оформить заказ
        </Link>
      </div>
    </div>
  );
};

export default CartList;
