'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../Loaders/Loader';

const SubscriptionForm = ({ userId, chemicalId, role }) => {
    const [type, setType] = useState(role);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            if (!userId || !chemicalId) return;
    
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/subscriptions/${userId}`,
                    { withCredentials: true }
                );
                
                if (response.status === 204) {
                    setSubscription(null); // Если подписка не найдена, то обнуляем subscription
                    return;
                }
    
                const activeSubscription = response.data.find(sub => 
                    sub.chemical_id === chemicalId && new Date(sub.end_date) > new Date()
                );
    
                setSubscription(activeSubscription || null);
                console.log(activeSubscription);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchSubscription();
    }, [userId, chemicalId]);
    

    if (loading) return <Loader />;
    if (error) return <p className="text-red-500">Ошибка: {error}</p>;

    // Если подписка активна, показываем сообщение
    if (subscription && subscription.chemical_id === chemicalId && new Date(subscription.end_date).getTime() > new Date().getTime()) {
        return (
            <div className="w-full bg-green-100 p-4 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold text-green-700">Подписка активна на это вещество</h3>
                <p className="text-lg text-gray-600">Действует до: {new Date(subscription.end_date).toLocaleDateString()}</p>
            </div>
        );
    }
    

    const handleSubscribe = async (selectedDuration) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/subscribe`,
                {
                    user_id: userId,
                    chemical_id: chemicalId,
                    type: type,
                    duration: selectedDuration
                }
            );
            alert('Подписка успешно оформлена!');
            setSubscription(response.data.subscription);
        } catch (error) {
            console.error('Ошибка при оформлении подписки:', error);
            alert('Ошибка при оформлении подписки.');
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col lg:flex-row gap-2 w-full">
               
                <SubscriptionCard
                    title="LITE"
                    price="1500р"
                    features={["✅ 6 мес.", "✅ Lorem ipsum", "✅ Lorem ipsum"]}
                    onSubscribe={() => handleSubscribe('6 months')}
                />
           
                <SubscriptionCard
                    title="MEDIUM"
                    price="1900р"
                    features={["✅ 1 год", "✅ Lorem ipsum", "✅ Lorem ipsum"]}
                    onSubscribe={() => handleSubscribe('1 year')}
                />
            
                <SubscriptionCard
                    title="PRO"
                    price="2500р"
                    features={[
                        "✅ 3 года",
                        "✅ Анализ средней цены по рынку",
                        "✅ Предупреждение запланированных остановов",
                        "✅ Архив истории изменения цен"
                    ]}
                    onSubscribe={() => handleSubscribe('3 years')}
                />
            </div>
        </div>
    );
};

const SubscriptionCard = ({ title, price, features, onSubscribe }) => {
    return (
        <div className="bg-blue-100 p-2 rounded-lg w-full shadow-lg flex flex-col">
            <div className="flex flex-col p-2 items-center">
                <h3 className="mb-5 text-center text-lg font-bold text-black bg-white px-3 py-1 rounded-full">
                    {title}
                </h3>
                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500 text-center">
                    {price}
                </p>
            </div>
            <div className="flex flex-col gap-2 w-full items-center mb-3 mt-auto">
                <ul className="w-full mt-4 space-y-2 text-sm bg-white rounded-2xl p-4">
                    {features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                    ))}
                </ul>
            </div>
            <button
                onClick={onSubscribe}
                className="w-full lg:px-6 lg:py-3 py-2 text-sm px-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-300"
            >
                Оформить
            </button>
        </div>
    );
};

export default SubscriptionForm;
