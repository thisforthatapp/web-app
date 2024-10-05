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

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock fetching notifications
    // In a real app, you'd fetch this from your API
    const mockNotifications = [
      {
        id: 1,
        type: "offer",
        user: "Alice",
        content: "made an offer on your NFT",
        time: "2m ago",
      },
      {
        id: 2,
        type: "interest",
        user: "Bob",
        content: "expressed interest in your NFT",
        time: "5m ago",
      },
      {
        id: 3,
        type: "sale",
        user: "Charlie",
        content: "purchased an NFT you were watching",
        time: "10m ago",
      },
      {
        id: 4,
        type: "message",
        user: "David",
        content: "sent you a message",
        time: "1h ago",
      },
      {
        id: 5,
        type: "follow",
        user: "Eve",
        content: "started following you",
        time: "2h ago",
      },
    ];
    setNotifications(mockNotifications);
  }, []);

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
        <div className="absolute max-h-96 right-[-55px] mt-[10px] w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 flex flex-col">
          <div className="flex-grow overflow-y-auto hide-scrollbar">
            <div>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-800">
                          <span className="font-semibold">
                            {notification.user}
                          </span>{" "}
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
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
