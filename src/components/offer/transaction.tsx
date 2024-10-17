import React, { useState } from 'react'
import Link from 'next/link'

import { ChainLogo, Checkmark, ChevronDown, ChevronUp, Close } from '@/icons'

interface Asset {
  id: string
  name: string
  image: string
  uploaded: boolean
}

interface User {
  username: string
  profile_pic_url: string
}

interface Offer {
  user: Asset[]
  userCounter: Asset[]
}

interface TradeInfo {
  user: User
  counter_user: User
  offer: Offer
}

interface Props {
  info: TradeInfo
  closeModal: () => void
  onUpload: (assetId: string) => Promise<void>
  onBackToChat: () => void
  onCancelTrade: () => void
}

const Transaction: React.FC<Props> = ({
  info,
  closeModal,
  onUpload,
  onBackToChat,
  onCancelTrade,
}) => {
  const [uploading, setUploading] = useState<string | null>(null)
  const [isMessageExpanded, setIsMessageExpanded] = useState(false)

  const handleUpload = async (assetId: string) => {
    setUploading(assetId)
    await onUpload(assetId)
    setUploading(null)
  }

  const allUploaded = [...info.offer.user, ...info.offer.userCounter].every(
    (asset) => asset.uploaded,
  )

  const renderAssetGrid = (assets: Asset[], user: User) => (
    <div className='space-y-4'>
      <div className='flex items-center space-x-4'>
        <img
          src={user.profile_pic_url}
          alt={user.username}
          className='w-12 h-12 rounded-full border-2 border-blue-500'
        />
        <h3 className='text-xl font-semibold text-gray-800'>{user.username}'s Offer</h3>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
        {assets.map((asset) => (
          <div
            key={asset.id}
            className='relative group bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 overflow-hidden'
          >
            <img src={asset.image} alt={asset.name} className='w-full h-32 object-cover' />
            <div className='p-3'>
              <p className='text-sm font-medium text-gray-800 truncate'>{asset.name}</p>
              <button
                onClick={() => handleUpload(asset.id)}
                disabled={asset.uploaded || uploading === asset.id}
                className={`mt-2 w-full px-3 py-1 rounded-full text-white font-semibold text-sm ${
                  asset.uploaded
                    ? 'bg-green-500'
                    : uploading === asset.id
                      ? 'bg-yellow-500'
                      : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {asset.uploaded
                  ? 'Deposited'
                  : uploading === asset.id
                    ? 'Depositing...'
                    : 'Deposit'}
              </button>
            </div>
            <div
              className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${asset.uploaded ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <Checkmark className='w-4 h-4 text-white' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='bg-gradient-to-r from-blue-600 to-cyan-600 p-6 relative'>
          <h1 className='text-3xl font-bold text-white mb-2'>NFT Swap in Progress</h1>
          <p className='text-blue-100'>
            Verify details and complete deposits to finalize the trade
          </p>
          <button
            onClick={closeModal}
            className='absolute top-4 right-4 text-white hover:text-blue-200'
          >
            <Close className='w-6 h-6' />
          </button>
        </div>

        <div className='p-6 space-y-8'>
          <div className='bg-blue-100 border-l-4 border-blue-500 p-4 rounded-r-lg'>
            <div
              className='flex justify-between items-center cursor-pointer'
              onClick={() => setIsMessageExpanded(!isMessageExpanded)}
            >
              <p className='text-blue-700 font-semibold'>
                Please verify all details in the block explorer before depositing.
              </p>
              {isMessageExpanded ? (
                <ChevronUp className='w-5 h-5 text-blue-500' />
              ) : (
                <ChevronDown className='w-5 h-5 text-blue-500' />
              )}
            </div>
            {isMessageExpanded && (
              <p className='mt-2 text-blue-600'>
                Once each asset is deposited, the contract will automatically send it to the
                counterparty. You can cancel the trade at any time before all assets are
                deposited, and all assets will be returned to their original owners.
              </p>
            )}
          </div>

          <div className='flex items-center justify-center space-x-4 bg-white py-3 rounded-lg shadow-md'>
            <ChainLogo chainId={1} className='w-8 h-8' />
            <Link
              href='#'
              className='text-blue-600 hover:text-blue-800 transition-colors font-semibold'
            >
              Verify on Block Explorer
            </Link>
          </div>

          <div className='space-y-8'>
            {renderAssetGrid(info.offer.user, info.user)}
            {renderAssetGrid(info.offer.userCounter, info.counter_user)}
          </div>

          <div className='text-center'>
            {allUploaded ? (
              <div className='text-2xl font-bold text-green-600 animate-pulse bg-green-100 py-4 rounded-lg'>
                🎉 All assets deposited! Swap completed successfully. 🎉
              </div>
            ) : (
              <div className='text-lg text-gray-600 bg-blue-100 py-4 rounded-lg'>
                Deposit all assets to complete the swap. Progress:{' '}
                {info.offer.user.filter((a) => a.uploaded).length +
                  info.offer.userCounter.filter((a) => a.uploaded).length}{' '}
                / {info.offer.user.length + info.offer.userCounter.length}
              </div>
            )}
          </div>

          <div className='flex justify-between'>
            <button
              onClick={onBackToChat}
              className='px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-semibold'
            >
              Back to Chat
            </button>
            <button
              onClick={onCancelTrade}
              className='px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold'
            >
              Cancel Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Transaction
