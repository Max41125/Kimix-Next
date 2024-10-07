'use client'; 

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from '/public/logo.svg';
import { CiSearch, CiLogin } from "react-icons/ci";
import { FaRegCircleUser } from "react-icons/fa6"; 
import AuthModal from "../Auth/AuthModal"; // Убедитесь, что путь правильный
import { useUser } from '../Auth/UserProvider'; 

const Header = () => {
  const { user, logout } = useUser(); 
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false); 
  
  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

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
          <form className="w-full px-10 relative" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Введите название вещества/артикул/CAS номер"
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

          {/* Иконка пользователя */}
          <div className="relative">
            <button onClick={user ? handleDropdownToggle : toggleModal} className="text-teal-500">
              {user ? <CiLogin size={25} color="#14D8B5" /> : <FaRegCircleUser size={25} color="#14D8B5" />}
            </button>

            {/* Выпадающее меню для авторизованного пользователя */}
            {user && isDropdownOpen && (
              <div className="absolute right-0 bg-white shadow-md rounded mt-2 w-48">
                <Link href="/user" className="block px-4 py-2 hover:bg-gray-200">Личный кабинет</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-200">Выйти</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isModalOpen}
        toggleModal={toggleModal}
        isLoginMode={isLoginMode}
        setIsLoginMode={setIsLoginMode}
      />
    </>
  );
};

export default Header;
