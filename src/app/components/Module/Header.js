'use client'; 

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from '/public/logo.svg';
import UserImg from '/public/user.webp';
import { CiSearch, CiLogin } from "react-icons/ci";
import { FaRegCircleUser } from "react-icons/fa6"; 

import { useUser } from '../Auth/UserProvider'; 
import { BsCart2 } from "react-icons/bs";
import { HiX } from 'react-icons/hi';

const Header = () => {
  const { user, logout } = useUser() || {}; 
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false); 


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout(); // Вызываем функцию logout из контекста
    setDropdownOpen(false); // Закрываем меню
  };
 
  return (
    <>
      <header className="w-full py-4 px-4 bg-gray-100">
        <div className="container mx-auto flex justify-between items-center rounded border-solid">
          <Link href="/">
            <Image src={Logo} alt="Logo" width={100} height={50} />
          </Link>
          <form className="w-full px-10 relative lg:block hidden " onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Введите название вещества/формулу/CAS номер"
              value={searchQuery}
              onChange={handleSearchChange}
              className="border w-full rounded-full py-2 pl-10 pr-10 flex-grow"
            />
            <Link href={`/chemicals/search?page=1&query=${encodeURIComponent(searchQuery)}`}>
              <button
                type="submit"
                className="absolute right-16 top-2 text-teal-500"
              >
                <CiSearch size={25} color="#14D8B5" />
              </button>
            </Link>
          </form>
            {user?.role === "buyer" &&(

              <Link href="/cart" className="lg:ml-0 ml-auto">
                <button className="text-teal-500 mr-4">
                  <BsCart2 size={25} color="#14D8B5" />
                </button>
              </Link>
            )}
      
          <div className="relative flex flex-col items-center">
            <button onClick={user ? handleDropdownToggle : null} className="text-teal-500">
              {user ? 
              <div className="border border-[#14D8B5] w-[40px] h-[40px] overflow-hidden rounded-full bg-gray-300">
                <Image src={UserImg} width={40} height={40} />
              </div> 
              : 
              <Link href="/auth">
                <FaRegCircleUser size={25} color="#14D8B5" />
              </Link>
              }
            </button>

          
            {user && isDropdownOpen && (
              <div className="fixed inset-y-0 h-screen z-20 right-0 bg-white shadow-md rounded-lg flex flex-col items-center  w-64 px-2 py-12">

              <button
                  onClick={handleDropdownToggle}  // Закрываем окно при клике на крестик
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
                >
                  <HiX size={24} />
                </button>
                <Image src={UserImg} width={40} height={40} className="rounded-full" />
                <p className="px-4 py-2 " >Доброго дня {user.name}</p>
                <Link href="/dashboard?section=general" className="block px-4 py-2 rounded-lg transition text-center w-full hover:bg-green-200">Личный кабинет</Link>
                {user?.role === "seller" &&(
                <>
                  <Link href="/dashboard?section=seller-orders" className="block px-4 py-2 rounded-lg transition text-center w-full hover:bg-green-200">Заказы покупателей</Link>
                  <Link href="/dashboard?section=your-products" className="block px-4 py-2 rounded-lg transition text-center w-full hover:bg-yellow-200">Ваши товары</Link>
                </>
                )}
                {user?.role === "buyer" &&(
                  <>
                    <Link href="/dashboard?section=сustomer-orders" className="block px-4 py-2 rounded-lg transition text-center w-full hover:bg-green-200">Ваши заказы</Link>
                    <Link href="/chemicals" className="block px-4 py-2 rounded-lg transition text-center w-full hover:bg-blue-200">Поиск веществ</Link>
                  </>
                )}
                
                <button onClick={handleLogout} className="block w-full rounded-lg text-left  text-center px-4 py-2 transition hover:bg-red-200">Выйти</button>
              </div>
            )}
          </div>
        </div>
      </header>


    </>
  );
};

export default Header;
