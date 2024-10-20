"use client";

import React from "react";
import { ReactSVG } from 'react-svg';
import Link from 'next/link';
import Image from "next/image";
import Logo from '/public/logo.svg';
import NotFound from '/public/notfound.svg';
const ChemicalList = ({ chemicals }) => { // Измените на chemicals
  if (!chemicals || chemicals.length === 0) {
    return <div className="container mx-auto"><p className="py-20">Хим.вещества не найдены по запросу {chemicals}</p></div>;
  }

  return (
    <div className="mt-10 container mx-auto grid lg:grid-cols-2 gap-5">
      {chemicals.map((chemical) => (
        <div 
          key={chemical.CID} 
          className="flex flex-col border border-gray-300 rounded-lg p-4"
        >
          <div className="flex justify-center mb-2">
            {chemical.image ? (
                <ReactSVG 
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(chemical.image)}`} 
                  className=" w-full items-center  flex flex-col"  // Задаем ширину и высоту
                />
              ) : (
                <Image
                  src={NotFound} // Иконка по умолчанию
                  alt="No image"
               
                  height={150}
                    // Используйте fill, чтобы занять всю доступную область
                  className="object-contain min-h-20" // Чтобы иконка сохраняла пропорции
                />
              )}

          </div>
          <Link href={`/chemical?id=${chemical.id}`}>
            <h3 className="text-lg font-bold">{chemical.title}</h3>
          </Link>
          {chemical.cas_number && <p className="text-left mb-2">CAS: {chemical.cas_number}</p>}
          {chemical.formula && <p className="text-left mb-2">Formula: {chemical.formula}</p>}
          {chemical.molecular_weight && <p className="text-left  mb-2">Molecular Weight: {chemical.molecular_weight}</p>}

          <Link 
            href={`/chemical?id=${chemical.id}`} 
            className="mt-auto mt-min bg-teal-500 text-white rounded py-2 text-center px-4  hover:bg-teal-600"
          >
            Подробнее
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ChemicalList;
