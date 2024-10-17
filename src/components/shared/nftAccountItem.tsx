import React from 'react'
import Link from 'next/link'

import { NFTImage, VerifiedBadge } from '@/components/shared'
import { UserNFT } from '@/types/supabase'
import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'

interface NFTItemProps {
  item: UserNFT
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

const NFTAccountItem: React.FC<NFTItemProps> = ({ item }) => {
  return (
    <Link href={`/nft/${item.nfts.id}`}>
      <NFTImageWrapper item={item} />
    </Link>
  )
}

export default NFTAccountItem
