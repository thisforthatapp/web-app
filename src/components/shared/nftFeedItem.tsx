import { FC } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { NFTImage, NftOptions, VerifiedBadge } from '@/components/shared'
import { NFTFeedItem as NFTFeedItemType } from '@/types/supabase'
import { CHAIN_IDS_TO_CHAINS } from '@/utils/constants'

interface NFTItemProps {
  item: NFTFeedItemType
  makeOffer: (nft: NFTFeedItemType) => void
  pinItem: (nft: NFTFeedItemType) => void
}

const NFTFeedItem: FC<NFTItemProps> = ({ item, makeOffer, pinItem }) => {
  const router = useRouter()

  const navigateToUser = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    router.push(`/${item.nft_user_id_username}`)
  }

  return (
    <Link href={`/nft/${item.nft_id}`}>
      <div className='bg-white rounded-lg shadow-md overflow-hidden relative'>
        <div className='absolute top-1 right-1 z-10'>
          <NftOptions
            chainId={item.nft_chain_id.toString()}
            collectionContract={item.nft_collection_contract}
            tokenId={item.nft_token_id}
          />
        </div>
        <VerifiedBadge
          id={item.nft_id}
          chainName={CHAIN_IDS_TO_CHAINS[item.nft_chain_id as keyof typeof CHAIN_IDS_TO_CHAINS]}
          collectionName={item.nft_collection_name}
          tokenId={item.nft_token_id}
          isVerified={item.nft_is_verified}
          className='absolute left-1 top-1 z-10 w-10 h-10'
        />
        <NFTImage src={item.nft_image} alt={item.nft_name} fallback={item.nft_name} />
        <div className='flex justify-between px-3 py-3'>
          <div className='flex items-center justify-center w-full' onClick={navigateToUser}>
            <img
              src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL}${item?.nft_user_id_profile_pic_url}`}
              alt={item?.nft_user_id_username}
              className='w-6 h-6 rounded-full'
            />
            <span className='text-lg ml-2 text-gray-700 font-semibold'>
              {item?.nft_user_id_username}
            </span>
          </div>
        </div>
      </div>
      <div className='mt-2 flex gap-x-2 gap-y-2 w-full p-1 overflow-hidden'>
        <div className='flex w-full gap-x-2'>
          <button
            className={`w-full flex justify-center items-center bg-red-50 px-3 py-2 rounded-md hover:bg-red-100 transition-colors duration-200 shadow-md`}
            onClick={(e) => {
              e.preventDefault()
              pinItem(item)
            }}
          >
            <span className='flex items-center mr-1 text-2xl'>📌</span>
            <span className='text-lg font-semibold'>Pin</span>
          </button>
          <button
            className='w-full flex justify-center items-center bg-yellow-50 px-3 py-2 rounded-md hover:bg-yellow-100 transition-colors duration-200 shadow-md'
            onClick={(e) => {
              e.preventDefault()
              makeOffer(item)
            }}
          >
            <span className='flex items-center mr-1 text-2xl'>🤝</span>
            <span className='text-gray-800 text-lg font-semibold'>Offer</span>
          </button>
        </div>
      </div>
    </Link>
  )
}

export default NFTFeedItem
