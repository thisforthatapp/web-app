import { useCallback, useState } from 'react'
import { Address, ContractFunctionExecutionError } from 'viem'
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import ABI from '@/contracts/abi.json'
import ERC721_ABI from '@/contracts/erc721Abi.json'
import ERC1155_ABI from '@/contracts/erc1155Abi.json'
import { useToast } from '@/providers/toastProvider'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'

interface Asset {
  token: Address
  tokenId: bigint
  amount: bigint
  assetType: number // 0 for ERC721, 1 for ERC1155
}

export default function useDepositAsset(tradeId: bigint) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { showToast } = useToast()
  const [errorReason, setErrorReason] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)

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

  const checkApproval = useCallback(
    async (asset: Asset) => {
      if (!address || !publicClient) return false

      const abi = asset.assetType === 0 ? ERC721_ABI : ERC1155_ABI
      const functionName = asset.assetType === 0 ? 'isApprovedForAll' : 'isApprovedForAll'

      try {
        const isApproved = await publicClient.readContract({
          address: asset.token,
          abi,
          functionName,
          args: [address, CONTRACT_ADDRESSES[31337]],
        })
        return isApproved
      } catch (error) {
        console.error('Error checking approval:', error)
        return false
      }
    },
    [address, publicClient],
  )

  const approveAsset = useCallback(
    async (asset: Asset) => {
      if (!address || !publicClient) return

      const abi = asset.assetType === 0 ? ERC721_ABI : ERC1155_ABI
      const functionName = 'setApprovalForAll'

      try {
        setIsApproving(true)
        const { request } = await publicClient.simulateContract({
          address: asset.token,
          abi,
          functionName,
          args: [CONTRACT_ADDRESSES[31337], true],
          account: address,
        })
        await writeContract(request)
      } catch (error) {
        console.error('Error approving asset:', error)
        if (error instanceof ContractFunctionExecutionError) {
          setErrorReason(error.cause?.message || error.message)
        } else {
          setErrorReason('Unknown error occurred during approval')
        }
        throw error
      } finally {
        setIsApproving(false)
      }
    },
    [address, publicClient, writeContract],
  )

  const depositAsset = useCallback(
    async (asset: Asset) => {
      if (!address || !publicClient) return

      try {
        const isApproved = await checkApproval(asset)
        if (!isApproved) {
          await approveAsset(asset)
        }

        const { request } = await publicClient.simulateContract({
          address: CONTRACT_ADDRESSES[31337],
          abi: ABI,
          functionName: 'depositAsset',
          args: [tradeId, asset.token, asset.tokenId, asset.amount, 1],
          account: address,
        })
        await writeContract(request)
        setErrorReason(null)
      } catch (err) {
        console.error('Error in depositAsset:', err)
        if (err instanceof ContractFunctionExecutionError) {
          // Extract the revert reason
          const revertReason = err.cause?.message || err.message
          setErrorReason(revertReason)
          showToast(`⚠️ ${revertReason}`, 2500)
        } else {
          setErrorReason('Unknown error occurred')
          showToast('⚠️ Failed to deposit asset. Please try again.', 2500)
        }
      }
    },
    [address, publicClient, tradeId, writeContract, showToast, checkApproval, approveAsset],
  )

  return {
    depositAsset,
    hash,
    transactionStatus,
    writeError,
    txReceipt,
    isConfirming,
    isConfirmed,
    confirmError,
    errorReason,
    isApproving,
  }
}
