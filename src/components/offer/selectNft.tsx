import { FC, useEffect, useState } from 'react'

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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

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

  const handleItemSelect = (item: UserNFT) => {
    const itemFormatted = {
      id: item.nfts.id,
      name: item.nfts.name,
      image: item.nfts.image,
      chaind_id: item.nfts.chain_id,
      collection_contract: item.nfts.collection_contract,
      token_id: item.nfts.token_id,
      token_type: item.nfts.token_type,
    }

    const isSelected = selectedItems.some((selected) => selected.id === itemFormatted.id)
    let updatedSelection
    if (isSelected) {
      updatedSelection = selectedItems.filter((selected) => selected.id !== itemFormatted.id)
    } else {
      updatedSelection = [...selectedItems, itemFormatted]
    }

    // pass back the nft item in the format expected by the parent component
    setSelectedItems(updatedSelection)
    onSelect(user, updatedSelection)
  }

  const NFTGrid: FC<{
    items: UserNFT[]
    selectedItems: NFTOfferMetadata[]
    onSelect: (item: UserNFT) => void
  }> = ({ items, selectedItems, onSelect }) => (
    <div className='grid grid-cols-3 gap-2'>
      {items.map((item) => {
        const isSelected = selectedItems.some((selected) => selected.id === item.nfts.id)
        return (
          <div
            key={item.id}
            className={`p-4 border-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow duration-200 ${
              isSelected ? 'border-gray-800' : 'border-white'
            }`}
            onClick={() => onSelect(item)}
          >
            <img
              src={item.nfts.image}
              alt={item.nfts.name}
              className='w-full h-32 object-cover rounded'
            />
            <p className='mt-2 text-center font-semibold'>{item.nfts.name}</p>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg p-6 w-full max-w-2xl'>
        <h2 className='text-2xl font-bold mb-4'>Select NFTs to Trade</h2>
        <NFTGrid
          items={availableNFTs}
          selectedItems={selectedItems}
          onSelect={handleItemSelect}
        />
        <button
          className='w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200'
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  )
}

export default SelectNFT

/* <Pagination
          totalItems={availableNFTs.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        /> */

// const Pagination = ({
//   totalItems,
//   itemsPerPage,
//   currentPage,
//   onPageChange,
// }) => {
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
//   return (
//     <div className="flex justify-center mt-4 space-x-2">
//       {[...Array(totalPages)].map((_, index) => (
//         <button
//           key={index}
//           onClick={() => onPageChange(index + 1)}
//           className={`px-3 py-1 rounded ${
//             currentPage === index + 1
//               ? "bg-blue-500 text-white"
//               : "bg-gray-200 hover:bg-gray-300"
//           }`}
//         >
//           {index + 1}
//         </button>
//       ))}
//     </div>
//   );
// };
