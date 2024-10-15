'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Chain } from '@/icons'
import { formatDistanceToNow } from 'date-fns'

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
  currentUserId: string
}

const TransactionItem: React.FC<{ transaction: Transaction; currentUserId: string }> = ({
  transaction,
  currentUserId,
}) => {
  const isCurrentUserInitiator = transaction.user_id === currentUserId
  const tradingPartner = isCurrentUserInitiator
    ? transaction.offer.userCounter[0]
    : transaction.offer.user[0]
  const userNft = isCurrentUserInitiator
    ? transaction.offer.user[0]
    : transaction.offer.userCounter[0]

  return (
    <div className='px-4 py-3 hover:bg-gray-50 border-b border-gray-200'>
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

const TransactionsDropdown: React.FC<TransactionsProps> = ({ transactions, currentUserId }) => {
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
          <span className='z-10 absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-green-500 rounded-full'>
            {transactions.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute max-h-96 right-[-105px] mt-[10px] w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-10 flex flex-col'>
          <div className='min-h-[350px] flex flex-col flex-grow w-full overflow-y-auto hide-scrollbar'>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  currentUserId={currentUserId}
                />
              ))
            ) : (
              <div className='flex flex-grow items-center justify-center px-4 py-3 text-sm text-gray-500'>
                No new transactions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsDropdown
