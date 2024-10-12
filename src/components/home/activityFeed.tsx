import React, { FC, useEffect, useState } from 'react'

import { NFTOfferDisplay } from '@/components/shared'
import { useChatScroll } from '@/hooks'
import { CollapsibleIcon } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { Activity } from '@/types/supabase'
import { FEED_ITEMS_PER_PAGE } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'
import { supabase } from '@/utils/supabaseClient'

function renderMessageText(text: string) {
  // This regex matches URLs with common TLDs, requiring either www. or http(s)://
  const urlRegex =
    /\b(?:https?:\/\/|www\.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|](?:\.(?:com|net|org|edu|gov|mil|co|io|ai|app|dev|xyz))\b/gi

  const parts: (string | JSX.Element)[] = []
  let lastIndex = 0
  let match

  while ((match = urlRegex.exec(text)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Add the matched URL
    let fullUrl = match[0]
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl
    }

    parts.push(
      <a
        key={match.index}
        href={fullUrl}
        target='_blank'
        rel='noopener noreferrer'
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className='underline'
      >
        {match[0]}
      </a>,
    )

    lastIndex = urlRegex.lastIndex
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <>{parts}</>
}

const FeedItem = ({ activity }: { activity: Activity }) => {
  return (
    <div key={activity.id} className='flex items-start border-b border-gray-100 p-4'>
      <div className='relative w-12 h-12 mr-3 shrink-0'>
        <img
          src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + activity.profile_pic_url}
          alt='Profile'
          className='w-full h-full rounded-full'
        />
      </div>
      <div>
        <div className='flex items-center gap-x-2'>
          <div className='text-sm font-semibold'>{activity.username}</div>
          <div className='text-xs text-gray-400'>
            {formatDate(new Date(activity.created_at))}
          </div>
        </div>
        {activity.activity_type === 'message' && (
          <div className='mt-1'>{renderMessageText(activity.content || '')}</div>
        )}
        {activity.activity_type === 'pin' && (
          <div className='mt-1'>
            <div>
              📌 pinned{' '}
              <span className='font-semibold'>
                {(activity.metadata as { nft_name: string }).nft_name}
              </span>
            </div>
            <img
              src={(activity.metadata as { nft_image: string }).nft_image}
              className='mt-2 w-12 h-12 rounded-md'
              alt='NFT'
            />
          </div>
        )}
        {(activity.activity_type === 'offer_start' ||
          activity.activity_type === 'offer_counter') && <NFTOfferDisplay item={activity} />}
      </div>
    </div>
  )
}

const ActivityFeed: FC<{ showCollapsibleTab: boolean }> = ({ showCollapsibleTab = true }) => {
  const { user, profile } = useAuth()
  const { showToast } = useToast()

  const [feedCollapsed, setFeedCollapsed] = useState(false)
  const toggleFeed = () => setFeedCollapsed(!feedCollapsed)

  const [activities, setActivities] = useState<Activity[]>([])
  const [newMessage, setNewMessage] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)

  const { chatContainerRef, scrollToBottom, isNearBottom } = useChatScroll([activities])

  useEffect(() => {
    // Subscribe to real-time updates
    supabase
      .channel('activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
        },
        (payload) => {
          // Ignore own messages
          if (payload.new.user_id === user?.id) return

          const shouldScroll = isNearBottom()
          setActivities((prevActivities) => [...prevActivities, payload.new as Activity])
          if (shouldScroll) {
            scrollToBottom()
          }
        },
      )
      .subscribe()

    // Fetch initial activities
    fetchActivities(page)

    return () => {
      supabase.channel('activities').unsubscribe()
    }
  }, [user?.id])

  const fetchActivities = async (page: number) => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * FEED_ITEMS_PER_PAGE, page * FEED_ITEMS_PER_PAGE - 1)

      if (error) {
        showToast(`⚠️ Failed to fetch activities`, 2500)
        throw error
      }

      if (data && data.length > 0) {
        const reversedData = data.reverse()
        setActivities((prevActivities) => [...reversedData, ...prevActivities])
      } else {
        setHasMore(false)
      }
    } catch (error) {
      showToast(`⚠️ Failed to fetch activities`, 2500)
      console.error('Failed to fetch activities', error)
    } finally {
      setLoading(false)
    }
  }

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!newMessage.trim()) return

    if (!user || !profile) {
      showToast(`⚠️ You have to login to use this`, 2500)
      return
    }

    if (profile?.banned) {
      showToast(`⚠️ You are banned from commenting`, 2500)
      return
    }

    try {
      const optimisticId = Math.random()
      const newMsg = {
        user_id: profile.id,
        activity_type: 'message',
        content: newMessage.trim(),
        username: profile.username,
        profile_pic_url: profile.profile_pic_url,
      }

      // optimistaclly update the UI
      const shouldScroll = isNearBottom()
      setActivities((prevActivities) => [
        ...prevActivities,
        {
          ...newMsg,
          id: optimisticId,
          created_at: new Date().toISOString(),
          metadata: null,
        } as unknown as Activity,
      ])

      const { error } = await supabase.from('activities').insert(newMsg)

      if (error) {
        showToast(`⚠️ Failed to send message`, 2500)
        console.error('Error submitting comment:', error)
        setActivities(activities.filter((activity) => Number(activity.id) !== optimisticId))
      } else {
        setNewMessage('')
      }

      if (shouldScroll) {
        scrollToBottom()
      }
    } catch (error) {
      showToast(`⚠️ Failed to send message`, 2500)
      console.error('Failed to send message', error)
    }
  }

  const desktopStyle = `shadow-[0_0_3px_#bbbbbb] hidden lg:flex flex-col h-full ${
    feedCollapsed ? 'w-12' : 'w-[460px]'
  } bg-white transition-all duration-300 ease-in-out shrink-0`
  const mobileStyle = `h-full w-full flex flex-col`

  return (
    <div className={`${showCollapsibleTab ? desktopStyle : mobileStyle}`}>
      {showCollapsibleTab && (
        <button
          onClick={toggleFeed}
          className={`relative bg-white flex items-center justify-center text-lg font-semibold py-2 border-b border-gray-100 w-full ${
            feedCollapsed ? 'h-full' : 'px-4'
          }`}
        >
          {feedCollapsed ? (
            <div className='w-full h-full flex items-center justify-center'>
              <CollapsibleIcon collapsed={feedCollapsed} />
            </div>
          ) : (
            <>
              <div className='absolute left-4'>
                <CollapsibleIcon collapsed={feedCollapsed} />
              </div>
              <span className='flex-grow text-center'>Activity</span>
            </>
          )}
        </button>
      )}
      {!feedCollapsed && (
        <>
          <div ref={chatContainerRef} className='flex-1 overflow-y-auto hide-scrollbar'>
            {activities.length > 0 && hasMore && (
              <button
                className='bg-gray-200 py-2 text-gray-700 hover:bg-gray-300 transition-colors duration-300 text-center w-full'
                onClick={() => {
                  const nextPage = page + 1
                  setPage(nextPage)
                  fetchActivities(nextPage)
                }}
              >
                Load more
              </button>
            )}
            {activities.map((activity: Activity) => (
              <FeedItem key={activity.id} activity={activity} />
            ))}
          </div>
          <div className='p-3'>
            <form onSubmit={submitMessage} className='gap-x-2 flex'>
              <input
                type='text'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder='Send a message...'
                className='flex-grow px-3 py-2 border border-gray-300 rounded-md'
              />
              <button
                type='submit'
                className='bg-gray-800 text-white p-2 rounded-md'
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default ActivityFeed
