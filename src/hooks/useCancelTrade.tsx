import { useCallback } from 'react'
import { ContractFunctionExecutionError } from 'viem'
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import ABI from '@/contracts/abi.json'
import { useToast } from '@/providers/toastProvider'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'

export default function useCancelTrade(tradeId: bigint) {
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

  const cancelTrade = useCallback(async () => {
    if (!address || !publicClient) return

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES[31337],
        abi: ABI,
        functionName: 'cancelTrade',
        args: [tradeId],
        account: address,
      })
      writeContract(request)
    } catch (err) {
      console.error('Error in cancelTrade:', err)
      if (err instanceof ContractFunctionExecutionError) {
        const errorMessage = err.message.toLowerCase()
        showToast('⚠️ ' + errorMessage, 2500)
      } else {
        showToast('⚠️ Failed to cancel trade. Please try again.', 2500)
      }
    }
  }, [address, publicClient, tradeId, writeContract, showToast])

  return {
    cancelTrade,
    hash,
    transactionStatus,
    writeError,
    txReceipt,
    isConfirming,
    isConfirmed,
    confirmError,
  }
}
