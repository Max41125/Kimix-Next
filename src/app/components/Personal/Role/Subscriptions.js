import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../Loaders/Circle";
import Link from "next/link";

const Subscriptions = ({ subscription }) => {
  const [chemicals, setChemicals] = useState({}); // Храним инфо о веществах
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subscription || subscription.length === 0) {
      setLoading(false);
      return;
    }

    const fetchChemicalData = async () => {
      try {
        const chemicalRequests = subscription.map((sub) =>
          axios
            .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chemicals/${sub.chemical_id}`)
            .then((res) => ({ id: sub.chemical_id,name: res.data.chemical.title, russian_common_name: res.data.chemical.russian_common_name }))
        );

        const results = await Promise.all(chemicalRequests);

        const chemicalsMap = results.reduce((acc, item) => {
            acc[item.id] = {
              name: item.name,
              russian_common_name: item.russian_common_name,
            };
            return acc;
          }, {});
          

        setChemicals(chemicalsMap);
      } catch (err) {
        setError("Ошибка загрузки информации о веществах");
      } finally {
        setLoading(false);
      }
    };

    fetchChemicalData();
  }, [subscription]);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Ваши подписки</h2>

      {subscription.length === 0 ? (
        <p className="text-gray-500">У вас нет активных подписок.</p>
      ) : (
        <div className="space-y-4">
          {subscription.map((sub) => (
            <div key={sub.id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
              <p className="text-lg font-medium">
                Подписка на 
                    <Link
                    href={`/chemical/?id=${sub.chemical_id}`}
                    className="text-blue-500 hover:underline"
                    >
                     {` ${chemicals[sub.chemical_id]?.russian_common_name}` || ` ${chemicals[sub.chemical_id]?.name}` || "Загрузка..."}
                    </Link>
                    
                    
                    
              </p>

              <p className="text-sm text-gray-700">
                Начало: <span className="font-medium text-green-600">{sub.start_date}</span>
              </p>
              <p className="text-sm text-gray-700">
                Окончание: <span className="font-medium text-red-600">{sub.end_date}</span>
              </p>
 
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
