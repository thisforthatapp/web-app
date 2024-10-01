"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { useAuthState, useIsMobile } from "@/hooks";
import { NotificationDropdown } from "@/components";
import {
  Wallet as WalletModal,
  Login as LoginModal,
} from "@/components/modals";
import { Wallet, User, Login } from "@/icons";

const Navbar: FC = () => {
  const { user, loading } = useAuthState();
  const [modal, setModal] = useState<boolean | "login" | "wallet" | "add">(
    false
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const renderButtons = () => (
    <>
      {(user || loading) && (
        <>
          <button
            className="h-full w-[45px] rounded-md bg-gray-100 flex items-center justify-center"
            onClick={() => setModal("wallet")}
          >
            <Wallet className="w-[22px] h-[22px] text-black" />
          </button>
          <NotificationDropdown />
          <Link
            href="/account"
            className="h-full w-[45px] rounded-md bg-gray-100 flex items-center justify-center"
          >
            <User className="w-[22px] h-[22px] text-black" />
          </Link>
        </>
      )}
      {!user && !loading && (
        <button
          className="bg-black text-white rounded-md px-4 py-2 cursor-pointer font-semibold h-[44px] flex items-center"
          onClick={() => setModal("login")}
        >
          <Login className="w-6 h-6 text-white" />
          <div className="ml-1">Login</div>
        </button>
      )}
    </>
  );

  return (
    <>
      <nav className="z-[10] top-0 fixed w-full bg-white flex justify-between items-center px-2 h-[75px] border-b border-gray-200">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" className="w-[70px] h-[70px] p-2" alt="Logo" />
        </Link>
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 h-[44px] pl-10 pr-4 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        {isMobile ? (
          <button onClick={toggleMenu} className="p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        ) : (
          <div className="flex gap-x-2 h-[44px] relative mr-2">
            {renderButtons()}
          </div>
        )}
      </nav>
      {isMobile && isMenuOpen && (
        <div className="fixed top-[0px] right-0 bg-white w-64 h-screen shadow-lg z-20 p-4">
          <div className="flex flex-col gap-y-4">{renderButtons()}</div>
        </div>
      )}
      {modal === "wallet" && <WalletModal closeModal={() => setModal(false)} />}
      {modal === "login" && <LoginModal closeModal={() => setModal(false)} />}
    </>
  );
};

export default Navbar;
