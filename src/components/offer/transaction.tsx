import React, { useMemo, useState } from 'react'
import Link from 'next/link'

import { ChainLogo, Checkmark, ChevronDown, ChevronUp, Close, Upload } from '@/icons'

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
  const [expandedGrids, setExpandedGrids] = useState<{ [key: string]: boolean }>({
    user: true,
    counterparty: true,
  })

  const handleUpload = async (assetId: string) => {
    setUploading(assetId)
    await onUpload(assetId)
    setUploading(null)
  }

  const toggleGrid = (key: string) => {
    setExpandedGrids((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const { totalAssets, uploadedAssets, progress } = useMemo(() => {
    const total = info.offer.user.length + info.offer.userCounter.length
    const uploaded =
      info.offer.user.filter((a) => a.uploaded).length +
      info.offer.userCounter.filter((a) => a.uploaded).length
    return {
      totalAssets: total,
      uploadedAssets: uploaded,
      progress: (uploaded / total) * 100,
    }
  }, [info.offer])

  const allUploaded = [...info.offer.user, ...info.offer.userCounter].every(
    (asset) => asset.uploaded,
  )

  const renderAssetGrid = (assets: Asset[], user: User, isCurrentUser: boolean) => {
    const depositedAssets = assets.filter((asset) => asset.uploaded)
    const pendingAssets = assets.filter((asset) => !asset.uploaded)
    const sortedAssets = [...pendingAssets, ...depositedAssets]

    const depositedCount = depositedAssets.length
    const totalCount = assets.length

    const gridKey = isCurrentUser ? 'user' : 'counterparty'
    const isExpanded = expandedGrids[gridKey]

    return (
      <div className='bg-white rounded-lg shadow-md p-4'>
        <div
          className={`flex items-center justify-between ${isExpanded ? 'mb-4' : ''} cursor-pointer`}
          onClick={() => toggleGrid(gridKey)}
        >
          <div className='flex items-center space-x-2'>
            <img
              src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user.profile_pic_url}
              alt={user.username}
              className='w-10 h-10 rounded-full'
            />
            <div>
              <div className='text-lg font-semibold text-gray-800'>{user.username}'s Offer</div>
              <div className='text-sm text-gray-500'>
                {isCurrentUser
                  ? `Your deposits (${depositedCount}/${totalCount})`
                  : `Counterparty deposits (${depositedCount}/${totalCount})`}
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className='w-5 h-5 text-gray-500' />
          ) : (
            <ChevronDown className='w-5 h-5 text-gray-500' />
          )}
        </div>
        {isExpanded && (
          <div className='overflow-x-auto hide-scrollbar'>
            <div className='flex space-x-4' style={{ minWidth: 'min-content' }}>
              {sortedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className='flex-shrink-0 w-36 bg-gray-50 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden'
                >
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className='w-full h-28 object-cover'
                  />
                  <div className='p-3'>
                    <p className='text-xs font-medium text-gray-800 truncate mb-2'>
                      {asset.name}
                    </p>
                    {isCurrentUser ? (
                      <button
                        onClick={() => handleUpload(asset.id)}
                        disabled={asset.uploaded || uploading === asset.id}
                        className={`w-full px-2 py-1 rounded-lg text-white font-semibold text-xs transition-colors ${
                          asset.uploaded
                            ? 'bg-green-500'
                            : uploading === asset.id
                              ? 'bg-yellow-500'
                              : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {asset.uploaded ? (
                          <span className='flex items-center justify-center'>
                            <Checkmark className='w-3 h-3 mr-1' /> Deposited
                          </span>
                        ) : uploading === asset.id ? (
                          'Depositing...'
                        ) : (
                          <span className='flex items-center justify-center'>
                            <Upload className='w-3 h-3 mr-1' /> Deposit
                          </span>
                        )}
                      </button>
                    ) : (
                      <div
                        className={`w-full px-2 py-1 rounded-lg text-white font-semibold text-xs flex items-center justify-center ${
                          asset.uploaded ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      >
                        {asset.uploaded ? (
                          <span className='flex items-center justify-center'>
                            <Checkmark className='w-3 h-3 mr-1' /> Deposited
                          </span>
                        ) : (
                          'Pending'
                        )}
                      </div>
                    )}
                  </div>
                  {asset.uploaded && (
                    <div className='absolute top-2 right-2 bg-green-500 text-white rounded-full p-1'>
                      <Checkmark className='w-3 h-3' />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden'>
        <div className='bg-white p-6 relative shadow-md'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <ChainLogo chainId={1} className='w-10 h-10' />
              <div>
                <h2 className='text-2xl font-bold text-gray-800'>Swap</h2>
                <Link
                  href='https://www.google.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm text-blue-600 hover:text-blue-800 transition-colors'
                >
                  Verify on Etherscan
                </Link>
              </div>
            </div>
            <button
              onClick={closeModal}
              className='text-gray-500 hover:text-gray-700 transition-colors'
              aria-label='Close'
            >
              <Close className='w-6 h-6' />
            </button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto hide-scrollbar p-6 space-y-6'>
          <div className='bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-r-lg'>
            <div
              className='flex justify-between items-center cursor-pointer'
              onClick={() => setIsMessageExpanded(!isMessageExpanded)}
            >
              <p className='text-yellow-700 font-semibold'>
                Verify all NFTs before depositing.
              </p>
              {isMessageExpanded ? (
                <ChevronUp className='w-5 h-5 text-yellow-500' />
              ) : (
                <ChevronDown className='w-5 h-5 text-yellow-500' />
              )}
            </div>
            {isMessageExpanded && (
              <p className='mt-2 text-yellow-600'>
                Once all NFTs are deposited, the contract automatically sends it to the
                counterparty. Cancelling the trade before all NFTs are deposited will return
                NFTs to their original owners.
              </p>
            )}
          </div>

          <div className='space-y-8'>
            {renderAssetGrid(info.offer.user, info.user, true)}
            {renderAssetGrid(info.offer.userCounter, info.counter_user, false)}
          </div>
        </div>

        <div className='bg-white p-6 border-t border-gray-200'>
          <div className='mb-4'>
            {allUploaded ? (
              <div className='text-2xl font-bold text-green-600 bg-green-100 p-4 rounded-lg flex items-center justify-center space-x-2'>
                <span className='animate-bounce'>🎉</span>
                <span>All NFTs deposited! Swap completed successfully.</span>
                <span className='animate-bounce'>🎉</span>
              </div>
            ) : (
              <div className='space-y-2'>
                <div className='flex justify-between items-center text-sm font-medium text-gray-600'>
                  <span>Deposit Progress</span>
                  <span>
                    {uploadedAssets} / {totalAssets} NFTs
                  </span>
                </div>
                <div className='relative pt-1'>
                  <div className='overflow-hidden h-4 text-xs flex rounded-full bg-blue-200'>
                    <div
                      style={{ width: `${progress}%` }}
                      className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-in-out'
                    />
                  </div>
                </div>
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
