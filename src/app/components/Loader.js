// Loader.js
import React from 'react';
import '@/app/css/Loader.css'; // Импортируйте стили

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      <div className="circles">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
        <div className="circle circle3"></div>
      </div>
    </div>
  );
};

export default Loader;
