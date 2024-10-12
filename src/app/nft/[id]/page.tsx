'use client'

import { FC, useEffect, useState } from 'react'

import NFTComponent from '@/components/nft'
import { supabase } from '@/utils/supabaseClient'

interface NFTPageProps {
  params: {
    id: string
  }
}

const NFTPage: FC<NFTPageProps> = ({ params }) => {
  const [nftInfo, setNftInfo] = useState<any | null>(null)

  const fetchNftInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*, user_profile!nfts_user_id_fkey(*)')
        .eq('id', params.id)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setNftInfo(data)
      }
    } catch (error) {
      console.error('Failed to fetch offer info', error)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchNftInfo()
    }
  }, [params.id])

  console.log('nftInfo', nftInfo)

  if (!nftInfo) {
    return <div>Loading...</div>
  }

  return <NFTComponent nft={nftInfo} />
}

export default NFTPage
