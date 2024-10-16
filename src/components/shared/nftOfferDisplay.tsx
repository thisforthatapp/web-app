import React from 'react'

interface NFT {
  id: string
  image: string
}

interface NFTOfferDisplayProps {
  userAOffers: NFT[]
  userBOffers: NFT[]
  size?: 'small' | 'medium' | 'large'
}

const NFTItem: React.FC<{ nft: NFT; size: 'small' | 'medium' | 'large' }> = ({ nft, size }) => {
  const imageSizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
  }
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  }

  return (
    <div className='flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'>
      <div
        className={`${imageSizeClasses[size]} relative rounded-md overflow-hidden flex-shrink-0`}
      >
        <img src={nft.image} alt={nft.name} className='w-full h-full object-cover' />
      </div>
      <span
        className={`${textSizeClasses[size]} font-medium text-gray-800 break-words flex-grow`}
      >
        {nft.name}
      </span>
    </div>
  )
}

const NFTOfferDisplay: React.FC<NFTOfferDisplayProps> = ({
  userAOffers,
  userBOffers,
  size = 'small',
}) => {
  const containerPadding = {
    small: 'p-2',
    medium: 'p-3',
    large: 'p-4',
  }

  return (
    <div className={`w-full bg-[#fbc01b] ${containerPadding[size]} rounded-xl shadow-md`}>
      <div className='flex gap-x-3'>
        <OfferColumn offers={userAOffers} size={size} />
        <SwapDivider size={size} />
        <OfferColumn offers={userBOffers} size={size} />
      </div>
    </div>
  )
}

const OfferColumn: React.FC<{
  offers: NFT[]
  size: 'small' | 'medium' | 'large'
}> = ({ offers, size }) => {
  return (
    <div className='w-full'>
      <div className='space-y-2'>
        {offers.map((nft) => (
          <NFTItem key={nft.id} nft={nft} size={size} />
        ))}
      </div>
    </div>
  )
}

const SwapDivider: React.FC<{ size: 'small' | 'medium' | 'large' }> = ({ size }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
  }

  return (
    <div className='flex items-center justify-center py-1'>
      <div
        className={`${sizeClasses[size]} rounded-full bg-gray-800 flex items-center justify-center shadow-md`}
      >
        <svg
          className={`w-${size === 'small' ? '4' : '5'} h-${size === 'small' ? '4' : '5'} text-white`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
          />
        </svg>
      </div>
    </div>
  )
}

export default NFTOfferDisplay
