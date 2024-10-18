import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { ChainLogo, Etherscan, Opensea, Verified } from '@/icons'
import { getBlockExplorerUrl, getOpenSeaUrl } from '@/utils/helpers'

interface NFTInfoPopupProps {
  id: string
  name: string
  isVerified: boolean
  chainId: string
  chainName: string
  collectionName: string
  collectionContract: string
  tokenId: string
  className?: string
}

const VerifiedBadge: React.FC<NFTInfoPopupProps> = ({
  name,
  isVerified,
  chainId,
  chainName,
  collectionContract,
  tokenId,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const togglePopup = () => setIsOpen(!isOpen)

  const options = [
    {
      label: 'View on OpenSea',
      logo: Opensea,
      getUrl: () => getOpenSeaUrl(chainId, collectionContract, tokenId),
    },
    {
      label: 'View on Explorer',
      logo: Etherscan,
      getUrl: () => getBlockExplorerUrl(chainId, collectionContract, tokenId),
    },
  ]

  return (
    <div className={`relative ${className}`}>
      <motion.button
        ref={buttonRef}
        type='button'
        onClick={(e) => {
          e.preventDefault()
          togglePopup()
        }}
        className='focus:outline-none w-full h-full'
        aria-label='NFT Information'
        whileHover={{ scale: 1.1, rotate: 12 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Verified isVerified={isVerified} className='w-full h-full' />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className='fixed z-[100] w-52 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 overflow-hidden'
            style={{
              top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom : 0,
              left: buttonRef.current
                ? buttonRef.current.getBoundingClientRect().left - 160
                : 0,
            }}
          >
            <div className='p-3.5'>
              <div className='text-base font-semibold text-gray-900 truncate mb-1'>{name}</div>
              <div className='space-y-1.5'>
                <div>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-1 ${
                      isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className='flex items-center space-x-1.5 text-sm text-gray-600'>
                  <ChainLogo chainId={Number(chainId)} className='w-4 h-4' />
                  <span>{chainName}</span>
                </div>
              </div>
            </div>
            <div className='border-t border-gray-200'>
              {options.map((option) => (
                <button
                  key={option.label}
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(option.getUrl(), '_blank', 'noopener,noreferrer')
                    togglePopup()
                  }}
                  className='flex items-center w-full px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200'
                >
                  <option.logo className='w-4 h-4 mr-2.5' />
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
