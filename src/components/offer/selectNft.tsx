import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { NFTOfferMetadata, ProfileMinimal, UserNFT } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

type Props = {
  user: ProfileMinimal
  selectedNFTs: NFTOfferMetadata[]
  onSelect: (user: ProfileMinimal, nfts: NFTOfferMetadata[]) => void
  onClose: () => void
}

const SelectNFT: FC<Props> = ({ user, selectedNFTs, onSelect, onClose }) => {
  const [availableNFTs, setAvailableNFTs] = useState<UserNFT[]>([])
  const [selectedItems, setSelectedItems] = useState(selectedNFTs)

  useEffect(() => {
    fetchUserNFTs()
  }, [user?.id])

  const fetchUserNFTs = async () => {
    const { data, error } = await supabase
      .from('user_nfts')
      .select('*, nfts!user_nfts_nft_id_fkey(*)')
      .eq('user_id', user?.id)

    if (error) {
      console.error('Error fetching NFTs:', error)
    } else {
      setAvailableNFTs(data)
    }
  }

  const handleItemSelect = useCallback(
    (item: UserNFT) => {
      const itemFormatted = {
        id: item.nfts.id,
        name: item.nfts.name,
        image: item.nfts.image,
        chaind_id: item.nfts.chain_id,
        collection_contract: item.nfts.collection_contract,
        token_id: item.nfts.token_id,
        token_type: item.nfts.token_type,
      }

      setSelectedItems((prevItems) => {
        const isSelected = prevItems.some((selected) => selected.id === itemFormatted.id)
        let updatedSelection
        if (isSelected) {
          updatedSelection = prevItems.filter((selected) => selected.id !== itemFormatted.id)
        } else {
          updatedSelection = [...prevItems, itemFormatted]
        }
        onSelect(user, updatedSelection)
        return updatedSelection
      })
    },
    [user, onSelect],
  )

  const selectedItemIds = useMemo(
    () => new Set(selectedItems.map((item) => item.id)),
    [selectedItems],
  )

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className='bg-white rounded-lg p-6 w-full h-full max-w-2xl flex flex-col'
      >
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-gray-800'>Select NFTs to Swap</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 transition-colors duration-200'
          >
            <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>
        <NFTGrid
          items={availableNFTs}
          selectedItemIds={selectedItemIds}
          onSelect={handleItemSelect}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='w-full mt-auto px-4 py-3 bg-yellow-400 text-gray-800 rounded-md hover:bg-yellow-500 transition-colors duration-200 shadow-md flex justify-center items-center'
          onClick={onClose}
        >
          <span className='text-xl font-semibold'>Done</span>
        </motion.button>
      </motion.div>
    </div>
  )
}

const NFTGrid: FC<{
  items: UserNFT[]
  selectedItemIds: Set<string>
  onSelect: (item: UserNFT) => void
}> = React.memo(({ items, selectedItemIds, onSelect }) => (
  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
    {items.map((item) => (
      <NFTItem
        key={item.id}
        item={item}
        isSelected={selectedItemIds.has(item.nfts.id)}
        onSelect={onSelect}
      />
    ))}
  </div>
))

const NFTItem: FC<{
  item: UserNFT
  isSelected: boolean
  onSelect: (item: UserNFT) => void
}> = React.memo(({ item, isSelected, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`p-4 border-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-all duration-200 ${
      isSelected ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
    }`}
    onClick={() => onSelect(item)}
  >
    <img
      src={item.nfts.image}
      alt={item.nfts.name}
      className='w-full h-32 object-cover rounded'
    />
    <p className='mt-2 text-center font-semibold text-gray-800 truncate'>{item.nfts.name}</p>
  </motion.div>
))

export default SelectNFT
