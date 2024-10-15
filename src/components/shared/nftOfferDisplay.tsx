import React from 'react'

interface NFT {
  id: string
  name: string
  image: string
}

interface NFTOfferDisplayProps {
  userAOffers: NFT[]
  userBOffers: NFT[]
  userAName: string
  userBName: string
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
    <div className='flex items-start space-x-2 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'>
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
  userAName,
  userBName,
  size = 'small',
}) => {
  const containerPadding = {
    small: 'p-2',
    medium: 'p-3',
    large: 'p-4',
  }

  return (
    <div className={`w-full bg-gray-100 ${containerPadding[size]} rounded-xl shadow-lg`}>
      <div className='flex gap-x-3'>
        <OfferColumn name={userAName} offers={userAOffers} size={size} />
        <SwapDivider size={size} />
        <OfferColumn name={userBName} offers={userBOffers} size={size} />
      </div>
    </div>
  )
}

const OfferColumn: React.FC<{
  name: string
  offers: NFT[]
  size: 'small' | 'medium' | 'large'
}> = ({ name, offers, size }) => {
  const headerSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  }

  return (
    <div className='w-full'>
      <h2 className={`${headerSizeClasses[size]} font-bold mb-2 text-gray-800`}>{name}</h2>
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
        className={`${sizeClasses[size]} rounded-full bg-blue-500 flex items-center justify-center shadow-md`}
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
