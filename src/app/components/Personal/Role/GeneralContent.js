import React from 'react';

const GeneralContent = ({userName , userEmail}) => {
  return (
    <div className="mt-4 lg:p-4 p-2 border rounded-lg bg-white">
    <h2 className="text-lg font-bold">Общая информация об аккаунте</h2>
    <p>Имя:{userName}</p>
    <p>Email: {userEmail}</p>
    </div>
  );
};

export default GeneralContent;
