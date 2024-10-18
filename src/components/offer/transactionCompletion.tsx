import React from 'react'
import { ChainLogo, Checkmark, Close } from '@/icons'

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
  chainId: number
  chainName: string
  onClose: () => void
}

const TransactionCompletion: React.FC<CompletionScreenProps> = ({
  user,
  counterUser,
  userAssets,
  counterUserAssets,
  transactionHash,
  chainId,
  chainName,
  onClose,
}) => {
  const renderAssetOwnership = (owner: User, assets: Asset[]) => (
    <div className='bg-white rounded-lg shadow-md p-4 mb-4'>
      <div className='flex items-center space-x-3 mb-2'>
        <img
          src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + owner.profile_pic_url}
          alt={owner.username}
          className='w-10 h-10 rounded-full'
        />
        <div>
          <h3 className='font-semibold text-gray-800'>{owner.username}</h3>
          <p className='text-sm text-green-600'>Received {assets.length} asset(s)</p>
        </div>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
        {assets.map((asset) => (
          <div key={asset.id} className='bg-gray-100 rounded p-2 text-center'>
            <img
              src={asset.image}
              alt={asset.name}
              className='w-full h-20 object-cover rounded mb-1'
            />
            <span className='text-xs font-medium text-gray-800 truncate'>{asset.name}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-gradient-to-br from-blue-50 to-purple-100 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <ChainLogo chainId={1} className='w-8 h-8 text-white' />
              <div>
                <h1 className='text-2xl font-bold text-white'>Swap Completed!</h1>
                <p className='text-sm text-blue-200'>{chainName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-white hover:text-blue-200 transition-colors'
            >
              <Close className='w-6 h-6' />
            </button>
          </div>
        </div>

        <div className='p-6 space-y-6 max-h-[80vh] overflow-y-auto'>
          {renderAssetOwnership(counterUser, counterUserAssets)}
          {renderAssetOwnership(user, userAssets)}

          <div className='bg-green-100 border-l-4 border-green-500 p-4 rounded-r-lg'>
            <p className='text-sm text-green-700'>
              Assets have been transferred. New owners need to verify in their profile to
              receive a blue checkmark.
            </p>
          </div>

          <div className='flex justify-center'>
            <a
              href={`https://etherscan.io/tx/${transactionHash}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md text-blue-600 hover:text-blue-800 transition-colors'
            >
              <ChainLogo chainId={1} className='w-5 h-5' />
              <span>View Transaction on Etherscan</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionCompletion
