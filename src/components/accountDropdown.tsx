"use client";

import React, { useState, useRef, useEffect } from "react";
import { User } from "@/icons";

const AccountDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="h-full w-[45px] rounded-md bg-gray-100 flex items-center justify-center"
        onClick={toggleDropdown}
      >
        <User className={`w-[22px] h-[22px] text-black`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <button
              onClick={() => {}}
              className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              My NFTs
            </button>
            <button
              onClick={() => {}}
              className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Edit Profile
            </button>
            <button
              onClick={() => {}}
              className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              View Profile
            </button>
            <button
              onClick={() => {}}
              className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;
