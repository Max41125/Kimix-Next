

import Header from "./components/Module/Header"; // импортируем Header
import { UserProvider } from './components/Auth/UserProvider';
import Link from "next/link";
import Image from "next/image";
import AuthIcon from '/public/auth.svg';
import ConstructorIcon from '/public/constructor.svg';
import ParticlesBackground from "./components/Decor/ParticlesBackground";
export default function Home() {
  return (
  
  
      <ParticlesBackground>
        <main className="relative z-10"> 
          <UserProvider>
            <Header /> 

          </UserProvider>
          <div className="flex justify-center container mx-auto space-x-4 mt-10 px-2 z-10 lg:px-0 ">
          {/* User Authentication Block */}
          <Link href="/auth" className="flex flex-col bg-white items-center w-full  text-center  rounded-lg z-10  shadow-lg hover:bg-gray-100 transition duration-200">
            <Image src={AuthIcon} width={200} height={100}  /> {/* Adjust size as needed */}
            <span className="text-lg font-semibold py-8 mt-auto text-center">Вход в личный кабинет</span>
          </Link>

          {/* Reagents Constructor Block */}
          <Link href="/constructor" className="flex flex-col bg-white  items-center w-full rounded-lg shadow-lg z-10 hover:bg-gray-100 transition duration-200">
            <Image src={ConstructorIcon} width={300} height={200} /> {/* Adjust size as needed */}
            <span className="text-lg font-semibold py-8 mt-auto text-center">Конструктор реагентов</span>
          </Link>
          </div>

          <div className="flex justify-center container mx-auto space-x-4 mt-10 px-2 lg:px-0 z-10">
          <Link href="/chemicals" className="flex flex-col bg-white  items-center w-full rounded-lg shadow-lg z-10 hover:bg-gray-100 transition duration-200">
            <Image src={ConstructorIcon} width={300} height={200} /> {/* Adjust size as needed */}
            <span className="text-lg font-semibold py-8 mt-auto  text-center">Поиск товаров</span>
          </Link>
      

          
        
          
          </div>
        </main>
      </ ParticlesBackground>
 
  );
}
