"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { useAuthState, useIsMobile } from "@/hooks";
import { NotificationDropdown } from "@/components";
import {
  Wallet as WalletModal,
  Login as LoginModal,
  Onboard as OnboardModal,
} from "@/components/modals";
import { Wallet, User, Login, Search, Hamburger } from "@/icons";

const Navbar: FC = () => {
  const { user, hasProfile, loading } = useAuthState({ checkProfile: true });
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

  console.log("user", user);
  console.log("loading", loading);
  console.log("hasProfile", hasProfile);

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
        <div className="fixed top-[0px] right-0 bg-white w-64 h-screen shadow-lg z-20 p-4">
          <div className="flex flex-col gap-y-4">{renderButtons()}</div>
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
