import { useCallback } from 'react'
import { Address, decodeAbiParameters } from 'viem'
import { useReadContract } from 'wagmi'

import ABI from '@/contracts/abi.json'
import { CONTRACT_ADDRESSES } from '@/utils/contracts'

interface Asset {
  token: Address
  tokenId: bigint
  amount: bigint
  assetType: number
  recipient: Address
}

interface TradeAssetInfo {
  participants: Address[]
  assets: Asset[][]
  isActive: boolean
  depositedAssetCount: number
  totalAssetCount: number
}

const formatTradeAssetInfo = (
  participants: Address[],
  assets: Asset[][],
  isActive: boolean,
  depositedAssetCount: bigint,
  totalAssetCount: bigint,
): TradeAssetInfo => {
  return {
    participants,
    assets,
    isActive,
    depositedAssetCount: Number(depositedAssetCount),
    totalAssetCount: Number(totalAssetCount),
  }
}

export default function useTradeAssetsInfo(tradeId: number) {
  const {
    data: tradeAssetsData,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESSES[31337],
    abi: ABI,
    functionName: 'getTradeAssets',
    args: [BigInt(tradeId)],
  }) as {
    data: [Address[], Asset[][], boolean, bigint, bigint] | undefined
    isError: boolean
    isLoading: boolean
    refetch: () => Promise<any>
  }

  const decodeAssets = useCallback((encodedAssets: any[][]): Asset[][] => {
    return encodedAssets.map((participantAssets) =>
      participantAssets.map((asset) => {
        if (typeof asset === 'object' && 'token' in asset) {
          // If the asset is already in the correct format, return it as is
          return asset as Asset
        }
        // If it's not, assume it's a tuple and decode it
        const [token, tokenId, amount, assetType, recipient] = asset as [
          Address,
          bigint,
          bigint,
          number,
          Address,
        ]
        return { token, tokenId, amount, assetType, recipient }
      }),
    )
  }, [])

  let tradeInfo: TradeAssetInfo | undefined

  if (tradeAssetsData) {
    const [participants, encodedAssets, isActive, depositedAssetCount, totalAssetCount] =
      tradeAssetsData
    const decodedAssets = decodeAssets(encodedAssets)
    tradeInfo = formatTradeAssetInfo(
      participants,
      decodedAssets,
      isActive,
      depositedAssetCount,
      totalAssetCount,
    )
  }

  return {
    tradeInfo,
    isLoading,
    isError,
    refetch,
  }
}
