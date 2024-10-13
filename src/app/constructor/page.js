import Link from 'next/link';
import Header from "@/app/components/Module/Header"; // импортируем Header
import { UserProvider } from '@/app/components/Auth/UserProvider';
import ConstructorIcon from '/public/constructor.svg';
import Image from "next/image";


const ConstructorPage = () => {
  return (
    <>
      <UserProvider>
        <Header /> 

      </UserProvider>
    
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <Image src={ConstructorIcon} width={300} height={200} /> {/* Adjust size as needed */}
      <h1 className="text-2xl font-bold mb-4">Конструктор реагентов находится в разработке</h1>
      <Link href="/" className="mt-6 px-4 py-2 bg-[#14D8B5] text-white rounded-md shadow hover:bg-emerald-600 transition duration-200">
        Назад на главную
      </Link>
    </div>
    </>
  );
};

export default ConstructorPage;
