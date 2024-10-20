import React, { useMemo, useState } from 'react'
import Link from 'next/link'

import { useCancelTrade, useDepositAsset } from '@/hooks'
import useTradeAssetsInfo from '@/hooks/useTradeAssetsInfo'
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
  // onUpload: (assetId: string) => Promise<void>
  onBackToChat: () => void
  onCancelTrade: () => void
}

const Transaction: React.FC<Props> = ({
  info,
  closeModal,
  // onUpload,
  onBackToChat,
  onCancelTrade,
}) => {
  // const [uploading, setUploading] = useState<string | null>(null)
  const [uploadingAsset, setUploadingAsset] = useState<Asset | null>(null)
  const [isMessageExpanded, setIsMessageExpanded] = useState(false)
  const [expandedGrids, setExpandedGrids] = useState<{ [key: string]: boolean }>({
    user: true,
    counterparty: true,
  })

  // Assume you have the tradeId from somewhere, perhaps from the info prop
  const tradeId = BigInt(info.onchain_trade_id) // Convert to BigInt if it's not already

  const { tradeInfo, isLoading, isError, refetch } = useTradeAssetsInfo(info.onchain_trade_id)

  console.log('trade info', tradeInfo, isLoading, isError)

  const {
    depositAsset,
    transactionStatus: depositStatus,
    isConfirming: isDepositConfirming,
    isConfirmed: isDepositConfirmed,
    errorReason,
    isApproving,
  } = useDepositAsset(tradeId)

  const {
    cancelTrade,
    transactionStatus: cancelStatus,
    isConfirming: isCancelConfirming,
    isConfirmed: isCancelConfirmed,
  } = useCancelTrade(tradeId)

  const handleUpload = async (asset: Asset) => {
    setUploadingAsset(asset)
    try {
      await depositAsset({
        token: asset.collection_contract,
        tokenId: BigInt(asset.token_id),
        amount: BigInt(1), // Default to 1 for ERC721
        assetType: asset.token_type === 'ERC721' ? 1 : asset.token_type === 'ERC1155' ? 2 : 3,
      })

      if (isDepositConfirmed) {
        console.log('Deposit successful')
        // Update UI or refetch asset state
      }
    } catch (error) {
      console.error('Deposit failed:', errorReason)
      // Handle error in UI
    } finally {
      setUploadingAsset(null)
    }
  }

  const handleCancelTrade = async () => {
    await cancelTrade()
    // You might want to handle post-cancellation logic here
    // For example, closing the modal or updating the UI
    // if (isCancelConfirmed) {
    //   closeModal()
    // }
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

  const renderAssetItem = (asset: Asset) => (
    <div
      key={asset.id}
      className='flex items-center justify-between p-3 bg-white rounded-lg shadow-sm mb-2 hover:shadow-md transition-shadow duration-200'
    >
      <div className='flex items-center space-x-3'>
        <img src={asset.image} alt={asset.name} className='w-14 h-14 object-cover rounded-md' />
        <span className='text-sm font-medium text-gray-800 truncate'>{asset.name}</span>
      </div>
      <button
        onClick={() => handleUpload(asset)}
        disabled={isApproving || isDepositConfirming || asset.uploaded}
        className={`px-4 py-2 rounded-lg text-white font-semibold text-sm transition-colors ${
          asset.uploaded
            ? 'bg-green-500 hover:bg-green-600'
            : isApproving || isDepositConfirming
              ? 'bg-yellow-500'
              : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {asset.uploaded ? (
          <span className='flex items-center'>
            <Checkmark className='w-4 h-4 mr-1' /> Deposited
          </span>
        ) : isApproving ? (
          'Approving...'
        ) : isDepositConfirming ? (
          'Depositing...'
        ) : (
          <span className='flex items-center'>
            <Upload className='w-4 h-4 mr-1' /> Deposit
          </span>
        )}
      </button>
      {errorReason && <div className='text-red-500 mt-2'>Error: {errorReason}</div>}
    </div>
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
      <div className='bg-gray-50 rounded-lg shadow-md p-4'>
        <div
          className='flex items-center justify-between cursor-pointer'
          onClick={() => toggleGrid(gridKey)}
        >
          <div className='flex items-center space-x-2'>
            <img
              src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user.profile_pic_url}
              alt={user.username}
              className='w-10 h-10 rounded-full'
            />
            <div className='font-semibold text-gray-800'>
              {user.username} ({depositedCount}/{totalCount} deposited)
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className='w-5 h-5 text-gray-500' />
          ) : (
            <ChevronDown className='w-5 h-5 text-gray-500' />
          )}
        </div>
        {isExpanded && (
          <div className='mt-4 space-y-2'>
            {sortedAssets.map((asset) => renderAssetItem(asset))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-gray-100 rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden'>
        <div className='bg-white p-6 relative shadow-md'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <ChainLogo chainId={1} className='w-12 h-12' />
              <h2 className='text-3xl font-bold text-gray-800'>Swap</h2>
            </div>
            <button
              onClick={closeModal}
              className='text-gray-500 hover:text-gray-700 transition-colors'
              aria-label='Close'
            >
              <Close className='w-8 h-8' />
            </button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto hide-scrollbar p-6 space-y-6'>
          <div
            className={`bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-r-lg cursor-pointer ${
              isMessageExpanded ? 'shadow-md' : ''
            }`}
            onClick={() => setIsMessageExpanded(!isMessageExpanded)}
          >
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-yellow-700 font-semibold'>
                  Verify all NFTs before depositing.
                </p>
                <Link
                  href='https://www.google.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:text-blue-800 transition-colors text-sm'
                  onClick={(e) => e.stopPropagation()}
                >
                  Verify on Etherscan
                </Link>
              </div>
              {isMessageExpanded ? (
                <ChevronUp className='w-5 h-5 text-yellow-500' />
              ) : (
                <ChevronDown className='w-5 h-5 text-yellow-500' />
              )}
            </div>
            {isMessageExpanded && (
              <div className='mt-2'>
                <p className='text-yellow-600'>
                  Once all NFTs are deposited, the contract automatically sends it to the
                  counterparty. Cancelling the trade before all NFTs are deposited will return
                  NFTs to their original owners.
                </p>
              </div>
            )}
          </div>

          <div className='space-y-6'>
            {renderAssetGrid(info.offer.user, info.user, true)}
            {renderAssetGrid(info.offer.userCounter, info.counter_user, false)}
          </div>
        </div>

        <div className='bg-white p-6 border-t border-gray-200'>
          <div className='mb-6'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-medium text-gray-700'>
                {uploadedAssets}/{totalAssets} deposited
              </span>
              <span className='text-sm font-medium text-gray-700'>{progress.toFixed(0)}%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div
                className='bg-blue-600 h-3 rounded-full transition-all duration-500 ease-in-out'
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className='flex justify-between'>
            <button
              onClick={onBackToChat}
              className='px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-semibold'
            >
              Back to Chat
            </button>
            <button
              onClick={onCancelTrade}
              disabled={isCancelConfirming}
              className={`px-6 py-3 ${
                isCancelConfirming
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600'
              } text-white rounded-lg transition-colors font-semibold`}
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
