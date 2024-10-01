// app/components/ChemicalClientComponent.js
"use client";

import { useEffect, useState } from 'react';

const ChemicalClientComponent = ({ chemical }) => {
  // Логика для отображения химического вещества и добавление интерактивности
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div>
      <button onClick={() => setIsLiked(!isLiked)}>
        {isLiked ? "Unlike" : "Like"}
      </button>
    </div>
  );
};

export default ChemicalClientComponent;
