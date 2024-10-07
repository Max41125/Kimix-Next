"use client";

import React from "react";
import { ReactSVG } from 'react-svg';
import Link from 'next/link';

const ChemicalList = ({ chemicals }) => { // Измените на chemicals
  if (!chemicals || chemicals.length === 0) {
    return <div className="container mx-auto"><p className="py-20">Хим.вещества не найдены по запросу {chemicals}</p></div>;
  }

  return (
    <div className="mt-10 container mx-auto grid grid-cols-2 gap-5">
      {chemicals.map((chemical) => (
        <div 
          key={chemical.CID} 
          className="flex flex-col border border-gray-300 rounded-lg p-4"
        >
          <div className="flex justify-center mb-2">
            <ReactSVG 
              src={`data:image/svg+xml;utf8,${encodeURIComponent(chemical.image)}`} 
              className="w-20 h-20"
            />
          </div>
          <Link href={`/chemical?id=${chemical.id}`}>
            <h3 className="text-lg font-bold">{chemical.title}</h3>
          </Link>
          <p className="text-left">CAS: {chemical.cas_number}</p>
          <p className="text-left">Formula: {chemical.formula}</p>
          <p className="text-left">Molecular Weight: {chemical.molecular_weight}</p>
          <Link 
            href={`/chemical?id=${chemical.id}`} 
            className="mt-2 bg-teal-500 text-white rounded py-2 px-4 hover:bg-teal-600"
          >
            Подробнее
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ChemicalList;
