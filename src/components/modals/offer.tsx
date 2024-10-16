'use client'

import { FC, useCallback, useEffect, useState } from 'react'
import Modal from 'react-modal'
import { useModal } from 'connectkit'
import { Address, ContractFunctionExecutionError, decodeEventLog } from 'viem'
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { Main, Select, Transaction, TransactionFeedback } from '@/components/offer'
import ABI from '@/contracts/abi.json'
import { useIsMobile } from '@/hooks'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { getModalStyles } from '@/styles'
import { NFTFeedItem } from '@/types/supabase'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'
import { prepareAllAssets } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

interface BaseProps {
  closeModal: () => void
}

interface MakeOfferProps extends BaseProps {
  type: 'make_offer'
  initialNFT: NFTFeedItem
  offerId: null
}

interface ViewOfferProps extends BaseProps {
  type: 'view_offer'
  initialNFT: null
  offerId: string
}

interface TransactionProps extends BaseProps {
  type: 'transaction'
  initialNFT: null
  offerId?: string
}

type Props = MakeOfferProps | ViewOfferProps | TransactionProps

const Offer: FC<Props> = ({ type, offerId = null, initialNFT = null, closeModal }) => {
  const { user, profile } = useAuth()
  const isMobile = useIsMobile()
  const customStyles = getModalStyles(isMobile)
  const { showToast } = useToast()

  const { setOpen } = useModal()
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()

  const {
    writeContract,
    data: hash,
    status: transactionStatus,
    error: writeError,
  } = useWriteContract()

  const {
    data: txReceipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash })

  // Effect to handle successful transaction confirmation
  useEffect(() => {
    const updateOffer = async (hash: string, tradeId: bigint) => {
      try {
        const { data, error } = await supabase.rpc('accept_offer', {
          p_offer_id: offerId,
          p_user_id: user?.id,
          p_trade_id: Number(tradeId),
          p_tx_id: hash,
        })
        console.log('accept_offer', data, error)
      } catch (error) {
        console.error('Error updating Supabase:', error)
      }
    }

    if (isConfirmed && txReceipt) {
      const decodedLog = decodeEventLog({
        abi: [
          {
            type: 'event',
            name: 'TradeCreated',
            inputs: [
              { name: 'tradeId', type: 'uint256', indexed: true, internalType: 'uint256' },
              {
                name: 'participants',
                type: 'address[]',
                indexed: false,
                internalType: 'address[]',
              },
            ],
            anonymous: false,
          },
        ],
        data: txReceipt.logs[0].data,
        topics: txReceipt.logs[0].topics,
      })

      const tradeId = decodedLog.args.tradeId
      console.log('trade id:', tradeId)
      // Update Supabase
      updateOffer(hash!, tradeId)
    }
  }, [hash, isConfirmed, txReceipt])

  const [view, setView] = useState<'main' | 'select' | 'create_trade' | null>(
    type === 'make_offer' ? 'select' : type === 'view_offer' ? 'main' : 'transaction',
  )
  const [offerInfo, setOfferInfo] = useState<any | null>(null)

  const fetchOfferInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('user_offers')
        .select(
          '*, user:user_profile!user_offers_user_id_fkey(*), counter_user:user_profile!user_offers_user_id_counter_fkey(*)',
        )
        .eq('id', offerId)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setOfferInfo(data)
      }
    } catch (error) {
      console.error('Failed to fetch offer info', error)
    }
  }

  useEffect(() => {
    if (offerId) {
      fetchOfferInfo()
    }
  }, [offerId])

  const createTradeOnChain = useCallback(async () => {
    if (!address || !publicClient) return

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES[31337],
        abi: ABI,
        functionName: 'createTrade',
        args: [
          [offerInfo.user.wallet as Address, offerInfo.counter_user.wallet as Address],
          prepareAllAssets(offerInfo),
        ],
        account: address,
      })
      writeContract(request)
    } catch (err) {
      console.log('err', err)
      if (err instanceof ContractFunctionExecutionError) {
        const errorMessage = err.message.toLowerCase()
        showToast('⚠️ ' + errorMessage, 2500)
      } else {
        showToast('⚠️ Transaction failed. Please try again', 2500)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, offerInfo, publicClient])

  const acceptOffer = async () => {
    if (!isConnected) {
      setOpen(true)
    } else {
      // setView('create_trade')
      createTradeOnChain()
    }
  }

  const counterOffer = async () => {
    setView('select')
  }

  console.log('offerInfo', offerInfo)

  return (
    <div>
      <Modal
        id='react-modal'
        ariaHideApp={false}
        isOpen={true}
        onRequestClose={closeModal}
        style={customStyles}
      >
        {view === 'main' && (
          <Main
            offerId={offerId!}
            info={offerInfo}
            acceptOffer={acceptOffer}
            counterOffer={counterOffer}
            closeModal={closeModal}
          />
        )}
        {/* {view === 'create_trade' && <TransactionFeedback status={transactionStatus} />} */}
        {view === 'select' && (
          <Select
            type={type === 'make_offer' ? 'initial_offer' : 'counter_offer'}
            chainId={type === 'make_offer' ? initialNFT?.nft_chain_id : offerInfo.chain_id}
            offerId={offerId}
            userA={
              type === 'make_offer'
                ? {
                    id: profile?.id,
                    username: profile?.username,
                    profile_pic_url: profile?.profile_pic_url,
                  }
                : {
                    id: offerInfo.user?.id,
                    username: offerInfo.user?.username,
                    profile_pic_url: offerInfo.user?.profile_pic_url,
                  }
            }
            userB={
              type === 'make_offer'
                ? {
                    id: initialNFT?.nft_user_id,
                    username: initialNFT?.nft_user_id_username,
                    profile_pic_url: initialNFT?.nft_user_id_profile_pic_url,
                  }
                : {
                    id: offerInfo.counter_user?.id,
                    username: offerInfo.counter_user?.username,
                    profile_pic_url: offerInfo.counter_user?.profile_pic_url,
                  }
            }
            initUserAItems={type === 'make_offer' ? [] : offerInfo.offer.user}
            initUserBItems={
              type === 'make_offer'
                ? [
                    {
                      id: initialNFT?.nft_id ?? '',
                      name: initialNFT?.nft_name ?? '',
                      image: initialNFT?.nft_image ?? '',
                      chaind_id: initialNFT?.nft_chain_id ?? '',
                      collection_contract: initialNFT?.nft_collection_contract ?? '',
                      token_id: initialNFT?.nft_token_id ?? '',
                      token_type: initialNFT?.nft_token_type ?? '',
                    },
                  ]
                : offerInfo.offer.userCounter
            }
            onClose={closeModal}
          />
        )}
        {/* {view === 'transaction' && <Transaction info={offerInfo} closeModal={closeModal} />} */}
        <TransactionFeedback status={transactionStatus} />
      </Modal>
    </div>
  )
}

export default Offer
