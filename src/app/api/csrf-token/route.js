// app/api/csrf-token/route.js
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('https://test.kimix.space/sanctum/csrf-cookie', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ message: 'Ошибка получения CSRF токена' }, { status: response.status });
        }

        // Извлекаем заголовок Set-Cookie
        const setCookieHeader = response.headers.get('set-cookie');

        // Если куки есть, разбиваем их на отдельные значения
        const cookies = setCookieHeader ? setCookieHeader.split(',').map(cookie => cookie.trim()) : [];

        return NextResponse.json({
            message: 'CSRF токен успешно получен',
            cookies // Возвращаем куки как массив
        });
    } catch (error) {
        console.error('Ошибка получения CSRF токена:', error);
        return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
    }
}
