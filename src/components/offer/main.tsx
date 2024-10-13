import React, { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { NFTImage } from '@/components/shared'
import { NFTOfferDisplay } from '@/components/shared'
import { Close } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { formatDate, timeAgo } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

const ActivityItem = ({ item, user }: { item: any; user: any }) => {
  const MessageDisplay = ({ item }) => (
    <div className='text-gray-700 text-sm'>{item.content}</div>
  )

  return (
    <div className='w-full'>
      <div className='flex p-4 border-b border-gray-200 w-full hover:bg-gray-50 transition-colors duration-200'>
        <div className='relative w-10 h-10 mr-4 shrink-0'>
          <img
            src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + user?.profile_pic_url}
            alt='Profile'
            className='w-full h-full rounded-full object-cover shadow-sm'
          />
        </div>
        <div className='flex-grow'>
          <div className='flex items-center gap-x-2 mb-1'>
            <div className='text-sm font-semibold text-gray-800'>{user?.username}</div>
            <div className='text-xs text-gray-400'>{formatDate(new Date(item.created_at))}</div>
          </div>
          {item.item_type === 'message' && <MessageDisplay item={item} />}
          {(item.item_type === 'offer' || item.item_type === 'counter_offer') && (
            <NFTOfferDisplay
              userAOffers={item.offer.user}
              userBOffers={item.offer.userCounter}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const Main: FC<{
  offerId: string
  info: any
  acceptOffer: any
  counterOffer: any
  closeModal: any
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

  if (!isLoggedIn || !isParticipant) {
    return (
      <div className='flex flex-col items-center justify-center h-full bg-gray-100 p-4'>
        <p className='text-lg text-gray-700'>
          Waiting for{' '}
          {info?.offer_user_id === info?.user_id ? info?.user?.username : 'counter user'} to
          respond...
        </p>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden'>
      <div className='flex items-center justify-between py-4 px-6 bg-gray-50 border-b border-gray-200'>
        <div className='flex items-center'>
          <img
            src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + info?.user?.profile_pic_url}
            alt={info?.user?.username}
            className='w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm'
          />
          <div className='ml-3'>
            <div className='font-semibold text-gray-800'>{info?.user?.username}</div>
            <div className='text-sm text-gray-500'>
              made an offer {timeAgo(new Date(info?.created_at))}
            </div>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className='cursor-pointer text-gray-500 hover:text-gray-700'
          onClick={closeModal}
        >
          <Close className='w-6 h-6' />
        </motion.div>
      </div>

      <div className='flex-grow overflow-y-auto bg-white'>
        {info &&
          offerActivityItems.map((item: any) => (
            <ActivityItem
              key={item.id}
              item={item}
              user={item.user_id === info?.user_id ? info.user : info.counter_user}
            />
          ))}
      </div>

      <div className='p-4 bg-gray-50 border-t border-gray-200'>
        <form onSubmit={submitMessage} className='flex gap-x-2'>
          <input
            type='text'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder='Send a message...'
            className='flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200'
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type='submit'
            className='bg-blue-500 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200'
            disabled={!newMessage.trim() || !hasProfile}
          >
            Send
          </motion.button>
        </form>
      </div>

      <div className='flex items-center justify-between p-4 bg-gray-100 border-t border-gray-200'>
        {isLatestOfferUser ? (
          <div className='text-center w-full'>
            <p className='text-gray-700 font-semibold'>
              Waiting for a response from the other user...
            </p>
          </div>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='bg-yellow-400 text-gray-800 py-2 px-6 rounded-md shadow-sm cursor-pointer font-semibold text-lg transition-all duration-200'
              onClick={counterOffer}
            >
              🤝 Counter
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='bg-green-400 text-gray-800 py-2 px-6 rounded-md shadow-sm cursor-pointer font-semibold text-lg transition-all duration-200'
              onClick={acceptOffer}
            >
              ✅ Accept
            </motion.button>
          </>
        )}
      </div>
    </div>
  )
}

export default Main
