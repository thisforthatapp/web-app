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
      <div className='relative w-10 h-10 mr-2 shrink-0'>
        <img
          src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + activity.profile_pic_url}
          alt='Profile'
          className='w-full h-full rounded-full'
        />
      </div>
      <div className='w-full'>
        <div className='flex items-center gap-x-2'>
          <div className='text-sm font-semibold'>{activity.username}</div>
          <div className='text-xs text-gray-400'>
            {formatDate(new Date(activity.created_at))}
          </div>
        </div>
        {activity.activity_type === 'message' && (
          <div className='mt-1 text-sm'>{renderMessageText(activity.content || '')}</div>
        )}
        {(activity.activity_type === 'offer_start' ||
          activity.activity_type === 'offer_accepted' ||
          activity.activity_type === 'offer_counter') && (
          <div className='mt-1'>
            <div className='text-sm mb-1'>
              {activity.activity_type === 'offer_start'
                ? '🤝 made an offer'
                : activity.activity_type === 'offer_counter'
                  ? '🤝 made a counter offer'
                  : '✅ accepted an offer'}
            </div>
            <NFTOfferDisplay
              userAOffers={(activity.metadata as any).offer.user}
              userBOffers={(activity.metadata as any).offer.userCounter}
            />
          </div>
        )}
      </div>
    </div>
  )
}

type FilterType = 'all' | 'messages' | 'swaps'

const ActivityFeed: FC<{ showCollapsibleTab: boolean }> = ({ showCollapsibleTab = true }) => {
  const { user, profile } = useAuth()
  const { showToast } = useToast()

  const [feedCollapsed, setFeedCollapsed] = useState(false)
  const toggleFeed = () => setFeedCollapsed(!feedCollapsed)

  const [activities, setActivities] = useState<Activity[]>([])
  const [newMessage, setNewMessage] = useState<string>('')
  const [filter, setFilter] = useState<FilterType>('all')

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
          if (filter === 'messages' && payload.new.activity_type !== 'message') return
          if (filter === 'swaps' && payload.new.activity_type === 'message') return
          setActivities((prevActivities) => [...prevActivities, payload.new as Activity])
          if (shouldScroll) {
            scrollToBottom()
          }
        },
      )
      .subscribe()

    // Fetch initial activities
    setPage(1)
    fetchActivities(1, filter)

    return () => {
      supabase.channel('activities').unsubscribe()
    }
  }, [user?.id])

  const fetchActivities = async (page: number, currentFilter: FilterType) => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })

      if (currentFilter === 'messages') {
        query = query.eq('activity_type', 'message')
      } else if (currentFilter === 'swaps') {
        query = query.neq('activity_type', 'message')
      }

      const { data, error } = await query.range(
        (page - 1) * FEED_ITEMS_PER_PAGE,
        page * FEED_ITEMS_PER_PAGE - 1,
      )

      if (error) {
        showToast(`⚠️ Failed to fetch activities`, 2500)
        throw error
      }

      if (data && data.length > 0) {
        const reversedData = data.reverse()
        setActivities((prevActivities) =>
          page === 1 ? reversedData : [...prevActivities, ...reversedData],
        )
        setHasMore(data.length === FEED_ITEMS_PER_PAGE)
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
      showToast(`⚠️ You have to login first`, 2500)
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

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true
    if (filter === 'messages') return activity.activity_type === 'message'
    if (filter === 'swaps') return activity.activity_type !== 'message'
    return true
  })

  const desktopStyle = `shadow-[0_0_3px_#bbbbbb] hidden lg:flex flex-col h-full ${
    feedCollapsed ? 'w-12' : 'w-[460px]'
  } bg-gray-50 transition-all duration-300 ease-in-out shrink-0`
  const mobileStyle = `h-full w-full flex flex-col`

  return (
    <div
      className={`${showCollapsibleTab ? desktopStyle : mobileStyle} rounded-l-xl overflow-hidden`}
    >
      {showCollapsibleTab && (
        <div
          className={`bg-gray-800 cursor-pointer flex items-center justify-between ${feedCollapsed ? 'h-full flex-col' : ''}`}
          onClick={toggleFeed}
        >
          {feedCollapsed ? (
            <div className='w-full h-full flex flex-col items-center justify-between p-4 text-white'>
              <div className='writing-vertical-lr transform rotate-180 text-lg font-semibold flex-grow flex items-center'>
                Latest Activity
              </div>
              <CollapsibleIcon className='mt-2' collapsed={false} />
            </div>
          ) : (
            <>
              <div className='text-white flex items-center py-3 px-4'>
                <CollapsibleIcon collapsed={feedCollapsed} />
                <span className='ml-2 font-semibold'>Latest Activity</span>
              </div>
              <div className='flex space-x-1 ml-auto mr-4'>
                {(['all', 'messages', 'swaps'] as FilterType[]).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={(e) => {
                      e.stopPropagation()
                      setFilter(filterType)
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                      filter === filterType
                        ? 'bg-white text-gray-800'
                        : 'text-white hover:bg-gray-700'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {!feedCollapsed && (
        <>
          <div
            ref={chatContainerRef}
            className='flex flex-col flex-1 overflow-y-auto hide-scrollbar'
          >
            {filteredActivities.length > 0 && hasMore && (
              <button
                className='bg-gray-100 py-2 px-6 text-gray-600 hover:bg-gray-200 transition-colors duration-300 text-sm font-medium my-4 mx-auto rounded-full shadow-sm flex items-center'
                onClick={() => {
                  const nextPage = page + 1
                  setPage(nextPage)
                  fetchActivities(nextPage, filter)
                }}
              >
                Load more
              </button>
            )}
            {filteredActivities.map((activity: Activity) => (
              <FeedItem key={activity.id} activity={activity} />
            ))}
          </div>
          <div className='p-4 bg-gray-50 border-t border-gray-100'>
            <form onSubmit={submitMessage} className='flex items-center gap-x-2'>
              <input
                type='text'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder='Send a message...'
                className='flex-grow px-4 py-2 border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent'
              />
              <button
                type='submit'
                className='bg-gray-800 text-white px-6 py-2 rounded-full hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
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
