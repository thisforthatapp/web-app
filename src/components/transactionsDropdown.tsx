'use client'

import React, { useEffect, useRef, useState } from 'react'

import { Chain } from '@/icons'

interface TransactionsProps {
  transactions: any
}

const TransactionsDropdown = ({ transactions }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => setIsOpen(!isOpen)

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className='h-full w-[45px] rounded-md bg-gray-100 flex items-center justify-center'
      >
        <Chain className='w-[40px] h-[40px]' />
        {transactions.length > 0 && (
          <span className='z-10 absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full'>
            {transactions.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute max-h-96 right-[-105px] mt-[10px] w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-10 flex flex-col'>
          <div className='min-h-[350px] flex flex-col flex-grow w-full overflow-y-auto hide-scrollbar'>
            <div className='flex flex-grow items-center justify-center px-4 py-3 text-sm text-gray-500'>
              No new transactions
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsDropdown
