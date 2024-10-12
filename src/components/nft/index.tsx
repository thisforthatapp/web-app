'use client'

import React, { FC, useEffect, useState } from 'react'
import Link from 'next/link'

import { NftOptions, OfferFeedItem, VerifiedBadge } from '@/components/shared'
import { Etherscan, Opensea } from '@/icons'
import { CHAIN_IDS_TO_CHAINS, GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

interface NFTComponentProps {
  nft: any
}

const NFTComponent: FC<NFTComponentProps> = ({ nft }) => {
  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchItems = async (page: number) => {
    const { data, error } = await supabase
      .from('nfts_offers')
      .select(
        '*, user_offers!nfts_offers_offer_id_fkey(*, user:user_profile!user_offers_user_id_fkey(*), counter_user:user_profile!user_offers_user_id_counter_fkey(*))',
      )
      .eq('nft_id', nft.id)
      .order('updated_at', { ascending: false })
      .range((page - 1) * GRID_ITEMS_PER_PAGE, page * GRID_ITEMS_PER_PAGE - 1)

    if (error) {
      console.error('Error fetching items:', error)
      return
    }

    if (page === 1) {
      setItems(data)
    } else {
      setItems((prevOffers) => {
        const newOffers = data.filter(
          (newOffer: any) =>
            !(prevOffers as any[]).some((prevOffer) => prevOffer.id === newOffer.id),
        )
        return [...prevOffers, ...newOffers]
      })
    }

    setHasMore(data.length === GRID_ITEMS_PER_PAGE)
  }

  useEffect(() => {
    fetchItems(1)
    setPage(1)
  }, [])

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex overflow-y-auto'>
      <div className='mt-6 md:my-0 w-full bg-[#f9f9f9] flex flex-col md:flex-row justify-start md:justify-center md:gap-4 md:gap-8 p-0 md:p-8 pb-24 md:pb-8'>
        <NFTImage nft={nft} />
        <div className='flex flex-col flex-grow max-w-3xl px-4 md:px-0'>
          <NFTTitle />
          <OffersGrid items={items} />
          <div className='h-[100px] md:hidden' />
        </div>
      </div>
      <MobileActionButtons />
    </div>
  )
}

const NFTImage: FC<{ nft: any }> = ({ nft }) => (
  <div className='w-full md:w-[360px] flex flex-col md:sticky md:top-8'>
    <div className='bg-white rounded-lg shadow-md mb-4 mx-4 md:mx-0'>
      <div className='relative'>
        <VerifiedBadge
          id={nft.id}
          chainName={CHAIN_IDS_TO_CHAINS[nft.chain_id as keyof typeof CHAIN_IDS_TO_CHAINS]}
          collectionName={nft.collection_name}
          tokenId={nft.token_id}
          isVerified={true}
          className='absolute left-2 top-2 z-10 w-12 h-12'
        />
        <img
          src={nft?.image}
          alt='NFT'
          className='w-full h-auto object-cover md:object-contain md:max-h-[360px] rounded-t-lg'
        />
        <div className='absolute top-2 right-2'>
          <NftOptions chainId={''} collectionContract={''} tokenId={''} />
        </div>
      </div>
      <div className='py-4 flex items-center justify-center'>
        <div className='flex items-center'>
          <img
            src={
              process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + nft.user_profile.profile_pic_url
            }
            alt={nft.user_profile.username}
            className='w-8 h-8 rounded-full'
          />
          <div className='text-xl font-bold ml-2'>{nft.user_profile.username}</div>
        </div>
      </div>
    </div>
    <ExternalLinks />
    <ActionButtons className='hidden md:flex' />
  </div>
)

const ExternalLinks: FC = () => (
  <div className='flex flex-row md:flex-col gap-2 px-4 md:px-0 mb-4'>
    <div className='flex-1 bg-white p-4 flex items-center shadow-md rounded-md cursor-pointer hover:bg-gray-50 transition-colors'>
      <Opensea className='w-10 h-10' />
      <div className='ml-3'>View On Opensea</div>
    </div>
    <div className='flex-1 bg-white p-4 flex items-center shadow-md rounded-md cursor-pointer hover:bg-gray-50 transition-colors'>
      <Etherscan className='w-10 h-10' />
      <div className='ml-3'>View On Etherscan</div>
    </div>
  </div>
)

const NFTTitle: FC = () => (
  <div className='w-full bg-white p-4 flex items-center justify-center border border-gray-200 mb-4 rounded-md font-semibold text-xl'>
    🤝 Offers for CryptoPunk #1658
  </div>
)

const OffersGrid: FC<{ items: any[] }> = ({ items }) => (
  <div className='md:overflow-y-auto hide-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0 md:pb-4'>
    {items.map((item) => (
      <OfferFeedItem key={item.id} item={item.user_offers} viewOffer={() => {}} />
    ))}
  </div>
)

const ActionButtons: FC<{ className?: string }> = ({ className }) => (
  <div className={`flex gap-4 ${className}`}>
    <ActionButton
      emoji='📌'
      text='Pin'
      onClick={() => {}}
      className='bg-red-50 hover:bg-red-100'
    />
    <ActionButton
      emoji='🤝'
      text='Offer'
      onClick={() => {}}
      className='bg-yellow-50 hover:bg-yellow-100'
    />
  </div>
)

const MobileActionButtons: FC = () => (
  <div className='fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg md:hidden'>
    <ActionButtons />
  </div>
)

const ActionButton: FC<{
  emoji: string
  text: string
  onClick: () => void
  className: string
}> = ({ emoji, text, onClick, className }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 px-4 rounded-md transition-colors duration-200 shadow-md flex items-center justify-center ${className}`}
  >
    <span className='text-2xl mr-2'>{emoji}</span>
    <span className='text-gray-800 text-lg font-semibold'>{text}</span>
  </button>
)

export default NFTComponent
