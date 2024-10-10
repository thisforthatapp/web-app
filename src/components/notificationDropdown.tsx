"use client";

import React, { useState, useEffect, useRef } from "react";
import { Notifications } from "@/icons";

interface Notification {
  id: number;
  type: string;
  user: string;
  content: string;
  time: string;
}

const NotificationDropdown = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: { target: unknown }) => {
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "offer":
        return "💰";
      case "interest":
        return "👀";
      case "sale":
        return "🎉";
      case "message":
        return "💬";
      case "follow":
        return "👤";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="h-full w-[45px] rounded-md bg-gray-100 flex items-center justify-center"
      >
        <Notifications className="w-[22px] h-[22px]" />
        {/* {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )} */}
      </button>

      {isOpen && (
        <div className="absolute max-h-96 right-[-55px] mt-[10px] w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-10 flex flex-col">
          <div className="min-h-[350px] flex flex-col flex-grow w-full overflow-y-auto hide-scrollbar">
            <div>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-50 border-b border-gray-200 w-full"
                  >
                    {notification.notification_type}
                  </div>
                ))
              ) : (
                <div className="flex flex-grow items-center justify-center px-4 py-3 text-sm text-gray-500">
                  No new notifications
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
