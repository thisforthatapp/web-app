import React from 'react'
import Link from 'next/link'

import { NFTImage, VerifiedBadge } from '@/components/shared'
import { Tag } from '@/icons'
import { UserNFT } from '@/types/supabase'
import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'

interface NFTItemProps {
  item: UserNFT
  toggleForSwap: () => void
}

const NFTImageWrapper: React.FC<{ item: UserNFT }> = ({ item }) => (
  <div className='flex flex-col bg-white shadow-md overflow-hidden relative'>
    <VerifiedBadge
      id={item.nft_id}
      chainName={CHAIN_IDS_TO_CHAINS[item.nfts.chain_id as keyof typeof CHAIN_IDS_TO_CHAINS]}
      collectionName={item.nfts.collection_name}
      tokenId={item.nfts.token_id}
      isVerified={item.nfts.is_verified && item.nfts.user_id === item.user_id}
      className='inline-block absolute right-0 top-2 z-10 w-12 h-12'
      chainId={item.nfts.chain_id.toString()}
      collectionContract={item.nfts.collection_contract}
    />
    <NFTImage
      src={item.nfts.image}
      alt={item.nfts.name}
      rounded='all'
      fallback={item.nfts.name}
    />
  </div>
)

const SwapStatusButton: React.FC<{
  forSwap: boolean
  onClick: (e: React.MouseEvent) => void
}> = ({ forSwap, onClick }) => (
  <div
    className={`${
      forSwap ? 'bg-green-300' : 'bg-gray-100'
    } mt-3 flex gap-x-2 gap-y-2 w-full flex justify-center items-center overflow-hidden px-1 py-2.5 rounded-md transition-colors duration-200 shadow-md`}
    onClick={onClick}
  >
    <Tag className={`w-6 h-6 ${forSwap ? 'text-green-600' : 'text-gray-900'}`} />
    <span className='text-lg font-semibold'>Let&apos;s Trade</span>
  </div>
)

const NFTAccountItem: React.FC<NFTItemProps> = ({ item, toggleForSwap }) => {
  const handleSwapToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleForSwap()
  }

  return (
    <Link href={`/nft/${item.nfts.id}`}>
      <NFTImageWrapper item={item} />
      <SwapStatusButton forSwap={item.for_swap} onClick={handleSwapToggle} />
    </Link>
  )
}

export default NFTAccountItem
