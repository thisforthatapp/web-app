import React, { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { NFTOfferDisplay } from '@/components/shared'
import { Close } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { formatDate, timeAgo } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

const MessageDisplay: FC<{ item: any }> = ({ item }) => (
  <div className='text-gray-700 text-sm'>{item.content}</div>
)

const ActivityItem: FC<{ item: any; user: any; isLastItem: boolean }> = ({
  item,
  user,
  isLastItem,
}) => {
  return (
    <div className={`w-full ${!isLastItem ? 'border-b border-gray-100' : ''}`}>
      <div className='p-4'>
        <div className='flex items-start mb-2'>
          <div className='relative w-10 h-10 mr-2 shrink-0'>
            <img
              src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user?.profile_pic_url}
              alt='Profile'
              className='w-full h-full rounded-full object-cover shadow-sm'
            />
          </div>
          <div className='flex-grow'>
            <div className='flex items-center gap-x-2 mb-1'>
              <div className='text-sm font-semibold text-gray-800'>{user?.username}</div>
              <div className='text-xs text-gray-400'>
                {formatDate(new Date(item.created_at))}
              </div>
            </div>
            {item.item_type === 'message' && <MessageDisplay item={item} />}
            {(item.item_type === 'offer' || item.item_type === 'counter_offer') && (
              <div className='text-sm'>
                {item.item_type === 'offer' ? '🤝 Made an offer' : '🤝 Countered the offer'}
              </div>
            )}
          </div>
        </div>
        {(item.item_type === 'offer' || item.item_type === 'counter_offer') && (
          <div className='mt-4 w-full'>
            <NFTOfferDisplay
              userAOffers={item.offer.user}
              userBOffers={item.offer.userCounter}
              size='medium'
            />
          </div>
        )}
      </div>
    </div>
  )
}

const Main: FC<{
  offerId: string
  info: any
  acceptOffer: () => void
  counterOffer: () => void
  closeModal: () => void
}> = ({ offerId, info, acceptOffer, counterOffer, closeModal }) => {
  const { user, profile, hasProfile } = useAuth()
  const [newMessage, setNewMessage] = useState<string>('')
  const [offerActivityItems, setOfferActivityItems] = useState<any[]>([])

  const fetchOfferActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('user_offer_items')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false })
        .limit(25)

      if (error) throw error

      setOfferActivityItems(data.reverse())
    } catch (error) {
      console.error('Failed to fetch activities', error)
    }
  }

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newMessage.trim() || !profile) return

    try {
      if (profile?.banned) {
        alert('You are banned from commenting.')
        return
      }

      const optimisticId = Math.random()
      const newOfferItem = {
        offer_id: offerId,
        user_id: profile.id,
        item_type: 'message',
        content: newMessage.trim(),
      }

      setOfferActivityItems((prev) => [
        ...prev,
        {
          ...newOfferItem,
          id: optimisticId,
          created_at: new Date().toISOString(),
        } as unknown,
      ])

      const { error } = await supabase.from('user_offer_items').insert(newOfferItem)

      if (error) {
        console.error('Error submitting comment:', error)
        setOfferActivityItems((prev) => prev.filter((item) => Number(item.id) !== optimisticId))
      } else {
        setNewMessage('')
      }
    } catch (error) {
      console.error('Failed to send message', error)
    }
  }

  useEffect(() => {
    if (offerId) fetchOfferActivity()
  }, [offerId])

  const isInitialOfferUser = user?.id === info?.user_id
  const isCounterUser = user?.id === info?.user_id_counter
  const isLatestOfferUser = user?.id === info?.offer_user_id
  const isLoggedIn = !!user
  const isParticipant = isInitialOfferUser || isCounterUser

  return (
    <div className='flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden'>
      <div className='flex items-center justify-between py-4 px-6 bg-white border-b border-gray-100'>
        <div className='text-xl font-bold text-gray-800'>🤝 Swap Offer</div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className='cursor-pointer text-gray-500 hover:text-gray-700'
          onClick={closeModal}
        >
          <Close className='w-6 h-6' />
        </motion.div>
      </div>

      <div className='flex-grow overflow-y-auto bg-gray-50'>
        {info &&
          offerActivityItems.map((item: any, index: number) => (
            <ActivityItem
              key={item.id}
              item={item}
              user={item.user_id === info?.user_id ? info.user : info.counter_user}
              isLastItem={index === offerActivityItems.length - 1}
            />
          ))}
      </div>

      <div className='p-4 border-t border-gray-100'>
        <form onSubmit={submitMessage} className='flex gap-x-2'>
          <input
            type='text'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder='Send a message...'
            className='flex-grow px-4 py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200'
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type='submit'
            className='bg-gray-800 text-white px-6 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200'
            disabled={!newMessage.trim() || !hasProfile}
          >
            Send
          </motion.button>
        </form>
      </div>

      <div className='flex items-center justify-between p-4 pt-0'>
        {!isLoggedIn || !isParticipant ? (
          <div className='flex flex-col items-center justify-center h-full bg-gray-50 p-4'>
            <p className='text-lg text-gray-700'>
              Waiting for{' '}
              {info?.offer_user_id === info?.user_id ? info?.user?.username : 'counter user'} to
              respond...
            </p>
          </div>
        ) : isLatestOfferUser ? (
          <div className='text-center w-full'>
            <p className='text-gray-700 font-semibold'>
              Waiting for a response from the other user...
            </p>
          </div>
        ) : (
          <div className='flex flex-col w-full'>
            <div className='flex w-full gap-x-4'>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='w-full bg-yellow-400 text-gray-800 py-3 px-6 rounded-full shadow-sm cursor-pointer font-semibold text-lg transition-all duration-200'
                onClick={counterOffer}
              >
                Counter
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='w-full bg-green-400 text-gray-800 py-3 px-6 rounded-full shadow-sm cursor-pointer font-semibold text-lg transition-all duration-200'
                onClick={acceptOffer}
              >
                Accept
              </motion.button>
            </div>
            <div className='mt-4 text-gray-500 text-sm text-center mx-8'>
              Accepting the offer will start the on-chain swap.
              <br />
              <a href='#' className='text-gray-500 font-semibold underline'>
                Learn more about swapping here.
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Main
