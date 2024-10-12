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
      className='flex flex-col shadow-lg overflow-hidden rounded-lg cursor-pointer relative bg-white'
      onClick={() => viewOffer(item)}
    >
      <div className='flex justify-between items-center px-3 py-2 bg-gray-50 border-b border-gray-200'>
        <div className='flex items-center space-x-4'>
          <UserInfo user={item.user} />
          <ArrowLeftRight className='w-4 h-4 text-gray-400' />
          <UserInfo user={item.counter_user} />
        </div>
        <div className='flex items-center text-xs text-gray-500'>
          {/* <Clock className='w-4 h-4 mr-1' /> */}
          {timeAgoShort(new Date(item.updated_at))}
        </div>
      </div>
      <div className='flex w-full bg-white'>
        <div className='w-1/2 flex flex-col'>
          <NFTGrid offerId={item.id} nfts={(item.offer as { user: NFTOfferMetadata[] }).user} />
        </div>
        {/* <div className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md'>
          <ArrowLeftRight className='w-6 h-6 text-gray-600' />
        </div> */}
        <div className='w-1/2 flex flex-col border-l border-gray-200'>
          <NFTGrid
            offerId={item.id}
            nfts={(item.offer as { userCounter: NFTOfferMetadata[] }).userCounter}
          />
        </div>
      </div>
      <div className='bg-gray-50 text-gray-700 font-semibold py-2 px-3 text-sm text-center border-t border-gray-200'>
        Waiting for {waitingForUser.username} to respond...
      </div>
    </div>
  )
}

export default OfferFeedItem
