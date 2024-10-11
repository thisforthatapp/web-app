"use client";

import React, { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 2000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="z-[10] fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#ffbe06] text-black font-semibold text-lg text-center px-6 py-3 rounded-md shadow-lg min-w-[250px] animate-slide-up">
      {message}
    </div>
  );
};

export default Toast;
