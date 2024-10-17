'use client'

import React, { FC, useEffect, useState } from 'react'
import Link from 'next/link'

import { Offer } from '@/components/modals'
import { NFTImage, NFTOfferItem, VerifiedBadge } from '@/components/shared'
import { ChainLogo, Etherscan, Opensea } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import {
  NFT,
  NFTFeedItem as NFTFeedItemType,
  NFTOffers,
  OfferFeedItem as OfferFeedItemType,
} from '@/types/supabase'
import { CHAIN_IDS_TO_CHAINS, GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { getBlockExplorerUrl, getOpenSeaUrl } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

interface NFTPageProps {
  nft: NFT
  isMobile: boolean
}

const NFTPage: FC<NFTPageProps> = ({ nft }) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [makeOfferItem, setMakeOfferItem] = useState<NFTFeedItemType | null>(null)
  const [viewOfferItem, setViewOfferItem] = useState<OfferFeedItemType | null>(null)

  const [items, setItems] = useState<NFTOffers[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

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
          (newOffer: NFTOffers) =>
            !(prevOffers as NFTOffers[]).some((prevOffer) => prevOffer.id === newOffer.id),
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

  const makeOffer = async (nft: NFT) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    if (nft.user_id === user.id) {
      showToast(`⚠️ You can't make an offer on your own NFT`, 2500)
      return
    }

    const initialNFTOfferItem: NFTFeedItemType = {
      nft_id: nft.id,
      nft_name: nft.name,
      nft_image: nft.image,
      nft_chain_id: nft.chain_id,
      nft_collection_contract: nft.collection_contract,
      nft_token_id: nft.token_id,
      nft_token_type: nft.token_type,
      nft_collection_name: nft.collection_name,
      nft_created_at: nft.created_at,
      nft_thumbnail: nft.thumbnail,
      nft_is_verified: nft.is_verified,
      nft_verified_at: nft.verified_at,
      nft_pins: nft.pins,
      nft_user_id: nft.user_id,
      nft_user_id_username: nft.user_profile.username,
      nft_user_id_profile_pic_url: nft.user_profile.profile_pic_url,
    }

    setMakeOfferItem(initialNFTOfferItem)
  }

  const viewOffer = async (offer: OfferFeedItemType) => {
    setViewOfferItem(offer)
  }

  const pinItem = async (nft: NFT) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    showToast(`✅ NFT pinned`, 1500)

    const { error } = await supabase.from('user_pins').upsert(
      [
        {
          user_id: user?.id,
          nft_id: nft.id,
        },
      ],
      {
        onConflict: 'user_id,nft_id',
        ignoreDuplicates: true,
      },
    )
    if (error) {
      showToast(`⚠️ Error pinning NFT`, 2500)
      console.error('Error pinning NFT:', error)
      return
    }
  }

  return (
    <>
      <div className={`flex w-full h-full relative`}>
        <div className='mt-6 lg:my-0 w-full bg-[#f9f9f9] flex flex-col lg:flex-row justify-start lg:justify-center lg:gap-4 lg:gap-8 p-0 lg:p-8 pb-24 lg:pb-16'>
          <NFTSidebar nft={nft} makeOffer={() => makeOffer(nft)} pinItem={() => pinItem(nft)} />
          <div className='flex flex-col flex-grow w-full lg:max-w-3xl px-4 lg:px-0'>
            <NFTTitle nft={nft} offerCount={items.length} hasMore={hasMore} />
            <div className='flex-grow overflow-hidden'>
              <div className='h-full overflow-y-auto hide-scrollbar'>
                <OffersGrid
                  items={items}
                  viewOffer={viewOffer}
                  userId={user ? user.id : null}
                />
                {items.length > 0 && hasMore && (
                  <button
                    className='bg-gray-100 py-2 px-6 text-gray-600 hover:bg-gray-200 transition-colors duration-300 text-sm font-medium my-4 mx-auto rounded-full shadow-sm flex items-center'
                    onClick={() => {
                      const nextPage = page + 1
                      setPage(nextPage)
                      fetchItems(nextPage)
                    }}
                  >
                    Load more
                  </button>
                )}
              </div>
            </div>
            <div className='h-[100px] lg:hidden' />
          </div>
        </div>
        <MobileActionButtons makeOffer={() => makeOffer(nft)} pinItem={() => pinItem(nft)} />
      </div>
      {makeOfferItem && (
        <Offer
          type='make_offer'
          offerId={null}
          initialNFT={makeOfferItem}
          closeModal={() => setMakeOfferItem(null)}
        />
      )}
      {viewOfferItem && (
        <Offer
          type={
            viewOfferItem.status === 'accepted' || viewOfferItem.status === 'completed'
              ? 'transaction'
              : 'view_offer'
          }
          offerId={viewOfferItem.id}
          initialNFT={null}
          closeModal={() => setViewOfferItem(null)}
        />
      )}
    </>
  )
}

const NFTSidebar: FC<{
  nft: NFT
  makeOffer: () => void
  pinItem: () => void
}> = ({ nft, makeOffer, pinItem }) => (
  <div className='w-full lg:w-[360px] flex flex-col lg:sticky lg:top-8 lg:overflow-y-auto hide-scrollbar'>
    <div className='bg-white rounded-lg shadow-md mb-4 mx-4 lg:mx-0 max-w-[260px] self-center lg:self-auto lg:max-w-none'>
      <div className='relative'>
        <VerifiedBadge
          id={nft.id}
          chainName={CHAIN_IDS_TO_CHAINS[nft.chain_id as keyof typeof CHAIN_IDS_TO_CHAINS]}
          collectionName={nft.collection_name}
          tokenId={nft.token_id}
          isVerified={true}
          className='inline-block absolute right-0 top-2 z-10 w-12 h-12'
          chainId={nft.chain_id.toString()}
          collectionContract={nft.collection_contract}
        />
        <NFTImage src={nft?.image} alt={nft?.name} fallback={nft?.name} />
      </div>
      <div className='py-4 flex items-center justify-center'>
        <Link
          href={`/${nft.user_profile.username}`}
          target='_blank'
          className='flex items-center w-full px-4'
        >
          <img
            src={
              process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + nft.user_profile.profile_pic_url
            }
            alt={nft.user_profile.username}
            className='w-8 h-8 rounded-full'
          />
          <div className='text-xl font-bold ml-2'>{nft.user_profile.username}</div>
        </Link>
      </div>
    </div>
    <ActionButtons className='hidden lg:flex' makeOffer={makeOffer} pinItem={pinItem} />
  </div>
)

const NFTTitle: FC<{ nft: NFT; offerCount: number; hasMore: boolean }> = ({
  nft,
  offerCount,
  hasMore,
}) => (
  <div className='w-full bg-white p-6 mb-4 rounded-lg shadow-md'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center'>
        <ChainLogo chainId={nft.chain_id} className='w-10 h-10 mr-4' />
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>{nft.name}</h2>
          <p className='text-sm text-gray-500'>{nft.collection_name}</p>
        </div>
      </div>
      <div className='text-right'>
        <p className='text-lg font-semibold text-gray-700'>Offers</p>
        <p className='text-sm text-gray-500'>{`${offerCount.toString()}${hasMore ? '+' : ''}`}</p>
      </div>
    </div>
  </div>
)

const OffersGrid: FC<{
  items: NFTOffers[]
  viewOffer: (offer: OfferFeedItemType) => void
  userId: string | null
}> = ({ items, viewOffer, userId }) => (
  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2'>
    {items.map((item) => (
      <NFTOfferItem
        key={item.id}
        item={item.user_offers}
        viewOffer={viewOffer}
        userId={userId}
      />
    ))}
  </div>
)

const ActionButtons: FC<{
  className?: string
  makeOffer: () => void
  pinItem: () => void
}> = ({ className, makeOffer, pinItem }) => (
  <div className={`flex gap-4 ${className} lg:mb-2`}>
    <ActionButton
      emoji='📌'
      text='Pin'
      onClick={pinItem}
      className='bg-red-50 hover:bg-red-100'
    />
    <ActionButton
      emoji='🤝'
      text='Offer'
      onClick={makeOffer}
      className='bg-yellow-50 hover:bg-yellow-100'
    />
  </div>
)

const MobileActionButtons: FC<{ makeOffer: () => void; pinItem: () => void }> = ({
  makeOffer,
  pinItem,
}) => (
  <div className='fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg lg:hidden'>
    <ActionButtons makeOffer={makeOffer} pinItem={pinItem} />
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

export default NFTPage
