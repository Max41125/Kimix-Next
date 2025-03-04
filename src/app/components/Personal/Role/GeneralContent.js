'use client';


import React, { useState} from 'react';

import InfoSeller from '@/app/components/Personal/Role/Seller/InfoSeller';
import InfoBuyer from '@/app/components/Personal/Role/Buyer/InfoBuyer';
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
      <h1 className="text-2xl font-bold mb-4">Добро пожаловать в ваш аккаунт!</h1>
      <div className="flex items-center gap-4">
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

   
        <div className="flex flex-col items-start gap-1">
          <p className="text-sm font-medium">Роль: <b>{userRole === 'seller' ? 'Продавец' : 'Покупатель'}</b></p>
          <p className="text-sm font-medium">
           <b>{subscription ? `Активных подписок: ${subscription.length}` : 'Нет подписки'}</b>
          </p>

         
          <p className="text-sm font-medium"> ФИО: <b>{userName}</b></p>
          <p className="text-sm font-medium">Email: <b>{userEmail}</b></p>

        </div>
      </div>



      {userRole === 'seller' && <InfoSeller userId={userId} userToken={userToken} userRole={userRole} />}
      {userRole === 'buyer' && <InfoBuyer userId={userId} userToken={userToken} userRole={userRole} />}

  
      <UpdatePassword userId={userId} userToken={userToken} userEmail={userEmail} />

    </div>
  );
};

export default GeneralContent;