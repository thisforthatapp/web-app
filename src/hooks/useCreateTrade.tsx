import { useCallback } from 'react'
import { Address, ContractFunctionExecutionError } from 'viem'
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import ABI from '@/contracts/abi.json'
import { useToast } from '@/providers/toastProvider'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'
import { prepareAllAssets } from '@/utils/helpers'

export default function useCreateTrade(offerInfo: any) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { showToast } = useToast()

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
  }, [address, offerInfo, publicClient, writeContract, showToast])

  return {
    createTradeOnChain,
    hash,
    transactionStatus,
    writeError,
    txReceipt,
    isConfirming,
    isConfirmed,
    confirmError,
  }
}
