import React, { useState } from 'react';

import InfoSeller from '@/app/components/Personal/Role/InfoSeller';
import InfoBuyer from '@/app/components/Personal/Role/InfoBuyer';
const GeneralContent = ({ userName, userEmail, userId, userToken, userRole }) => {








  return (
    <div className="flex flex-col gap-2">
      <div className="mt-4 lg:p-4 p-2 border rounded-lg bg-white">
        <h2 className="text-lg font-bold">Общая информация об аккаунте</h2>
        <p>ФИО: <b>{userName}</b></p>
        <p>Email: <b>{userEmail}</b></p>
      </div>
      {userRole === 'seller' && (
        <InfoSeller userId={userId} userToken={userToken} userRole={userRole}  />
      )}
      {userRole === 'buyer' && (
        <InfoBuyer userId={userId} userToken={userToken} userRole={userRole}  />
      )}
    </div>
  );
};

export default GeneralContent;
