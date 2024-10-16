import { Asset, assetTypeMap, OfferInfo, PreparedAsset } from '@/types/main'

interface ChainInfo {
  id: string
  name: string
  explorerName: string
  openSeaSlug: string
  blockExplorerUrl: string
}

export const chainInfoMap: { [key: string]: ChainInfo } = {
  '1': {
    id: '1',
    name: 'Ethereum',
    explorerName: 'Etherscan',
    openSeaSlug: 'ethereum',
    blockExplorerUrl: 'https://etherscan.io',
  },
  '8453': {
    id: '8453',
    name: 'Base',
    explorerName: 'BaseScan',
    openSeaSlug: 'base',
    blockExplorerUrl: 'https://basescan.org',
  },
  '42161': {
    id: '42161',
    name: 'Arbitrum',
    explorerName: 'Arbiscan',
    openSeaSlug: 'arbitrum',
    blockExplorerUrl: 'https://arbiscan.io',
  },
  '10': {
    id: '10',
    name: 'Optimism',
    explorerName: 'OP Etherscan',
    openSeaSlug: 'optimism',
    blockExplorerUrl: 'https://optimistic.etherscan.io',
  },
  '137': {
    id: '137',
    name: 'Polygon',
    explorerName: 'Polygonscan',
    openSeaSlug: 'matic',
    blockExplorerUrl: 'https://polygonscan.com',
  },
  '324': {
    id: '324',
    name: 'ZkSync',
    explorerName: 'Zkscan',
    openSeaSlug: 'zksync',
    blockExplorerUrl: 'https://explorer.zksync.io',
  },
}

export async function uploadFile(
  formData: FormData,
  token: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  try {
    const file = formData.get('file') as File

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ fileType: file.type }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error ${response.status}: ${errorText}`)
    }

    const { url, key } = await response.json()

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file')
    }

    return { key }
  } catch (error) {
    alert('Upload error:' + error)
    return null
  }
}

export async function verifyNFTs(
  address: string,
  chain: number,
  signature: string,
  token: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify({ address, chain, signature }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()

      if (errorText === 'Verification failed') {
        return {
          error: errorText,
          validVerifications: 0,
        }
      }
    }

    const { validVerifications } = await response.json()

    console.log('validVerifications', validVerifications)

    return { error: null, validVerifications }
  } catch (error) {
    return {
      error,
      validVerifications: 0,
    }
  }
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}

export function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' years ago'

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'

  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutes ago'

  return Math.floor(seconds) + ' seconds ago'
}

export function timeAgoShort(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + 'y'

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + 'mo'

  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + 'd'

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + 'h'

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + 'm'

  return Math.floor(seconds) + 's'
}

export const getChainInfo = (chainId: string): ChainInfo => {
  const chain = chainInfoMap[chainId]
  if (!chain) {
    console.warn(`Chain ID ${chainId} not found, defaulting to Ethereum`)
    return chainInfoMap['1']
  }
  return chain
}

export const getOpenSeaUrl = (
  chainId: string,
  collectionContract: string,
  tokenId: string,
): string => {
  const chain = getChainInfo(chainId)
  return `https://opensea.io/assets/${chain.openSeaSlug}/${collectionContract}/${tokenId}`
}

export const getBlockExplorerUrl = (
  chainId: string,
  collectionContract: string,
  tokenId: string,
): string => {
  const chain = getChainInfo(chainId)
  return `${chain.blockExplorerUrl}/nft/${collectionContract}/${tokenId}`
}

const prepareAssetData = (asset: Asset, recipient: string): PreparedAsset => ({
  token: asset.collection_contract as `0x${string}`,
  tokenId: BigInt(asset.token_id),
  amount: 1n,
  assetType: assetTypeMap[asset.token_type] ?? 0n,
  recipient: recipient as `0x${string}`,
  isDeposited: false,
})

export const prepareAllAssets = (offerInfo: OfferInfo): PreparedAsset[][] => {
  const userWallet = offerInfo.user.wallet as `0x${string}`
  const counterUserWallet = offerInfo.counter_user.wallet as `0x${string}`

  return [
    offerInfo.offer.user.map((asset) => prepareAssetData(asset, counterUserWallet)),
    offerInfo.offer.userCounter.map((asset) => prepareAssetData(asset, userWallet)),
  ]
}
