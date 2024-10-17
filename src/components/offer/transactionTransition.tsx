import React from 'react'

import { ChainLogo } from '@/icons'

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
}

const TransactionTransition: React.FC<TransitionScreenProps> = ({
  user,
  counterUser,
  userAssets,
  counterUserAssets,
}) => {
  return (
    <div className='fixed inset-0 bg-blue-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full p-8'>
        <h1 className='text-3xl font-bold text-blue-800 mb-6 text-center'>Processing Swap</h1>

        <div className='flex justify-center mb-8'>
          <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600'></div>
        </div>

        <p className='text-lg text-gray-600 text-center mb-8'>
          Assets are being transferred. This process may take a few minutes.
        </p>

        <div className='grid grid-cols-2 gap-8 mb-8'>
          {[
            { user: user, assets: userAssets },
            { user: counterUser, assets: counterUserAssets },
          ].map((party, index) => (
            <div key={index} className='space-y-4'>
              <div className='flex items-center space-x-4 mb-4'>
                <img
                  src={party.user.profile_pic_url}
                  alt={party.user.username}
                  className='w-12 h-12 rounded-full border-2 border-blue-500'
                />
                <span className='text-lg font-semibold text-gray-800'>
                  {party.user.username}
                </span>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                {party.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className='bg-blue-100 rounded-lg p-2 flex items-center space-x-2'
                  >
                    <img src={asset.image} alt={asset.name} className='w-10 h-10 rounded' />
                    <span className='text-sm font-medium text-gray-800 truncate'>
                      {asset.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='flex justify-center items-center space-x-4'>
          <ChainLogo chainId={1} className='w-8 h-8' />
          <span className='text-blue-600 font-semibold'>Transaction in progress</span>
        </div>
      </div>
    </div>
  )
}

export default TransactionTransition
