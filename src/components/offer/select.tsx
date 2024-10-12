import { FC, useState } from 'react'

import { useAuth } from '@/providers/authProvider'
import { NFTOfferMetadata, ProfileMinimal } from '@/types/supabase'
import { supabase } from '@/utils/supabaseClient'

import SelectNFT from './selectNft'

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
    <div className={`flex-1 p-5 relative ${bg}`}>
      <div className='flex items-center'>
        <img
          src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user?.profile_pic_url}
          alt='Profile Picture'
          className='w-10 h-10 rounded-full'
        />
        <div className='text-lg font-semibold ml-2'>{user?.username}</div>
      </div>
      <button
        className='absolute top-5 right-5 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200'
        onClick={() => showSelectScreen(user)}
      >
        + Add NFT
      </button>
      <div className='mt-6 flex-wrap flex p-2'>
        {items.map((item, index) => (
          <div
            key={index}
            className='w-32 h-32 border-gray-900 rounded-lg text-center cursor-pointer shadow-md'
            onClick={() => {
              if (user === userA) {
                setUserAItems((prev) => prev.filter((i) => i.id !== item.id))
              } else {
                setUserBItems((prev) => prev.filter((i) => i.id !== item.id))
              }
            }}
          >
            <img src={item.image} alt={item.name} className='w-32 h-32 object-cover rounded' />
            {/* <p className='mt-2'>{item.name}</p> */}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className='flex flex-col h-screen rounded-lg bg-gray-100 overflow-hidden'>
      <UserSection
        bg='bg-gray-50'
        user={userA}
        items={userAItems}
        showSelectScreen={showSelectScreen}
      />
      <UserSection
        bg='bg-gray-100'
        user={userB}
        items={userBItems}
        showSelectScreen={showSelectScreen}
      />

      <button
        className='p-4 m-5 bg-yellow-200 text-lg rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200'
        onClick={makeOffer}
      >
        {type === 'initial_offer' ? 'Propose Trade' : 'Counter Offer'}
      </button>

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
