'use client'

import { FC, useEffect, useRef, useState } from 'react'

import { Etherscan, Opensea, Options as OptionsIcon } from '@/icons'
import { chainInfoMap, getBlockExplorerUrl, getOpenSeaUrl } from '@/utils/helpers'

interface OptionsProps {
  chainId: string
  collectionContract: string
  tokenId: string
}

const NftOptions: FC<OptionsProps> = ({ chainId, collectionContract, tokenId }) => {
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

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(!isOpen)
  }

  const options: {
    label: string
    logo: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
    getUrl: () => string
  }[] = [
    {
      label: 'OpenSea',
      logo: Opensea,
      getUrl: () => getOpenSeaUrl(chainId, collectionContract, tokenId),
    },
    {
      label: chainId ? chainInfoMap[chainId].explorerName : '',
      logo: Etherscan,
      getUrl: () => getBlockExplorerUrl(chainId, collectionContract, tokenId),
    },
  ]

  return (
    <div className='relative mr-3 mt-2' ref={dropdownRef}>
      <button type='button' onClick={toggleDropdown} aria-label='More options'>
        <OptionsIcon className='text-white' />
      </button>

      {isOpen && (
        <div className='absolute mt-[-4px] right-[-8px] w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10'>
          <div className='py-1' role='menu' aria-orientation='vertical'>
            {options.map((option) => (
              <button
                key={option.label}
                onClick={(e) => {
                  e.preventDefault()
                  window.open(option.getUrl(), '_blank', 'noopener,noreferrer')
                  setIsOpen(false)
                }}
                className='flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200'
                role='menuitem'
              >
                <div className='flex items-center'>
                  <option.logo className='w-5 h-5 mr-2' />
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NftOptions
