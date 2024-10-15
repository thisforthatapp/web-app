'use client'

import { FC, useEffect, useState } from 'react'

import { Footer } from '@/components'
import NFTPage from '@/components/nft'
import { useIsMobile } from '@/hooks'
import { useToast } from '@/providers/toastProvider'
import { NFT as NFTType } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

interface NFTPageProps {
  params: {
    id: string
  }
}

const NFT: FC<NFTPageProps> = ({ params }) => {
  const isMobile = useIsMobile()
  const { showToast } = useToast()
  const [nftInfo, setNftInfo] = useState<NFTType | null>(null)

  const fetchNftInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*, user_profile!nfts_user_id_fkey(*)')
        .eq('id', params.id)
        .single()

      if (error) {
        showToast('⚠️ Failed to fetch NFT', 2500)
        throw error
      }

      if (data) {
        setNftInfo(data)
      }
    } catch (error) {
      showToast('⚠️ Failed to fetch NFT', 2500)
      console.error('Failed to fetch NFT', error)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchNftInfo()
    }
  }, [params.id])

  return (
    <div
      className={`absolute top-[75px] bottom-0 w-full ${isMobile ? 'overflow-y-auto hide-scrollbar' : ''}`}
    >
      {nftInfo && <NFTPage nft={nftInfo} isMobile={isMobile} />}
      {!isMobile && <Footer />}
    </div>
  )
}

export default NFT
