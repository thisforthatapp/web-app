import React from 'react'
import { NFTOfferMetadata, OfferFeedItem, Profile } from '@/types/supabase'
import { timeAgoShort } from '@/utils/helpers'

interface NFTOfferItemProps {
  item: OfferFeedItem
  viewOffer: (offer: OfferFeedItem) => void
  currentUserId: string
}

const UserInfo: React.FC<{ user: Profile }> = ({ user }) => (
  <div className='flex items-center space-x-2'>
    <div className='relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm'>
      <img
        src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user.profile_pic_url}
        alt={user.username}
        className='w-full h-full object-cover'
      />
    </div>
    <span className='font-semibold text-sm text-gray-800'>{user.username}</span>
  </div>
)

const NFTGrid: React.FC<{ offerId: string; nfts: NFTOfferMetadata[] }> = ({
  offerId,
  nfts,
}) => {
  const gridClass = nfts.length === 1 ? 'grid-cols-1' : 'grid-cols-2'

  return (
    <div className={`grid ${gridClass} gap-1 p-2 h-full`}>
      {nfts.map((nft) => (
        <div
          key={nft.id}
          className='w-full aspect-square rounded-md overflow-hidden shadow-sm relative group'
        >
          <img
            src={nft.image}
            alt={nft.name}
            className='w-full h-full object-cover transition-transform duration-200 group-hover:scale-110'
          />
          <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-2'>
            <span className='text-white text-sm font-semibold break-words text-center'>
              {nft.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const NFTOfferItem: React.FC<NFTOfferItemProps> = ({ item, viewOffer, currentUserId }) => {
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
      className='flex flex-col shadow-lg overflow-hidden rounded-lg cursor-pointer relative transition-all duration-200 hover:shadow-xl'
      onClick={() => viewOffer(item)}
    >
      <div className='flex items-center px-4 py-3 bg-white'>
        <div className='flex-1 flex justify-start'>
          <UserInfo user={item.user} />
        </div>
        <div className='flex-1 flex justify-end'>
          <UserInfo user={item.counter_user} />
        </div>
      </div>
      <div className='flex w-full bg-gray-100'>
        <div className='w-1/2 flex flex-col'>
          <NFTGrid offerId={item.id} nfts={(item.offer as { user: NFTOfferMetadata[] }).user} />
        </div>
        <div className='w-1/2 flex flex-col'>
          <NFTGrid
            offerId={item.id}
            nfts={(item.offer as { userCounter: NFTOfferMetadata[] }).userCounter}
          />
        </div>
      </div>
      <div className='bg-white text-gray-700 p-3 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          🕒
          <span className='ml-1'>
            Waiting for <span className='font-semibold'>{waitingForUser.username}</span>
          </span>
        </div>
        <span className='text-sm text-gray-500'>{timeAgoShort(new Date(item.updated_at))}</span>
      </div>
    </div>
  )
}

export default NFTOfferItem
