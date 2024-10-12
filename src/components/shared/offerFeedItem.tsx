import React, { FC } from 'react'

import { NFTImage } from '@/components/shared'
import { ArrowLeftRight } from '@/icons'
import { NFTOfferMetadata, OfferFeedItem as OfferFeedItemType, Profile } from '@/types/supabase'

interface OfferItemProps {
  item: OfferFeedItemType
  expandOffer: (offer: OfferFeedItemType) => void
}

const NFTGrid: FC<{ offerId: string; nfts: NFTOfferMetadata[] }> = ({ offerId, nfts }) => {
  const gridClass =
    nfts.length === 1 ? 'grid-cols-1' : nfts.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className={`grid ${gridClass}`}>
      {nfts.map((nft) => (
        <div key={nft.id} className='w-full h-full object-cover overflow-hidden'>
          <NFTImage
            src={nft.image}
            alt={nft.name}
            fallback={nft.name}
            showTooltip={true}
            tooltipId={offerId + '_' + nft.id}
            tooltipText={nft.name}
          />
        </div>
      ))}
    </div>
  )
}

const UserInfo: FC<{ user: Profile }> = ({ user }) => (
  <div className='flex items-center justify-center p-2 mt-auto bg-white'>
    <img
      src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user.profile_pic_url}
      alt={user.username}
      className='w-8 h-8 rounded-full mr-2'
    />
    <span className='font-semibold'>{user.username}</span>
  </div>
)

const OfferFeedItem: FC<OfferItemProps> = ({ item, expandOffer }) => {
  return (
    <div
      className='flex flex-col items-center shadow-md overflow-hidden rounded-md cursor-pointer relative'
      onClick={() => expandOffer(item)}
    >
      <div className='bg-yellow-400 text-yellow-800 font-semibold absolute top-2 right-2 p-1 rounded-md text-sm'>
        negotiating
      </div>
      <div className='flex w-full bg-gray-50'>
        <div className='w-1/2 flex flex-col'>
          <NFTGrid offerId={item.id} nfts={(item.offer as { user: NFTOfferMetadata[] }).user} />
          <UserInfo user={item.user} />
        </div>
        <div className='absolute bottom-[13px] left-[50%] ml-[-12px] z-[100]'>
          <ArrowLeftRight />
        </div>
        <div className='w-1/2 flex flex-col '>
          <NFTGrid
            offerId={item.id}
            nfts={(item.offer as { userCounter: NFTOfferMetadata[] }).userCounter}
          />
          <UserInfo user={item.counter_user} />
        </div>
      </div>
    </div>
  )
}

export default OfferFeedItem
