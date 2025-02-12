"use client";
import React from "react";
import { motion } from "framer-motion";

const StatusLine = ({ status }) => {
  // Возможные статусы в правильном порядке
  const allStatuses = [
    "new",
    "contract_verification",
    "waiting_payment",
    "packing",
    "shipping",
    "shipped",
  ];

  const translateStatus = (status) => {
    switch (status) {
      case "new":
        return "Новый";
      case "contract_verification":
        return "Проверка контракта";
      case "waiting_payment":
        return "Ожидание оплаты";
      case "packing":
        return "Комплектация";
      case "shipping":
        return "Отгрузка";
      case "shipped":
        return "Отгружен";
      default:
        return status;
    }
  };

  // Определяем индекс текущего статуса
  const currentIndex = allStatuses.indexOf(status);
  if (currentIndex === -1) {
    return <p className="text-red-500">Неизвестный статус: {status}</p>;
  }

  // Определяем отображаемые статусы: предыдущий, текущий, следующий
  const visibleStatuses = [
    allStatuses[currentIndex - 1] || null, // Предыдущий
    allStatuses[currentIndex],           // Текущий
    allStatuses[currentIndex + 1] || null, // Следующий
  ];

  return (
    <div className="flex items-center justify-center w-full mt-8 mb-12 progress__Line">
      <div className="relative flex items-center justify-between lg:w-80 lg:max-w-lg w-60">
        {visibleStatuses.map((item, index) => {
          if (!item) return null;

          const isCurrent = item === status;
          const size = isCurrent ? "w-3.5 h-3.5" : "w-2 h-2";
          const bgColor = isCurrent ? "bg-green-500" : "bg-gray-300";
          const textColor = isCurrent ? "text-white" : "text-gray-700";

          return (
            <React.Fragment key={item}>
            
              {index > 0 && (
                <div
                  className={`flex-1  ${
                    index <= currentIndex ? "border-green-500" : "border-gray-300"
                  }`}
                />
              )}

            
              <div className="relative z-10 flex flex-col items-center bg-transparent">
                {isCurrent ? (
                    <div
                    className={`relative ${size} animate-pulse flex items-center justify-center rounded-full ${bgColor}`}
                >
                        <span className={`absolute font-bold ${textColor}`}></span>
                    </div>
                ) : (

                    <div
                    className={`relative ${size} flex items-center justify-center rounded-full ${bgColor}`}>
                        <span className={`absolute font-bold ${textColor}`}></span>
                    </div>
                )}

                <span className="mt-3 text-xs text-center absolute top-2 bg-white px-6 py-1 border border-gray-300 rounded-full ">
                  {translateStatus(item)}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StatusLine;
