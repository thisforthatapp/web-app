'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

import { NFTOfferDisplay } from '@/components/shared'
import { Chain } from '@/icons'
import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'

interface TransactionProps {
  transaction: {
    id: string
    user_id: string
    status: 'in_progress' | 'completed'
    chain_id: string
    created_at: string
    offer: {
      user: any[]
      userCounter: any[]
    }
    user: {
      username: string
      profile_pic_url: string
    }
    counter_user: {
      username: string
      profile_pic_url: string
    }
    progress: {
      user: { deposited: number; total: number }
      counter_user: { deposited: number; total: number }
    }
  }
  userId: string
  selectOffer: (id: string) => void
}

const ProgressBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => (
  <div className='w-full bg-gray-200 rounded-full h-2'>
    <div
      className={`${color} h-2 rounded-full transition-all duration-500 ease-in-out`}
      style={{ width: `${progress}%` }}
    ></div>
  </div>
)

const FeedItem: React.FC<TransactionProps> = ({ transaction, userId, selectOffer }) => {
  const isCurrentUser = transaction.user_id === userId
  const counterParty = isCurrentUser ? transaction.counter_user : transaction.user
  const currentUser = isCurrentUser ? transaction.user : transaction.counter_user

  // Placeholder progress values
  const placeholderProgress = {
    user: { deposited: 2, total: 3 },
    counter_user: { deposited: 1, total: 2 },
  }

  const progress = placeholderProgress
  const userProgress = isCurrentUser ? progress.user : progress.counter_user
  const counterUserProgress = isCurrentUser ? progress.counter_user : progress.user

  const userProgressPercentage = (userProgress.deposited / userProgress.total) * 100
  const counterUserProgressPercentage =
    (counterUserProgress.deposited / counterUserProgress.total) * 100

  return (
    <div
      className='p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200 group w-full'
      onClick={() => selectOffer(transaction.id)}
    >
      <div className='flex items-center justify-between w-full mb-4'>
        <div className='flex items-center space-x-3'>
          <Link
            href={`/${counterParty.username}`}
            target='_blank'
            onClick={(e) => e.stopPropagation()}
            className='shrink-0'
          >
            <img
              src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + counterParty.profile_pic_url}
              alt={counterParty.username}
              className='w-10 h-10 rounded-full'
            />
          </Link>
          <div>
            <div className='text-sm font-semibold'>Swap with {counterParty.username}</div>
            <div className='text-xs text-gray-500'>
              {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
        <div className='text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-800'>
          {CHAIN_IDS_TO_CHAINS[transaction.chain_id] || 'Unknown Chain'}
        </div>
      </div>

      <div className='space-y-2 mb-4'>
        <div className='flex justify-between items-center'>
          <span className='text-sm font-medium'>{currentUser.username}</span>
          <span className='text-sm'>
            {userProgress.deposited}/{userProgress.total} deposited
          </span>
        </div>
        <ProgressBar progress={userProgressPercentage} color='bg-blue-500' />

        <div className='flex justify-between items-center'>
          <span className='text-sm font-medium'>{counterParty.username}</span>
          <span className='text-sm'>
            {counterUserProgress.deposited}/{counterUserProgress.total} deposited
          </span>
        </div>
        <ProgressBar progress={counterUserProgressPercentage} color='bg-purple-500' />
      </div>

      <div className='flex justify-between items-center text-sm mb-4'>
        <span className='font-medium'>
          Status:{' '}
          <span
            className={transaction.status === 'completed' ? 'text-green-500' : 'text-blue-500'}
          >
            {transaction.status === 'completed' ? 'Completed' : 'In Progress'}
          </span>
        </span>
        <span className='text-blue-500 group-hover:underline'>View Details</span>
      </div>

      <div className='w-full'>
        <NFTOfferDisplay
          userAOffers={transaction.offer.user}
          userBOffers={transaction.offer.userCounter}
          size='medium'
        />
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
        className='h-full w-[45px] rounded-md bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors'
      >
        <Chain className='w-[40px] h-[40px]' />
        {transactions.length > 0 && (
          <span className='z-10 absolute top-[4px] right-[4px] inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full'>
            {transactions.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-10'>
          <div className='flex flex-col h-[480px]'>
            {' '}
            {/* Fixed height for the dropdown */}
            {/* Header */}
            <div className='p-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold'>Transactions</h3>
            </div>
            {/* Scrollable content */}
            <div className='flex-grow overflow-y-auto hide-scrollbar'>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <FeedItem
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
                    This is where you&apos;ll see all your onchain activity. When you agree to a
                    swap, it will show up here.
                  </p>
                </div>
              )}
            </div>
            {/* Footer */}
            <div className='p-4 border-t border-gray-200'>
              <Link
                href='/transactions'
                className='text-blue-500 hover:underline text-sm font-medium'
              >
                Show All Transactions
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsDropdown
