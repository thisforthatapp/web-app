import React from 'react'

interface NFT {
  id: string
  name: string
  image: string
}

interface NFTOfferDisplayProps {
  userAOffers: NFT[]
  userBOffers: NFT[]
}

const NFTItem: React.FC<{ nft: NFT }> = ({ nft }) => (
  <div className='flex items-center space-x-2 mb-2'>
    <div className='w-10 h-10 relative rounded-md overflow-hidden'>
      <img
        src={nft.image}
        alt={nft.name}
        // layout='fill'
        // objectFit='cover'
        // className='rounded-md'
      />
    </div>
    <span className='text-sm font-semibold'>{nft.name}</span>
  </div>
)

const NFTOfferDisplay: React.FC<NFTOfferDisplayProps> = ({ userAOffers, userBOffers }) => {
  // const userAOffers = item.metadata.offer.user
  // const userBOffers = item.metadata.offer.userCounter

  return (
    <div className='w-full bg-gray-200 px-3 py-1.5 mt-2 rounded-md'>
      <div className='flex flex-col md:flex-row md:space-x-6'>
        <div className='flex-1 mb-4 md:mb-0'>
          {/* <h2 className='mb-4'>danny</h2> */}
          {userAOffers.map((nft) => (
            <NFTItem key={nft.id} nft={nft} />
          ))}
        </div>
        <div className='flex-1'>
          {/* <h2 className='mb-4'>vj</h2> */}
          {userBOffers.map((nft) => (
            <NFTItem key={nft.id} nft={nft} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default NFTOfferDisplay
