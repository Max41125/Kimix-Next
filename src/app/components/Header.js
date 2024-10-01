"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from '/public/logo.svg';
import { CiSearch } from "react-icons/ci";
import { FaRegCircleUser } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";

const Header = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleOutsideClick = (event) => {
    const modal = document.getElementById("modal");
    if (modal && !modal.contains(event.target)) {
      setModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    } else {
      window.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isModalOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isLoginMode) {
      console.log("Logging in with:", email, password);
    } else {
      console.log("Registering with:", email, password);
    }
    setEmail('');
    setPassword('');
    setModalOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <header className=" w-full py-4 bg-gray-100">
        <div className="container mx-auto flex justify-between items-center rounded border-solid">
          <Link href="/">
            <Image src={Logo} alt="Logo" width={100} height={50} />
          </Link>
          <form className="w-full px-10 relative"  onSubmit={(e) => {
            e.preventDefault();
            // Перенаправляем на страницу поиска с параметрами
          }}>
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

          <button onClick={toggleModal} className="text-teal-500">
            <FaRegCircleUser size={25} color="#14D8B5" />
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div id="modal" className="bg-white relative p-6 rounded shadow-md">
              <h2 className="text-xl mb-4">{isLoginMode ? "Вход" : "Регистрация"}</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border rounded w-full p-2 mb-2"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border rounded w-full p-2 mb-4"
                  required
                />
                <button
                  type="submit"
                  className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 w-full"
                >
                  {isLoginMode ? "Вход" : "Регистрация"}
                </button>
              </form>
              <button
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="mt-4 text-teal-500 underline"
              >
                {isLoginMode ? "Нет еще аккаунта? Регистрация." : "Уже зарегистрированы? Вход."}
              </button>
              <button onClick={toggleModal} className="absolute right-5 top-5 ">
                <RxCross1 size={25} />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
