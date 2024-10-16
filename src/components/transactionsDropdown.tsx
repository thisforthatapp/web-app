'use client'

import React, { useEffect, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

import { Chain } from '@/icons'
import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'

interface Transaction {
  id: string
  offer: {
    user: Array<{ name: string; image: string }>
    userCounter: Array<{ name: string; image: string }>
  }
  status: string
  chain_id: number
  created_at: string
  user_id: string
  user_id_counter: string
}

interface TransactionsProps {
  transactions: Transaction[]
  userId: string
  selectOffer: (id: string) => void
}

const TransactionItem: React.FC<{
  transaction: Transaction
  userId: string
  selectOffer: (id: string) => void
}> = ({ transaction, userId, selectOffer }) => {
  const isCurrentUserInitiator = transaction.user_id === userId
  const tradingPartner = isCurrentUserInitiator
    ? transaction.offer.userCounter[0]
    : transaction.offer.user[0]
  const userNft = isCurrentUserInitiator
    ? transaction.offer.user[0]
    : transaction.offer.userCounter[0]

  return (
    <div
      className='px-4 py-3 hover:bg-gray-50 border-b border-gray-200'
      onClick={() => selectOffer(transaction.id)}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          <img src={userNft.image} alt={userNft.name} className='w-8 h-8 rounded-full mr-2' />
          <span className='text-sm font-medium'>↔</span>
          <img
            src={tradingPartner.image}
            alt={tradingPartner.name}
            className='w-8 h-8 rounded-full ml-2'
          />
        </div>
        <div className='text-sm text-gray-500'>
          {transaction.status === 'completed' ? 'Completed' : 'In Progress'}
        </div>
      </div>
      <div className='mt-1 text-xs text-gray-500'>Trading with: {tradingPartner.name}</div>
      <div className='mt-1 text-xs text-gray-500'>
        Chain: {CHAIN_IDS_TO_CHAINS[transaction.chain_id] || 'Unknown'}
      </div>
      <div className='mt-1 text-xs text-gray-500'>
        {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
      </div>
    </div>
  )
}

const TransactionsDropdown: React.FC<TransactionsProps> = ({
  transactions,
  userId,
  selectOffer,
}) => {
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
        <div className='absolute max-h-96 right-0 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-10 flex flex-col'>
          <div
            className={`min-h-[350px] flex flex-col flex-grow w-full overflow-y-auto hide-scrollbar ${transactions.length === 0 ? 'justify-center' : ''}`}
          >
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  userId={userId}
                  selectOffer={selectOffer}
                />
              ))
            ) : (
              <div className='flex flex-col items-center justify-center h-full p-6 text-center'>
                <Chain className='w-12 h-12' />
                <h3 className='text-lg font-semibold my-2'>No Swaps</h3>
                <p className='text-sm text-gray-500 px-6'>
                  This is where you&apos;ll see all your on-chain activity. When you agree to a
                  swap, it will show up here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsDropdown
