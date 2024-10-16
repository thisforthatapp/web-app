'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { Etherscan, Opensea, Verified } from '@/icons'
import { chainInfoMap, getBlockExplorerUrl, getOpenSeaUrl } from '@/utils/helpers'

interface NFTInfoDropdownProps {
  id: string
  isVerified: boolean
  chainId: string
  chainName: string
  collectionName: string
  collectionContract: string
  tokenId: string
  className?: string
}

const VerifiedBadge: React.FC<NFTInfoDropdownProps> = ({
  id,
  isVerified,
  chainId,
  chainName,
  collectionName,
  collectionContract,
  tokenId,
  className,
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

  const options = [
    {
      label: 'OpenSea',
      logo: Opensea,
      getUrl: () => getOpenSeaUrl(chainId, collectionContract, tokenId),
    },
    {
      label: 'Explorer',
      logo: Etherscan,
      getUrl: () => getBlockExplorerUrl(chainId, collectionContract, tokenId),
    },
  ]

  return (
    <div className={className} ref={dropdownRef}>
      <motion.button
        type='button'
        onClick={(e) => {
          e.preventDefault()
          toggleDropdown()
        }}
        className='focus:outline-none'
        aria-label='NFT Information'
        whileHover={{ scale: 1.1, rotate: 12 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Verified isVerified={isVerified} className='w-10 h-10' />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className='absolute mt-[-5px] z-50 w-40 right-[5px] rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 overflow-hidden'
          >
            <div className='p-4 space-y-3'>
              <p className='text-sm font-medium text-gray-900 dark:text-white'>
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${isVerified ? 'bg-blue-500' : 'bg-red-500'}`}
                ></span>
                {isVerified ? 'Verified' : 'Unverified'}
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                <span className='font-medium'>Chain:</span> {chainName}
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                <span className='font-medium'>Collection:</span> {collectionName || '-'}
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                <span className='font-medium'>ID:</span>{' '}
                {tokenId.length > 12 ? `${tokenId.substring(0, 12)}...` : tokenId}
              </p>
            </div>
            <div className='border-t border-gray-200 dark:border-gray-700'>
              {options.map((option, index) => (
                <button
                  key={option.label}
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(option.getUrl(), '_blank', 'noopener,noreferrer')
                    toggleDropdown()
                  }}
                  className={`flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                    index === 0 ? 'rounded-b-lg' : ''
                  }`}
                  role='menuitem'
                >
                  <option.logo className='w-5 h-5 mr-3' />
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VerifiedBadge
