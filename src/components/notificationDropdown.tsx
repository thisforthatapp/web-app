'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Notifications } from '@/icons'

interface NotificationProps {
  notification: any
}

const SimpleNotification: React.FC<NotificationProps> = ({ notification }) => {
  const getMessage = () => {
    switch (notification.notification_type) {
      case 'follow':
        return `${notification.metadata.follower_username} started following you`
      case 'new_offer':
        return `${notification.metadata.offer.user[0].name} made you an offer`
      case 'offer_update':
        return `${notification.metadata.offer.user[0].name} sent an update`
      case 'offer_accepted':
        return `${notification.metadata.offer.user[0].name} accepted your offer`
      default:
        return 'Unknown notification'
    }
  }

  return (
    <div className='flex items-center'>
      <img
        src={
          notification.metadata.follower_profile_pic ||
          notification.metadata.offer.user[0].image
        }
        alt='User avatar'
        width={40}
        height={40}
        className='rounded-full mr-3'
      />
      <span>{getMessage()}</span>
    </div>
  )
}

const NotificationDropdown = ({ notifications }) => {
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
        className='h-full w-[45px] rounded-md bg-gray-100 flex items-center justify-center'
      >
        <Notifications className='w-[22px] h-[22px]' />
        {notifications.length > 0 && (
          <span className='z-10 absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full'>
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute max-h-96 right-[-55px] mt-[10px] w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-10 flex flex-col'>
          <div className='min-h-[350px] flex flex-col flex-grow w-full overflow-y-auto hide-scrollbar'>
            {notifications.length > 0 ? (
              notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className='px-4 py-3 hover:bg-gray-50 border-b border-gray-200 w-full'
                >
                  <SimpleNotification notification={notification} />
                </div>
              ))
            ) : (
              <div className='flex flex-grow items-center justify-center px-4 py-3 text-sm text-gray-500'>
                No new notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
