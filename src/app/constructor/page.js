import Link from 'next/link';
import Header from "@/app/components/Module/Header"; // импортируем Header
import { UserProvider } from '@/app/components/Auth/UserProvider';
import ConstructorIcon from '/public/constructor.svg';
import Image from "next/image";
import Ketcher from "@/app/components/Constructor/Ketcher";

const ConstructorPage = () => {
  return (
    <>
      <UserProvider>
        <Header /> 

      </UserProvider>
    
      <Ketcher />

    </>
  );
};

export default ConstructorPage;
