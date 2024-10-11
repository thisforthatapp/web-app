import React, { FC } from 'react'
import Link from 'next/link'

import { NFTImage } from '@/components/shared'
import { OfferFeedItem as OfferFeedItemType } from '@/types/supabase'
import { timeAgoShort } from '@/utils/helpers'

interface NFT {
  id: string
  imageUrl: string
}

interface User {
  username: string
  profilePicUrl: string
}

interface OfferFeedItemType {
  user: User
  counterUser: User
  userNFTs: NFT[]
  counterUserNFTs: NFT[]
  status: 'negotiating' | 'accepted' | 'rejected'
}

interface OfferItemProps {
  item: OfferFeedItemType
  expandOffer: (offer: OfferFeedItemType) => void
}

const NFTGrid: FC<{ nfts: NFT[] }> = ({ nfts }) => {
  const gridClass =
    nfts.length === 1 ? 'grid-cols-1' : nfts.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className={`grid ${gridClass}`}>
      {nfts.map((nft) => (
        <div key={nft.id} className='w-full h-full object-cover overflow-hidden'>
          <NFTImage src={nft.image} alt={nft.name} fallback={nft.name} />
        </div>
      ))}
    </div>
  )
}

const UserInfo: FC<{ user: User }> = ({ user }) => (
  <div className='flex items-center justify-center p-2 mt-auto bg-white'>
    <img
      src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user.profile_pic_url}
      alt={user.username}
      className='w-8 h-8 rounded-full mr-2'
    />
    <span className='text-sm font-semibold'>{user.username}</span>
  </div>
)

const ArrowLeftRight: FC = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M8 3L4 7l4 4' />
    <path d='M4 7h16' />
    <path d='m16 21 4-4-4-4' />
    <path d='M20 17H4' />
  </svg>
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
          <NFTGrid nfts={item.offer.user} />
          <UserInfo user={item.user} />
        </div>
        <div className='absolute left-[50%] h-full bg-gray-100 w-[1px]' />
        <div className='w-1/2 flex flex-col '>
          <NFTGrid nfts={item.offer.userCounter} />
          <UserInfo user={item.counter_user} />
        </div>
      </div>
    </div>
  )
}

export default OfferFeedItem
