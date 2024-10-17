import React from 'react'

import { ChainLogo, Checkmark } from '@/icons'

interface Asset {
  id: string
  name: string
  image: string
}

interface User {
  username: string
  profile_pic_url: string
}

interface CompletionScreenProps {
  user: User
  counterUser: User
  userAssets: Asset[]
  counterUserAssets: Asset[]
  transactionHash: string
  onClose: () => void
}

const TransactionCompletion: React.FC<CompletionScreenProps> = ({
  user,
  counterUser,
  userAssets,
  counterUserAssets,
  transactionHash,
  onClose,
}) => {
  return (
    <div className='fixed inset-0 bg-blue-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full p-8'>
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4'>
            <Checkmark className='w-12 h-12 text-green-600' />
          </div>
          {/* <h1 className='text-3xl font-bold text-blue-800 mb-2'>Swap Completed!</h1> */}
          <p className='text-lg text-gray-600'>
            All assets have been successfully transferred.
          </p>
        </div>

        <div className='grid grid-cols-2 gap-8 mb-8'>
          {[
            { user: user, assets: counterUserAssets, direction: 'Received' },
            { user: counterUser, assets: userAssets, direction: 'Received' },
          ].map((party, index) => (
            <div key={index} className='space-y-4'>
              <div className='flex items-center space-x-4 mb-4'>
                <img
                  src={party.user.profile_pic_url}
                  alt={party.user.username}
                  className='w-12 h-12 rounded-full border-2 border-blue-500'
                />
                <div>
                  <span className='text-lg font-semibold text-gray-800'>
                    {party.user.username}
                  </span>
                  <p className='text-sm text-green-600'>
                    {party.direction} {party.assets.length} asset(s)
                  </p>
                </div>
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

        <div className='flex flex-col items-center space-y-4 mb-8'>
          <div className='flex items-center space-x-2'>
            <ChainLogo chainId={1} className='w-6 h-6' />
            <span className='text-blue-600 font-semibold'>Transaction Confirmed</span>
          </div>
          <a
            href={`https://etherscan.io/tx/${transactionHash}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-500 hover:text-blue-700 transition-colors'
          >
            View on Etherscan
          </a>
        </div>

        <div className='text-center'>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransactionCompletion
