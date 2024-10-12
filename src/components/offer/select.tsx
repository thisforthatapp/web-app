import { FC, useState } from 'react'
import { useAuth } from '@/providers/authProvider'
import { NFTOfferMetadata, ProfileMinimal } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'
import SelectNFT from './selectNft'
import { motion } from 'framer-motion'

type Props = {
  type: 'initial_offer' | 'counter_offer'
  offerId: string | null
  userA: ProfileMinimal
  userB: ProfileMinimal
  initUserAItems: NFTOfferMetadata[]
  initUserBItems: NFTOfferMetadata[]
}

type UserProps = {
  bg: string
  user: ProfileMinimal
  items: NFTOfferMetadata[]
  showSelectScreen: (user: ProfileMinimal) => void
}

const Select: FC<Props> = ({ type, offerId, userA, userB, initUserAItems, initUserBItems }) => {
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

    try {
      if (type === 'initial_offer') {
        const { data, error } = await supabase.rpc('create_offer', {
          p_user_id: userA.id,
          p_user_id_counter: userB.id,
          p_offer: {
            user: userAItems,
            userCounter: userBItems,
          },
        })

        console.log('return data:', data, error)

        if (error) throw error

        // alert("Trade proposed successfully!");
        // go to main screen
      } else {
        if (!offerId) return

        const { data, error } = await supabase.rpc('counter_offer', {
          p_offer_id: offerId,
          p_user_id: user.id,
          p_user_id_counter: user.id === userA.id ? userB.id : userA.id,
          p_new_offer: {
            user: userAItems,
            userCounter: userBItems,
          },
        })

        console.log('counter offer return data:', data, error)

        if (error) throw error

        // alert("Trade proposed successfully!");
        // go to main screen
      }
    } catch (error) {
      console.error('Error making offer:', error)
      alert('Failed to make offer. Please try again.')
    }
  }

  const UserSection: FC<UserProps> = ({ bg, user, items, showSelectScreen }) => (
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50'
          onClick={() => showSelectScreen(user)}
        >
          + Add NFT
        </motion.button>
      </div>
      <div className='mt-6 flex flex-wrap gap-4'>
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='relative w-32 h-32 rounded-lg overflow-hidden shadow-lg cursor-pointer group'
            onClick={() => {
              if (user === userA) {
                setUserAItems((prev) => prev.filter((i) => i.id !== item.id))
              } else {
                setUserBItems((prev) => prev.filter((i) => i.id !== item.id))
              }
            }}
          >
            <img src={item.image} alt={item.name} className='w-full h-full object-cover' />
            <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
              <span className='text-white text-sm font-semibold'>Remove</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <div className='flex flex-col h-screen overflow-hidden'>
      <UserSection
        bg='none'
        user={userA}
        items={userAItems}
        showSelectScreen={showSelectScreen}
      />
      <UserSection
        bg='bg-gray-50'
        user={userB}
        items={userBItems}
        showSelectScreen={showSelectScreen}
      />

      <div className='p-6'>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='w-full flex justify-center items-center bg-yellow-400 p-4 rounded-md hover:bg-yellow-500 transition-colors duration-200 shadow-md'
          onClick={makeOffer}
        >
          <span className='flex items-center mr-2 text-2xl'>🤝</span>
          <span className='text-gray-800 text-xl font-semibold'>
            {type === 'initial_offer' ? 'Make Offer' : 'Counter Offer'}
          </span>
        </motion.button>
      </div>

      {selectingUser && isSelectingNFTs && (
        <SelectNFT
          user={selectingUser}
          selectedNFTs={selectingUser === userA ? userAItems : userBItems}
          onSelect={handleNFTSelection}
          onClose={closeNFTSelection}
        />
      )}
    </div>
  )
}

export default Select
