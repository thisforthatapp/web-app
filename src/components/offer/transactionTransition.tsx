import React from 'react'
import { ChainLogo } from '@/icons'
import { NFTOfferDisplay } from '@/components/shared'

interface Asset {
  id: string
  name: string
  image: string
}

interface User {
  username: string
  profile_pic_url: string
}

interface TransitionScreenProps {
  user: User
  counterUser: User
  userAssets: Asset[]
  counterUserAssets: Asset[]
  chainId: number
  chainName: string
}

const TransactionTransition: React.FC<TransitionScreenProps> = ({
  user,
  counterUser,
  userAssets,
  counterUserAssets,
  chainId,
  chainName,
}) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-gradient-to-br from-blue-50 to-purple-100 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative'>
          <div className='flex items-center space-x-3'>
            <ChainLogo chainId={1} className='w-8 h-8 text-white' />
            <div>
              <h1 className='text-2xl font-bold text-white'>Processing Swap</h1>
              <p className='text-sm text-blue-200'>{chainName}</p>
            </div>
          </div>
        </div>

        <div className='p-6 space-y-6'>
          <div className='flex justify-center items-center space-y-4 flex-col'>
            <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600'></div>
            <p className='text-lg text-gray-600 text-center'>
              Assets are being transferred. This process may take a few minutes.
            </p>
          </div>

          <NFTOfferDisplay
            userAOffers={userAssets}
            userBOffers={counterUserAssets}
            size='medium'
            defaultOpen={true}
          />
        </div>
      </div>
    </div>
  )
}

export default TransactionTransition
