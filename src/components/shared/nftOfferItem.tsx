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
  <div
    className={`flex items-center space-x-2 ${isRight ? 'flex-row-reverse space-x-reverse' : ''}`}
  >
    <Link
      href={`/${user.username}`}
      target='_blank'
      onClick={(e) => e.stopPropagation()}
      className='relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0'
    >
      <img
        src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL}${user.profile_pic_url}`}
        alt={user.username}
      />
    </Link>
    <span className='font-semibold text-sm truncate'>{user.username}</span>
  </div>
)

const NFTGrid: React.FC<{ nfts: NFTOfferMetadata[] }> = ({ nfts }) => {
  const getGridSize = (count: number) => {
    if (count <= 1) return 1
    if (count <= 4) return 2
    return 3
  }

  const gridSize = getGridSize(nfts.length)
  const totalCells = gridSize * gridSize

  return (
    <div
      className='grid gap-2 p-2 w-full aspect-square'
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {Array(totalCells)
        .fill(null)
        .map((_, index) => (
          <div key={index} className='w-full h-full'>
            {index < nfts.length ? (
              <NFTImage
                src={nfts[index].image}
                alt={nfts[index].name}
                fallback={nfts[index].name}
                rounded='all'
                hoverOn={false}
              />
            ) : (
              <div className='w-full h-full bg-gray-100 rounded-lg' />
            )}
          </div>
        ))}
    </div>
  )
}

const NFTOfferItem: React.FC<NFTOfferItemProps> = ({ item, userId, viewOffer }) => {
  const isMyTurn = userId === null ? false : item.offer_user_id !== userId
  const userToAct = item.offer_user_id === item.user_id ? item.counter_user : item.user

  return (
    <div
      className='w-full bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg'
      onClick={() => viewOffer(item)}
    >
      <div className='flex p-4 space-x-4'>
        <div className='w-1/2 space-y-3'>
          <UserInfo user={item.user} />
          <NFTGrid nfts={(item.offer as { user: NFTOfferMetadata[] }).user} />
        </div>
        <div className='w-1/2 space-y-3'>
          <UserInfo user={item.counter_user} isRight />
          <NFTGrid nfts={(item.offer as { userCounter: NFTOfferMetadata[] }).userCounter} />
        </div>
      </div>
      <div className='px-4 py-3 bg-white flex justify-between items-center'>
        <div
          className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            isMyTurn ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isMyTurn ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className='text-sm font-medium'>
            {isMyTurn ? 'Your turn' : `${userToAct.username}'s turn`}
          </span>
        </div>
        <span className='text-sm text-gray-500'>{timeAgoShort(new Date(item.updated_at))}</span>
      </div>
    </div>
  )
}

export default NFTOfferItem
