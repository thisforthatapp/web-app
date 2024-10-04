"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/authProvider";
import { useIsMobile } from "@/hooks";
import { NotificationDropdown } from "@/components";
import {
  Wallet as WalletModal,
  Login as LoginModal,
  Onboard as OnboardModal,
} from "@/components/modals";
import {
  Wallet,
  User,
  Login,
  Search,
  Hamburger,
  Close,
  Notifications,
} from "@/icons";

const Navbar: FC = () => {
  const { user, loading, hasProfile } = useAuth();
  const isMobile = useIsMobile();
  const [modal, setModal] = useState<
    boolean | "login" | "onboard" | "wallet" | "add"
  >(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    if (user && !loading && !hasProfile) {
      setModal("onboard");
    }
  }, [user, loading, hasProfile]);

  const renderButtons = (isMobileMenu = false) => (
    <>
      {(user || loading) && (
        <>
          <button
            className={`flex items-center ${
              isMobileMenu
                ? "text-xl mb-4"
                : "h-full w-[45px] rounded-md bg-gray-100 justify-center"
            }`}
            onClick={() => setModal("wallet")}
          >
            {isMobileMenu && "Manage NFTs & Offers"}
            <Wallet
              className={`${
                isMobileMenu ? "w-6 h-6 ml-4" : "w-[22px] h-[22px]"
              } text-black`}
            />
          </button>
          {isMobileMenu ? (
            <button
              className="flex items-center text-xl mb-4"
              onClick={() => {}}
            >
              Notifications
              <Notifications className="w-6 h-6 ml-4 text-black" />
            </button>
          ) : (
            <NotificationDropdown />
          )}
          <Link
            href="/account"
            className={`flex items-center ${
              isMobileMenu
                ? "text-xl mb-4"
                : "h-full w-[45px] rounded-md bg-gray-100 justify-center"
            }`}
          >
            {isMobileMenu && "Account"}
            <User
              className={`${
                isMobileMenu ? "w-6 h-6 ml-4" : "w-[22px] h-[22px]"
              } text-black`}
            />
          </Link>
        </>
      )}
      {!user && !loading && (
        <button
          className={`flex items-center ${
            isMobileMenu
              ? "text-xl mb-4"
              : "bg-black text-white rounded-md px-4 py-2 cursor-pointer font-semibold h-[44px]"
          }`}
          onClick={() => setModal("login")}
        >
          <Login
            className={`${isMobileMenu ? "w-6 h-6 mr-2" : "w-6 h-6"} ${
              isMobileMenu ? "text-black" : "text-white"
            }`}
          />
          <div className={isMobileMenu ? "" : "ml-1"}>Login</div>
        </button>
      )}
    </>
  );

  return (
    <>
      <nav className="z-[10] top-0 fixed w-full bg-white flex justify-between items-center px-2 h-[75px] border-b border-gray-200">
        <Link href="/">
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
              <Search />
            </div>
          </div>
        </div>
        {isMobile ? (
          <button onClick={toggleMenu} className="p-2">
            <Hamburger className="w-8" />
          </button>
        ) : (
          <div className="flex gap-x-2 h-[44px] relative mr-2">
            {renderButtons()}
          </div>
        )}
      </nav>
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex justify-end p-4">
            <button onClick={toggleMenu} className="p-2">
              <Close className="w-8 h-8" />
            </button>
          </div>
          <div className="flex-1 flex flex-col px-7 items-end">
            {renderButtons(true)}
          </div>
          <div className="p-4 text-center text-sm text-gray-500">
            <p>© TFT Labs</p>
            <div className="mt-2 space-x-2">
              <Link href="/about">About</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>
      )}
      {modal === "wallet" && <WalletModal closeModal={() => setModal(false)} />}
      {modal === "login" && <LoginModal closeModal={() => setModal(false)} />}
      {modal === "onboard" && (
        <OnboardModal closeModal={() => setModal(false)} />
      )}
    </>
  );
};

export default Navbar;
