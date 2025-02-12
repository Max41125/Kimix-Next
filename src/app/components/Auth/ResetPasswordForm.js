import React, { useState } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation'; // Для работы с URL

const ResetPasswordForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Извлекаем параметры token и email
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const csrfUrl = process.env.NEXT_PUBLIC_CSRF_URL;
    // Проверка пароля (минимум 8 символов)
    const isValidPassword = (password) => password.length >= 8;

    // Если token или email отсутствуют, отображаем сообщение
    if (!token || !email) {
        return (
            <div className="flex justify-center h-screen items-center">
                <p>Загрузка...</p>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Пароли не совпадают.');
            return;
        }

        if (!isValidPassword(password)) {
            setError('Пароль должен быть не менее 8 символов.');
            return;
        }

        try {

            await axios.get(csrfUrl, {
                withCredentials: true,
    
            });


            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password`, {
                email,
                password,
                password_confirmation: confirmPassword,
                token,
            }, {
       
                withCredentials: true,
                withXSRFToken:true,
            });

            if (response.status === 200) {
                setMessage('Пароль успешно сброшен!');
                setTimeout(() => router.push('/auth'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при сбросе пароля. Попробуйте снова.');
        }
    };

    return (
        <div className="flex justify-center h-screen container mx-auto p-4 items-center">
            <div className="bg-white shadow-2xl p-10 rounded-lg w-full lg:w-6/12">
                <h2 className="text-xl font-semibold mb-4">Сброс пароля</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Новый пароль"
                        className="border rounded w-full p-2 mb-4"
                        required
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Подтвердите новый пароль"
                        className="border rounded w-full p-2 mb-4"
                        required
                    />
                    <button type="submit" className="bg-teal-500 text-white px-4 py-2 rounded w-full">
                        Сбросить пароль
                    </button>
                </form>
                {message && <p className="text-green-500 mt-4">{message}</p>}
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default ResetPasswordForm;
