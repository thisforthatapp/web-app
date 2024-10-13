import React, { FC } from 'react'

import { NFTImage } from '@/components/shared'
import { ArrowLeftRight, Clock } from '@/icons'
import { NFTOfferMetadata, OfferFeedItem as OfferFeedItemType, Profile } from '@/types/supabase'
import { timeAgoShort } from '@/utils/helpers'

interface OfferItemProps {
  item: OfferFeedItemType
  viewOffer: (offer: OfferFeedItemType) => void
  currentUserId: string
}

const NFTGrid: FC<{ offerId: string; nfts: NFTOfferMetadata[] }> = ({ offerId, nfts }) => {
  const gridClass = nfts.length === 1 ? 'grid-cols-1' : 'grid-cols-2'

  return (
    <div className={`grid ${gridClass} gap-1 p-2 h-full`}>
      {nfts.map((nft, index) => (
        <div
          key={nft.id}
          className={`w-full aspect-square rounded-md overflow-hidden shadow-sm ${
            nfts.length === 2 && index === 1 ? 'col-start-2' : ''
          }`}
        >
          <NFTImage src={nft.image} alt={nft.name} fallback={nft.name} />
        </div>
      ))}
      {nfts.length === 2 && <div className='col-span-2'></div>}
      {nfts.length === 3 && <div></div>}
    </div>
  )
}

const UserInfo: FC<{ user: Profile }> = ({ user }) => (
  <div className='flex items-center'>
    <img
      src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user.profile_pic_url}
      alt={user.username}
      className='w-8 h-8 rounded-full mr-2 border-2 border-white shadow-sm'
    />
    <span className='font-semibold text-sm text-gray-800'>{user.username}</span>
  </div>
)

const OfferFeedItem: FC<OfferItemProps> = ({ item, viewOffer, currentUserId }) => {
  const isMyTurn = item.offer_user_id !== currentUserId
  const waitingForUser = isMyTurn
    ? currentUserId === item.user_id
      ? item.user
      : item.counter_user
    : item.offer_user_id === item.user_id
      ? item.user
      : item.counter_user

  return (
    <div
      className='flex flex-col shadow-lg overflow-hidden rounded-lg cursor-pointer relative'
      onClick={() => viewOffer(item)}
    >
      <div className='flex justify-between items-center px-3 py-2 bg-white border-b border-gray-200'>
        <div className='flex items-center space-x-2'>
          <UserInfo user={item.user} />
          <ArrowLeftRight className='w-4 h-4 text-gray-600' />
          <UserInfo user={item.counter_user} />
        </div>
        <div className='flex items-center text-sm font-semibold text-gray-600 mr-1'>
          {timeAgoShort(new Date(item.updated_at))}
        </div>
      </div>
      <div className='flex w-full bg-white'>
        <div className='w-1/2 flex flex-col'>
          <NFTGrid offerId={item.id} nfts={(item.offer as { user: NFTOfferMetadata[] }).user} />
        </div>
        <div className='w-1/2 flex flex-col border-l border-gray-200'>
          <NFTGrid
            offerId={item.id}
            nfts={(item.offer as { userCounter: NFTOfferMetadata[] }).userCounter}
          />
        </div>
      </div>
      <div className='bg-yellow-100 text-gray-700 p-3 text-center flex-grow'>
        Waiting for <b>{waitingForUser.username}</b> to respond...
      </div>
    </div>
  )
}

export default OfferFeedItem
