import React from 'react'

import NFTImage from './nftImage'

const formatItems = (items, decoration) => {
  return items.map((nft, index) => (
    <React.Fragment key={nft.id}>
      <span
        className={`font-semibold text-gray-800 hover:underline cursor-pointer underline decoration-2 ${decoration}`}
      >
        {nft.name}
      </span>
      {index < items.length - 1 && ', '}
    </React.Fragment>
  ))
}

const NFTOfferDisplay = ({ item }) => {
  const userItems = item.metadata.offer
    ? formatItems(item.metadata.offer.user, 'decoration-red-500')
    : null
  const counterUserItems = item.metadata.offer
    ? formatItems(item.metadata.offer.userCounter, 'decoration-blue-500')
    : null

  return (
    <>
      <div>
        🤝 offering <span>{userItems}</span> for <span>{counterUserItems}</span>
      </div>
      <div className='flex flex-wrap gap-2 mt-4'>
        {item.metadata.offer.user.map((nft) => (
          <div
            key={nft.id}
            className='w-12 h-12 object-cover rounded-md border-4 border-red-500 overflow-hidden'
          >
            <NFTImage
              key={nft.id}
              src={nft.image}
              alt={nft.name}
              fallback={nft.name.substring(0, 4) + '...'}
            />
          </div>
        ))}
        {item.metadata.offer.userCounter.map((nft) => (
          <div
            key={nft.id}
            className='w-12 h-12 object-cover rounded-md border-4 border-blue-500 '
          >
            <NFTImage
              key={nft.id}
              src={nft.image}
              alt={nft.name}
              fallback={nft.name.substring(0, 3) + '...'}
            />
          </div>
        ))}
      </div>
    </>
  )
}

export default NFTOfferDisplay
