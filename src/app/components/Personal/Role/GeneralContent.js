import React, { useState } from 'react';

import InfoSeller from '@/app/components/Personal/Role/InfoSeller';
import InfoBuyer from '@/app/components/Personal/Role/InfoBuyer';
import UpdatePassword from '@/app/components/Auth/UpdatePassword';
import User from '/public/user.webp'
import { FaCirclePlus } from "react-icons/fa6";
import Image from 'next/image';

const GeneralContent = ({ userName, userEmail, userId, userToken, userRole, subscription }) => {
  const [profileImage, setProfileImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Здесь можно добавить логику загрузки изображения на сервер
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-white  mx-auto shadow-md">
      <div className="flex items-center gap-4">
        {/* Левая часть: фото профиля */}
        <div className="relative w-24 h-24">

          <Image 
          src={profileImage || User}
          alt="User Avatar"
          className="w-full h-full object-cover rounded-full border"
            />
          <label htmlFor="profile-upload" className="absolute bottom-0 right-0 p-1 rounded-full cursor-pointer">
            <FaCirclePlus color='rgb(20, 216, 181)' size={16} />
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {/* Правая часть: роль и подписка */}
        <div className="flex flex-col items-start gap-1">
          <p className="text-sm font-medium">Роль: <b>{userRole === 'seller' ? 'Продавец' : 'Покупатель'}</b></p>
          <p className="text-sm font-medium">Подписка: <b>{subscription || 'Нет подписки'}</b></p>
        </div>
      </div>

      {/* Центральная часть: информация о пользователе */}
      <div className="border-t pt-4">
        <h2 className="text-lg font-bold">Общая информация об аккаунте</h2>
        <p>ФИО: <b>{userName}</b></p>
        <p>Email: <b>{userEmail}</b></p>
      </div>

      {/* Роль-специфичные компоненты */}
      {userRole === 'seller' && <InfoSeller userId={userId} userToken={userToken} userRole={userRole} />}
      {userRole === 'buyer' && <InfoBuyer userId={userId} userToken={userToken} userRole={userRole} />}

      {/* Обновление пароля */}
      <UpdatePassword userId={userId} userToken={userToken} userEmail={userEmail} />

    </div>
  );
};

export default GeneralContent;