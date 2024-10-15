import { FC, useState } from 'react'
import { isAddress } from 'viem'
import { useEnsAddress } from 'wagmi'

import { Checkmark, Wallet } from '@/icons'
import { NFT } from '@/types/supabase'
import { getCryptoPunksforWallet, getNFTsForWallet } from '@/utils/apis'
import { CHAIN_LABELS, SUPPORTED_CHAINS } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

const NftSelector: FC<{
  displaySkipOption?: boolean
  onComplete: () => void
}> = ({ displaySkipOption = true, onComplete }) => {
  const [currentWallet, setCurrentWallet] = useState<string>('')
  const [currentChain, setCurrentChain] = useState<string>('ethereum')
  const [nfts, setNfts] = useState<NFT[]>([])
  const [nextPageKey, setNextPageKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasSearched, setHasSearched] = useState<boolean>(false)
  const [selectedNfts, setSelectedNfts] = useState<NFT[]>([])
  const [uploadingNfts, setIsUploadingNfts] = useState<boolean>(false)

  const { data: ensAddress, isLoading: isResolvingEns } = useEnsAddress({
    name: currentWallet,
    query: {
      enabled: currentWallet.endsWith('.eth'),
    },
  })

  const resolveAddress = (): string => {
    if (isAddress(currentWallet)) {
      return currentWallet
    }
    if (ensAddress) {
      return ensAddress
    }
    throw new Error('Invalid address or unresolved ENS name')
  }

  const handleFetch = async (isInitialSearch: boolean = false) => {
    setIsLoading(true)
    setHasSearched(true)
    try {
      const walletAddress = resolveAddress()

      if (isInitialSearch) {
        setNfts([])
        setNextPageKey(null)
      }

      if (nextPageKey === null && currentChain === 'ethereum') {
        const [punks, results] = await Promise.all([
          getCryptoPunksforWallet(currentChain, walletAddress),
          getNFTsForWallet(currentChain, walletAddress, nextPageKey),
        ])
        setNfts([...punks, ...results.nfts])
        setNextPageKey(results.pageKey)
      } else {
        const results = await getNFTsForWallet(currentChain, walletAddress, nextPageKey)
        setNfts((prev) => [...prev, ...results.nfts])
        setNextPageKey(results.pageKey)
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    handleFetch(true)
  }

  const handleLoadMore = () => {
    handleFetch(false)
  }

  const toggleNftSelection = (nft: NFT) => {
    setSelectedNfts((prev) =>
      prev.some((item) => item.id === nft.id)
        ? prev.filter((item) => item.id !== nft.id)
        : [...prev, nft],
    )
  }

  async function uploadNFTs() {
    try {
      setIsUploadingNfts(true)

      const userId = (await supabase.auth.getSession()).data.session?.user.id
      if (!userId) throw new Error('User session not found')

      const nftsToUpload = selectedNfts.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ id, possible_spam, ...rest }) => ({
          ...rest,
          user_id: userId,
        }),
      )

      const { data: upsertedNfts, error: nftError } = await supabase
        .from('nfts')
        .upsert(nftsToUpload, {
          onConflict: 'chain_id,collection_contract,token_id',
          ignoreDuplicates: true,
        })
        .select()

      if (nftError) throw nftError

      const userNftUpsertData = upsertedNfts.map((nft) => ({
        user_id: userId,
        nft_id: nft.id,
      }))

      const { error: userNftError } = await supabase
        .from('user_nfts')
        .upsert(userNftUpsertData, {
          onConflict: 'user_id,nft_id',
          ignoreDuplicates: true,
        })

      if (userNftError) throw userNftError
    } catch (error) {
      console.error('Error uploading NFTs:', error)
      throw error
    } finally {
      setIsUploadingNfts(false)
    }
  }

  return (
    <div className='flex flex-col w-full'>
      <div className='space-y-4 mb-4'>
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='flex-grow relative'>
            <input
              type='text'
              placeholder='Enter wallet or ENS address'
              value={currentWallet}
              onChange={(e) => setCurrentWallet(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            {isResolvingEns && (
              <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500'>
                Resolving ENS...
              </span>
            )}
          </div>
          <div className='relative'>
            <select
              value={currentChain}
              onChange={(e) => setCurrentChain(e.target.value)}
              className='w-full sm:w-auto px-3 py-2 pr-8 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none'
            >
              {SUPPORTED_CHAINS.filter(
                (chain, index, self) => index === self.findIndex((t) => t === chain),
              ).map((chain) => (
                <option key={chain} value={chain}>
                  {CHAIN_LABELS[chain as keyof typeof CHAIN_LABELS]}
                </option>
              ))}
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
              <svg
                className='fill-current h-4 w-4'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
              >
                <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
              </svg>
            </div>
          </div>
          <button
            onClick={handleSearch}
            className='w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
            disabled={isLoading || isResolvingEns}
          >
            {isLoading ? 'Searching...' : 'Search NFTs'}
          </button>
        </div>
      </div>

      <div className='flex-grow overflow-y-auto min-h-0'>
        {!hasSearched ? (
          <div className='flex flex-col items-center justify-center h-full text-gray-500 py-12'>
            <Wallet className='w-24 h-24 mb-6 text-gray-400' />
            <p className='text-center text-lg'>
              Enter a wallet or ENS address and click search to view your NFTs
            </p>
          </div>
        ) : isLoading ? (
          <div className='flex justify-center items-center h-full'>
            <div className='loader'></div>
          </div>
        ) : nfts.length > 0 ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
              {nfts.map((nft) => (
                <div
                  key={nft.id}
                  className={`relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    selectedNfts.some((item) => item.id === nft.id)
                      ? 'ring-4 ring-blue-500 scale-105'
                      : 'hover:scale-105'
                  }`}
                  onClick={() => toggleNftSelection(nft)}
                >
                  <div className='relative'>
                    <img src={nft.image} alt={nft.name} className='w-full h-32 object-cover' />
                  </div>
                  <div className='p-2'>
                    <h3 className='text-sm font-medium text-gray-900 truncate'>{nft.name}</h3>
                  </div>
                  {nft.possible_spam && (
                    <div className='absolute top-0 left-0 right-0 bg-red-500 text-white text-xs py-1 px-2 text-center'>
                      Potential Spam
                    </div>
                  )}
                  {selectedNfts.some((item) => item.id === nft.id) && (
                    <div className='absolute top-2 right-2 bg-blue-500 rounded-full p-1 z-[2]'>
                      <Checkmark className='w-4 h-4 text-white' />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {nextPageKey && (
              <button
                onClick={handleLoadMore}
                className='w-full py-2 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 rounded-md transition-colors'
                disabled={isLoading}
              >
                Load More
              </button>
            )}
          </div>
        ) : (
          <div className='flex justify-center items-center h-full text-gray-500'>
            No NFTs found for this wallet
          </div>
        )}
      </div>

      <div
        className={`mt-4 flex flex-col sm:flex-row items-center gap-4 ${displaySkipOption ? 'justify-between' : 'justify-end'}`}
      >
        {displaySkipOption && (
          <button
            className='w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 transition-colors'
            onClick={onComplete}
          >
            Skip For Now
          </button>
        )}
        <button
          className='w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={selectedNfts.length === 0 || uploadingNfts}
          onClick={async () => {
            await uploadNFTs()
            onComplete()
          }}
        >
          {uploadingNfts ? (
            <span className='flex items-center justify-center'>
              <div className='loader mr-2'></div>
              Uploading...
            </span>
          ) : (
            `Import ${selectedNfts.length} NFT${selectedNfts.length !== 1 ? 's' : ''}`
          )}
        </button>
      </div>
    </div>
  )
}

export default NftSelector
