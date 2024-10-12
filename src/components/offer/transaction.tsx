// TODO: this needs lot of work

import { FC, useState } from 'react'
import Link from 'next/link'

import { Close } from '@/icons'
import { Checkmark } from '@/icons'

interface Props {
  info: any
  closeModal: () => void
}

interface DealParty {
  id: string
  name: string
  avatar: string
}

interface DealAsset {
  type: 'NFT' | 'Token'
  name: string
  image?: string
  amount?: string
}

interface DealInteraction {
  id: string
  type: 'message' | 'offer' | 'counterOffer' | 'rejection'
  sender: string
  content: string
  timestamp: Date
  offer?: {
    giving: DealAsset[]
    receiving: DealAsset[]
  }
}

interface DealStatus {
  stage: 'negotiation' | 'accepted' | 'deposit' | 'confirmation' | 'execution' | 'completed'
  party1Completed?: boolean
  party2Completed?: boolean
}

interface DealStage {
  key: 'accepted' | 'deposit' | 'confirmation' | 'execution' | 'completed'
  label: string
  description: string
}

const Transaction: FC<Props> = ({ info, closeModal }) => {
  const [dealStatus, setDealStatus] = useState<DealStatus>({
    stage: 'deposit',
  })

  const [showAcceptanceOverlay, setShowAcceptanceOverlay] = useState(false)
  const [currentStage, setCurrentStage] = useState<DealStage['key']>('deposit')

  // Mock data
  const offeror: DealParty = {
    id: '1',
    name: 'Alice',
    avatar: '/temp/alice-avatar.png',
  }

  const initialOffer: DealInteraction = {
    id: '1',
    type: 'offer',
    sender: offeror.id,
    content: 'Initial offer',
    timestamp: new Date(),
    offer: {
      giving: [{ type: 'Token', name: 'ETH', amount: '2.5' }],
      receiving: [
        {
          type: 'NFT',
          name: 'CryptoPunk #1234',
          image: '/temp/cryptopunk.png',
        },
      ],
    },
  }

  const dealStages: DealStage[] = [
    {
      key: 'deposit',
      label: 'Deposit',
      description: 'Deposit your assets to the smart contract.',
    },
    {
      key: 'confirmation',
      label: 'Confirm',
      description: 'Verify that both parties have deposited the correct assets.',
    },
    {
      key: 'execution',
      label: 'Execute',
      description: 'The smart contract is executing the asset swap.',
    },
  ]

  return (
    <div className='flex flex-col h-full'>
      {/* Top bar */}
      <div className='border-b p-4 flex justify-between items-center'>
        <div className='flex items-center'>
          <img
            src={offeror.avatar}
            alt={offeror.name}
            className='w-10 h-10 rounded-full mr-3'
          />
          <div>
            <p className='font-semibold'>{offeror.name}</p>
            <p className='text-sm text-gray-500'>
              Offer made {initialOffer.timestamp.toLocaleString()}
            </p>
          </div>
        </div>
        <div className='text-sm font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>
          {dealStatus.stage.charAt(0).toUpperCase() + dealStatus.stage.slice(1)}
        </div>
        <Link href={`/nft/1`} onClick={closeModal}>
          <Close className='w-6 h-6' />
        </Link>
      </div>

      <div className='bg-white z-20 flex flex-col'>
        <div className='flex-grow overflow-y-auto'>
          {/* Progress header */}
          <div className='flex justify-between p-4 bg-gray-100'>
            {dealStages.map((stage, index) => (
              <button
                key={stage.key}
                onClick={() => setCurrentStage(stage.key)}
                className={`flex flex-col items-center space-y-2 ${
                  currentStage === stage.key ? 'text-blue-600' : 'text-gray-500'
                }`}
                disabled={index > dealStages.findIndex((s) => s.key === currentStage)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= dealStages.findIndex((s) => s.key === currentStage)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index < dealStages.findIndex((s) => s.key === currentStage) ? (
                    <Checkmark className='w-5 h-5' />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className='text-xs text-center'>{stage.label}</span>
              </button>
            ))}
          </div>

          {/* Stage details */}
          <div className='p-6'>
            <h4 className='text-xl font-semibold mb-4'>
              {dealStages.find((s) => s.key === currentStage)?.label}
            </h4>
            <p className='mb-6'>
              {dealStages.find((s) => s.key === currentStage)?.description}
            </p>

            {/* Render stage-specific content */}
            {currentStage === 'deposit' && (
              <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded'>
                <p className='font-bold'>Action Required:</p>
                <p>Please deposit your assets to the smart contract address: 0x1234...5678</p>
                {/* Add deposit form or integration with wallet here */}
              </div>
            )}

            {currentStage === 'confirmation' && (
              <div className='bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded'>
                <p className='font-bold'>Verification:</p>
                <p>Please verify that the following assets have been deposited:</p>
                {/* Add list of deposited assets here */}
              </div>
            )}

            {currentStage === 'execution' && (
              <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded'>
                <p className='font-bold'>In Progress:</p>
                <p>
                  The smart contract is currently executing the asset swap. This process is
                  automatic and may take a few minutes.
                </p>
                {/* Add progress indicator or transaction hash here */}
              </div>
            )}

            {currentStage === 'completed' && (
              <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded'>
                <p className='font-bold'>Success:</p>
                <p>
                  The trade has been successfully completed. You should now see the new assets
                  in your wallet.
                </p>
                {/* Add transaction details or link to block explorer here */}
              </div>
            )}

            {/* Navigation buttons */}
            <div className='mt-8 flex justify-between'>
              <button
                onClick={() => {
                  const currentIndex = dealStages.findIndex((s) => s.key === currentStage)
                  if (currentIndex > 0) {
                    setCurrentStage(dealStages[currentIndex - 1].key)
                  }
                }}
                disabled={currentStage === 'accepted'}
                className='bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50'
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const currentIndex = dealStages.findIndex((s) => s.key === currentStage)
                  if (currentIndex < dealStages.length - 1) {
                    setCurrentStage(dealStages[currentIndex + 1].key)
                  } else {
                    setShowAcceptanceOverlay(false)
                    // Handle deal completion here
                  }
                }}
                className='bg-blue-600 text-white px-4 py-2 rounded'
              >
                {currentStage === 'completed' ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Transaction
