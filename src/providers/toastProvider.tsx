'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

import { Toast } from '@/components'

interface ToastProps {
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastProps | null>(null)

  const showToast = useCallback((message: string, duration = 2000) => {
    setToast({ message, duration })
  }, [])

  const handleClose = useCallback(() => {
    setToast(null)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast {...toast} onClose={handleClose} />}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
