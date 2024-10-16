'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Notifications } from '@/icons'
import { timeAgoShort } from '@/utils/helpers'

interface NotificationMetadata {
  offer_id?: string
  username: string
  profile_pic_url: string
}

interface Notification {
  id: string
  notification_type: string
  metadata: NotificationMetadata
  updated_at: string
}

interface NotificationProps {
  notification: Notification
}

const SimpleNotification: React.FC<NotificationProps> = ({ notification }) => {
  const getMessage = () => {
    const name = <strong>{notification.metadata.username}</strong>
    switch (notification.notification_type) {
      case 'follow':
        return <>{name} started following you</>
      case 'offer_new':
        return <>{name} made you an offer</>
      case 'offer_update':
        return <>{name} sent an update</>
      case 'offer_accepted':
        return <>{name} accepted your offer</>
      default:
        return 'Unknown notification'
    }
  }

  return (
    <div className='flex items-center'>
      <img
        src={
          process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + notification.metadata.profile_pic_url
        }
        alt='Profile Picture'
        width={40}
        height={40}
        className='rounded-full mr-3'
      />
      <span>{getMessage()}</span>
      <span className='ml-auto text-sm font-semibold text-gray-600'>
        {timeAgoShort(new Date(notification.updated_at))}
      </span>
    </div>
  )
}

interface NotificationDropdownProps {
  notifications: Notification[]
  selectOffer: (offerId: string) => void
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  selectOffer,
}) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => setIsOpen(!isOpen)

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className='h-full w-[45px] rounded-md bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors'
      >
        <Notifications className='w-[22px] h-[22px]' />
        {notifications.length > 0 && (
          <span className='z-10 absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full'>
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute max-h-96 right-0 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-10 flex flex-col'>
          <div
            className={`min-h-[350px] flex flex-col flex-grow w-full overflow-y-auto hide-scrollbar ${notifications.length === 0 ? 'justify-center' : ''}`}
          >
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className='px-4 py-3 hover:bg-gray-50 border-b border-gray-200 w-full cursor-pointer'
                  onClick={() => {
                    if (notification.notification_type !== 'follow') {
                      selectOffer(notification.metadata.offer_id!)
                    } else {
                      router.push(`/${notification.metadata.username}`)
                    }
                  }}
                >
                  <SimpleNotification notification={notification} />
                </div>
              ))
            ) : (
              <div className='flex flex-col items-center justify-center h-full p-6 text-center'>
                <Notifications className='w-6 h-6' />
                <h3 className='text-lg font-semibold my-2'>No New Notifications</h3>
                <p className='text-sm text-gray-500 px-6'>
                  When you have new notifications, they&apos;ll appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
