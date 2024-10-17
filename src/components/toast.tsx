'use client'

import React, { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  duration?: number
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, duration = 2500, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for the slide-out animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`
      z-[1000] fixed left-1/2 transform -translate-x-1/2 
      bg-blue-50 border-gray-900 px-6 py-3 rounded-lg shadow-lg
      transition-all duration-300 ease-in-out
      max-w-[90%] md:max-w-md w-full text-center text-lg font-semibold
      ${isVisible ? 'bottom-10 translate-y-2' : 'translate-y-full'}
    `}
    >
      {message}
    </div>
  )
}

export default Toast
