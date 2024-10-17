'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

import { AddNft, VerifyNft } from '@/components/modals'
import { NFTAccountItem } from '@/components/shared'
import { Add, Checkmark } from '@/icons'
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
    async (userId: string, pageNum: number) => {
      const { data, error } = await supabase
        .from('user_nfts')
        .select('*, nfts!user_nfts_nft_id_fkey(*)')
        .eq('user_id', userId)
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

  const loadMore = useCallback(
    (userId: string) => {
      const nextPage = page + 1
      setPage(nextPage)
      fetchUserNfts(userId, nextPage)
    },
    [page, fetchUserNfts],
  )

  return { userNfts, hasMore, fetchUserNfts, loadMore }
}

const Header: React.FC<{ setModal: (modal: 'add' | 'verify' | null) => void }> = ({
  setModal,
}) => (
  <div className='flex justify-between items-center px-4 py-6'>
    <div className='ml-2 text-2xl font-semibold'>My NFTs</div>
    <div className='flex text-lg space-x-4'>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setModal('add')}
        className='flex items-center px-4 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50'
      >
        <Add className='w-8 h-8 mr-1.5' />
        Add NFTs
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setModal('verify')}
        className='flex items-center px-4 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50'
      >
        <Checkmark className='w-8 h-8 mr-1.5' />
        Verify NFTs
      </motion.button>
    </div>
  </div>
)

const NFTGrid: React.FC<{
  userNfts: UserNFT[]
  hasMore: boolean
  loadMore: () => void
}> = ({ userNfts, hasMore, loadMore }) => (
  <div className='flex-grow overflow-y-auto p-5 pt-2 hide-scrollbar'>
    <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6'>
      {userNfts.map((userNft) => (
        <NFTAccountItem key={userNft.id} item={userNft} />
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
  const router = useRouter()
  const { user, loading } = useAuth()
  const [modal, setModal] = useState<'add' | 'verify' | null>(null)
  const { userNfts, hasMore, fetchUserNfts, loadMore } = useNFTs()

  useEffect(() => {
    if (user) {
      fetchUserNfts(user?.id, 1)
    }
  }, [user, fetchUserNfts])

  if (!loading && !user) {
    router.push('/')
  }

  return (
    <>
      <div className='absolute top-[75px] bottom-0 w-full flex flex-col'>
        <Header setModal={setModal} />
        <div className='flex flex-col flex-grow overflow-hidden'>
          <NFTGrid
            userNfts={userNfts}
            hasMore={hasMore}
            loadMore={() => user?.id && loadMore(user.id)}
          />
        </div>
      </div>
      {modal === 'add' && <AddNft closeModal={() => setModal(null)} />}
      {modal === 'verify' && <VerifyNft closeModal={() => setModal(null)} />}
    </>
  )
}

export default AccountNFTSPage
