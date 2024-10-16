import React, { FC, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { Close } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { NFTOfferMetadata, ProfileMinimal } from '@/types/supabase'
import { MAX_NFTS_PER_SWAP } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

import { NFTImage } from '../shared'

import SelectNFT from './selectNft'

type Props = {
  type: 'initial_offer' | 'counter_offer'
  chainId: number // for now we only support native chain swap
  offerId: string | null
  userA: ProfileMinimal
  userB: ProfileMinimal
  initUserAItems: NFTOfferMetadata[]
  initUserBItems: NFTOfferMetadata[]
  onClose: () => void
}

const Select: FC<Props> = ({
  type,
  chainId,
  offerId,
  userA,
  userB,
  initUserAItems,
  initUserBItems,
  onClose,
}) => {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [userAItems, setUserAItems] = useState(initUserAItems)
  const [userBItems, setUserBItems] = useState(initUserBItems)
  const [isSelectingNFTs, setIsSelectingNFTs] = useState(false)
  const [selectingUser, setSelectingUser] = useState<null | ProfileMinimal>(null)

  const showSelectScreen = (user: ProfileMinimal) => {
    setSelectingUser(user)
    setIsSelectingNFTs(true)
  }

  const handleNFTSelection = (user: ProfileMinimal, nfts: NFTOfferMetadata[]) => {
    if (user === userA) {
      setUserAItems(nfts)
    } else {
      setUserBItems(nfts)
    }
  }

  const closeNFTSelection = () => {
    setIsSelectingNFTs(false)
    setSelectingUser(null)
  }

  const makeOffer = async () => {
    if (!user) return

    if (userAItems.length === 0 || userBItems.length === 0) {
      showToast(`⚠️ Please select at least one NFT for each user`, 2500)
      return
    }

    if (userAItems.length > MAX_NFTS_PER_SWAP || userBItems.length > MAX_NFTS_PER_SWAP) {
      showToast(`⚠️ You can only select up to ${MAX_NFTS_PER_SWAP} NFTs`, 2500)
      return
    }

    try {
      if (type === 'initial_offer') {
        // double check chain_id with nfts
        const { error } = await supabase.rpc('create_offer', {
          p_user_id: userA.id,
          p_user_id_counter: userB.id,
          p_chain_id: chainId,
          p_offer: {
            user: userAItems,
            userCounter: userBItems,
          },
        })

        if (error) throw error

        showToast(`🎉 Offer sent to ${userB.username}`, 2500)
      } else {
        if (!offerId) return

        const { error } = await supabase.rpc('counter_offer', {
          p_offer_id: offerId,
          p_user_id: user.id,
          p_user_id_counter: user.id === userA.id ? userB.id : userA.id,
          p_new_offer: {
            user: userAItems,
            userCounter: userBItems,
          },
        })

        if (error) throw error

        showToast(`🎉 Counter offer sent to ${userB.username}`, 2500)
      }

      onClose()
    } catch (error) {
      showToast(`⚠️ Error submitting offer`, 2500)
      console.error('Error making offer:', error)
    }
  }

  return (
    <div
      className={`flex flex-col bg-white rounded-lg shadow-lg overflow-hidden ${
        selectingUser && isSelectingNFTs ? 'h-screen' : 'h-full'
      }`}
    >
      <Header type={type} onClose={onClose} />
      <div className='overflow-y-auto'>
        <UserSection
          bg='bg-white'
          user={userA}
          items={userAItems}
          showSelectScreen={showSelectScreen}
          onRemoveItem={(itemId) =>
            setUserAItems((prev) => prev.filter((i) => i.id !== itemId))
          }
        />
        <UserSection
          bg='bg-gray-50'
          user={userB}
          items={userBItems}
          showSelectScreen={showSelectScreen}
          onRemoveItem={(itemId) =>
            setUserBItems((prev) => prev.filter((i) => i.id !== itemId))
          }
        />
      </div>

      <Footer type={type} makeOffer={makeOffer} />
      {selectingUser && isSelectingNFTs && (
        <SelectNFT
          chainId={chainId}
          user={selectingUser}
          selectedNFTs={selectingUser === userA ? userAItems : userBItems}
          onSelect={handleNFTSelection}
          onClose={closeNFTSelection}
        />
      )}
    </div>
  )
}

const Header: FC<{ type: 'initial_offer' | 'counter_offer'; onClose: () => void }> = ({
  type,
  onClose,
}) => (
  <div className='flex items-center justify-between py-4 px-6 bg-gray-100 border-b border-gray-200'>
    <div className='text-2xl font-bold text-gray-800'>
      {type === 'initial_offer' ? '🤝 Make an Offer' : '🤝 Make a Counter Offer'}
    </div>
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className='cursor-pointer text-gray-600'
      onClick={onClose}
    >
      <Close className='w-6 h-6' />
    </motion.div>
  </div>
)

type UserSectionProps = {
  bg: string
  user: ProfileMinimal
  items: NFTOfferMetadata[]
  showSelectScreen: (user: ProfileMinimal) => void
  onRemoveItem: (itemId: string) => void
}

const UserSection: FC<UserSectionProps> = ({
  bg,
  user,
  items,
  showSelectScreen,
  onRemoveItem,
}) => (
  <div className={`flex-1 p-6 relative ${bg} border-b border-gray-200`}>
    <div className='flex items-center justify-between mb-4'>
      <div className='flex items-center'>
        <img
          src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user?.profile_pic_url}
          alt='Profile Picture'
          className='w-12 h-12 rounded-full border-2 border-white shadow-md'
        />
        <div className='text-xl font-bold ml-3 text-gray-800'>{user?.username}</div>
      </div>
      <AddNFTButton onClick={() => showSelectScreen(user)} />
    </div>
    <NFTGrid items={items} onRemoveItem={onRemoveItem} />
  </div>
)

const AddNFTButton: FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className='px-4 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50'
    onClick={onClick}
  >
    + Add NFT
  </motion.button>
)

const NFTGrid: FC<{ items: NFTOfferMetadata[]; onRemoveItem: (itemId: string) => void }> = ({
  items,
  onRemoveItem,
}) => (
  <div className='mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4'>
    <AnimatePresence>
      {items.map((item) => (
        <NFTItem key={item.id} item={item} onRemove={onRemoveItem} />
      ))}
    </AnimatePresence>
  </div>
)

const NFTItem: FC<{ item: NFTOfferMetadata; onRemove: (itemId: string) => void }> = ({
  item,
  onRemove,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2 }}
    className='relative aspect-square rounded-lg overflow-hidden shadow-lg cursor-pointer group'
    onClick={() => onRemove(item.id)}
  >
    <NFTImage src={item.image} alt={item.name} fallback={item.name} />
    <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
      <span className='text-white text-sm font-semibold'>Remove</span>
    </div>
  </motion.div>
)

const Footer: FC<{ type: 'initial_offer' | 'counter_offer'; makeOffer: () => void }> = ({
  type,
  makeOffer,
}) => (
  <div className='p-6'>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className='w-full mt-auto bg-yellow-400 text-gray-800 py-3 px-6 rounded-full shadow-md cursor-pointer font-semibold text-lg transition-all duration-200 flex items-center justify-center'
      onClick={makeOffer}
    >
      <span className='mr-2'>🤝</span>
      {type === 'initial_offer' ? 'Make Offer' : 'Counter Offer'}
    </motion.button>
  </div>
)

export default Select
