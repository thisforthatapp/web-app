'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { AddNft, VerifyNft } from '@/components/modals'
import { NFTAccountItem } from '@/components/shared'
import { Add, Checkmark, Wallet } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { UserNFT } from '@/types/supabase'
import { GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

const useNFTs = () => {
  const [userNfts, setUserNfts] = useState<UserNFT[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { showToast } = useToast()

  const fetchUserNfts = useCallback(
    async (pageNum: number) => {
      const { data, error } = await supabase
        .from('user_nfts')
        .select('*, nfts!user_nfts_nft_id_fkey(*)')
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * GRID_ITEMS_PER_PAGE, pageNum * GRID_ITEMS_PER_PAGE - 1)

      if (error) {
        showToast(`⚠️ Error fetching items`, 2500)
        console.error('Error fetching items:', error)
        return
      }

      setUserNfts((prevUserNfts) => {
        if (pageNum === 1) return data
        const newUserNfts = data.filter(
          (newUserNft: UserNFT) =>
            !prevUserNfts.some((prevUserNft) => prevUserNft.nft_id === newUserNft.nft_id),
        )
        return [...prevUserNfts, ...newUserNfts]
      })

      setHasMore(data.length === GRID_ITEMS_PER_PAGE)
    },
    [showToast],
  )

  const loadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchUserNfts(nextPage)
  }, [page, fetchUserNfts])

  const toggleForSwap = useCallback(
    async (item: UserNFT) => {
      const newForSwapValue = !item.for_swap

      setUserNfts((prev) =>
        prev.map((nft) => (nft.id === item.id ? { ...nft, for_swap: newForSwapValue } : nft)),
      )

      const { error } = await supabase
        .from('user_nfts')
        .update({ for_swap: newForSwapValue })
        .eq('id', item.id)

      if (error) {
        showToast(`⚠️ Error updating NFT`, 2500)
        console.error('Error updating NFT:', error)
      }
    },
    [showToast],
  )

  return { userNfts, hasMore, fetchUserNfts, loadMore, toggleForSwap }
}

const Header: React.FC<{ setModal: (modal: 'add' | 'verify' | null) => void }> = ({
  setModal,
}) => (
  <div className='flex justify-between items-center px-4 py-6'>
    <div className='ml-2 text-2xl font-semibold'>My NFTs</div>
    <div className='flex text-lg space-x-4'>
      <button
        onClick={() => setModal('add')}
        className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1'
      >
        <Add className='w-8 h-8 mr-1.5' />
        Add NFTs
      </button>
      <button
        onClick={() => setModal('verify')}
        className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1'
      >
        <Wallet className='w-6 h-6 mr-2.5' />
        Verify NFTs
      </button>
    </div>
  </div>
)

const NFTGrid: React.FC<{
  userNfts: UserNFT[]
  toggleForSwap: (item: UserNFT) => void
  hasMore: boolean
  loadMore: () => void
}> = ({ userNfts, toggleForSwap, hasMore, loadMore }) => (
  <div className='flex-grow overflow-y-auto p-5 pt-2 hide-scrollbar'>
    <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6'>
      {userNfts.map((userNft) => (
        <NFTAccountItem
          key={userNft.id}
          item={userNft}
          toggleForSwap={() => toggleForSwap(userNft)}
        />
      ))}
    </div>
    {userNfts.length > 0 && hasMore && (
      <div className='w-full flex items-center justify-center my-8'>
        <button
          onClick={loadMore}
          className='px-10 py-3 text-lg rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors duration-300'
        >
          Load More
        </button>
      </div>
    )}
  </div>
)

const AccountNFTSPage: React.FC = () => {
  const { user } = useAuth()
  const [modal, setModal] = useState<'add' | 'verify' | null>(null)
  const { userNfts, hasMore, fetchUserNfts, loadMore, toggleForSwap } = useNFTs()

  useEffect(() => {
    if (user) {
      fetchUserNfts(1)
    }
  }, [user, fetchUserNfts])

  return (
    <>
      <div className='absolute top-[75px] bottom-0 w-full flex flex-col'>
        <Header setModal={setModal} />
        <div className='flex flex-col flex-grow overflow-hidden'>
          <NFTGrid
            userNfts={userNfts}
            toggleForSwap={toggleForSwap}
            hasMore={hasMore}
            loadMore={loadMore}
          />
        </div>
      </div>
      {modal === 'add' && <AddNft closeModal={() => setModal(null)} />}
      {modal === 'verify' && <VerifyNft closeModal={() => setModal(null)} />}
    </>
  )
}

export default AccountNFTSPage
