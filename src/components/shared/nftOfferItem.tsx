import React from 'react'
import Link from 'next/link'

import { NFTImage } from '@/components/shared'
import { NFTOfferMetadata, OfferFeedItem, Profile } from '@/types/supabase'
import { timeAgoShort } from '@/utils/helpers'

interface NFTOfferItemProps {
  item: OfferFeedItem
  userId: string | null
  viewOffer: (offer: OfferFeedItem) => void
}

const UserInfo: React.FC<{ user: Profile; isRight?: boolean }> = ({
  user,
  isRight = false,
}) => (
  <div className={`flex items-center space-x-2 ${isRight ? 'flex-row-reverse' : ''}`}>
    <Link
      href={`/${user.username}`}
      target='_blank'
      onClick={(e) => e.stopPropagation()}
      className={`relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm ${isRight ? 'ml-2' : ''}`}
    >
      <img
        src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user.profile_pic_url}
        alt={user.username}
        className='w-full h-full object-cover'
      />
    </Link>
    <span className={`font-semibold text-sm text-gray-800 ${isRight ? 'mr-2' : ''}`}>
      {user.username}
    </span>
  </div>
)

const NFTGrid: React.FC<{ nfts: NFTOfferMetadata[] }> = ({ nfts }) => {
  const gridClass = nfts.length === 1 ? 'grid-cols-1' : 'grid-cols-2'

  return (
    <div className={`grid ${gridClass} gap-1 p-2 h-full`}>
      {nfts.map((nft) => (
        <NFTImage
          key={nft.id}
          src={nft.image}
          alt={nft.name}
          fallback={nft.name}
          rounded='all'
          hoverOn={false}
        />
      ))}
    </div>
  )
}

const NFTOfferItem: React.FC<NFTOfferItemProps> = ({ item, userId, viewOffer }) => {
  const isMyTurn = userId === null ? false : item.offer_user_id !== userId
  const userToAct = item.offer_user_id === item.user_id ? item.counter_user : item.user

  return (
    <div
      className='flex flex-col shadow-lg overflow-hidden rounded-lg cursor-pointer relative transition-all duration-200 hover:shadow-xl'
      onClick={() => viewOffer(item)}
    >
      <div className='flex items-center px-4 py-2 bg-white'>
        <div className='flex-1 flex justify-start'>
          <UserInfo user={item.user} />
        </div>
        <div className='flex-1 flex justify-end'>
          <UserInfo user={item.counter_user} isRight />
        </div>
      </div>
      <div className='flex w-full bg-gray-100'>
        <div className='w-1/2 flex flex-col'>
          <NFTGrid nfts={(item.offer as { user: NFTOfferMetadata[] }).user} />
        </div>
        <div className='w-1/2 flex flex-col'>
          <NFTGrid nfts={(item.offer as { userCounter: NFTOfferMetadata[] }).userCounter} />
        </div>
      </div>
      <div
        className={`p-3 mt-auto flex items-center justify-between ${isMyTurn ? 'bg-blue-50' : 'bg-white'}`}
      >
        <div className='flex items-center space-x-2'>
          <div
            className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}
          ></div>
          <span className={`font-semibold ${isMyTurn ? 'text-blue-700' : 'text-gray-700'}`}>
            {isMyTurn ? 'Your turn to respond' : `Waiting for ${userToAct.username}`}
          </span>
        </div>
        <div className='flex items-center space-x-2'>
          <span className='text-sm text-gray-500'>
            {timeAgoShort(new Date(item.updated_at))}
          </span>
        </div>
      </div>
    </div>
  )
}

export default NFTOfferItem
