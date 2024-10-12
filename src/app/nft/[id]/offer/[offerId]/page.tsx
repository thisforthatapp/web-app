'use client'

import { FC } from 'react'
import { useRouter } from 'next/navigation'

import { Offer } from '@/components/modals'
import NFTComponent from '@/components/nft'

interface NFTPageProps {
  params: {
    id: string
    offerId: string
  }
}

const NFTPage: FC<NFTPageProps> = ({ params }) => {
  // const router = useRouter()
  console.log(params)

  return (
    <>
      <NFTComponent />
      {/* <Offer
        type="view_offer"
        offerId="1"
        closeModal={() => {
          router.push("/nft/1");
        }}
      /> */}
    </>
  )
}

export default NFTPage
