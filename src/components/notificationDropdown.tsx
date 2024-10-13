'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

import { Notifications } from '@/icons'

interface NotificationProps {
  notification: any
}

const FollowNotification: React.FC<NotificationProps> = ({ notification }) => (
  <div className='flex items-center'>
    <img
      src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL + notification.follower_profile_pic}
      alt={notification.follower_username}
      width={40}
      height={40}
      className='rounded-full mr-3'
    />
    <span>
      <strong>{notification.follower_username}</strong> started following you
    </span>
  </div>
)

const NewOfferNotification: React.FC<NotificationProps> = ({ notification }) => (
  <div>
    <div className='font-semibold mb-2'>New offer received</div>
    <div className='flex justify-between'>
      <div className='flex items-center'>
        <img
          src={notification.offer.user[0].image}
          alt={notification.offer.user[0].name}
          width={30}
          height={30}
          className='rounded-md mr-2'
        />
        <span>{notification.offer.user[0].name}</span>
      </div>
      <span className='text-gray-500'>for</span>
      <div className='flex items-center'>
        <img
          src={notification.offer.userCounter[0].image}
          alt={notification.offer.userCounter[0].name}
          width={30}
          height={30}
          className='rounded-md mr-2'
        />
        <span>{notification.offer.userCounter[0].name}</span>
      </div>
    </div>
  </div>
)

const OfferUpdateNotification: React.FC<NotificationProps> = ({ notification }) => (
  <div>
    <div className='font-semibold mb-2'>Offer updated</div>
    <div className='flex justify-between'>
      <div className='flex flex-col items-center'>
        {notification.offer.user.map((item: any) => (
          <div key={item.id} className='flex items-center mb-1'>
            <img
              src={item.image}
              alt={item.name}
              width={30}
              height={30}
              className='rounded-md mr-2'
            />
            <span className='text-sm'>{item.name}</span>
          </div>
        ))}
      </div>
      <span className='text-gray-500 self-center'>for</span>
      <div className='flex flex-col items-center'>
        {notification.offer.userCounter.map((item: any) => (
          <div key={item.id} className='flex items-center mb-1'>
            <img
              src={item.image}
              alt={item.name}
              width={30}
              height={30}
              className='rounded-md mr-2'
            />
            <span className='text-sm'>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const OfferAcceptedNotification: React.FC<NotificationProps> = ({ notification }) => (
  <div>
    <div className='font-semibold mb-2'>Offer accepted</div>
    <div className='flex justify-between'>
      <div className='flex flex-col items-center'>
        {notification.offer.user.map((item: any) => (
          <div key={item.id} className='flex items-center mb-1'>
            <img
              src={item.image}
              alt={item.name}
              width={30}
              height={30}
              className='rounded-md mr-2'
            />
            <span className='text-sm'>{item.name}</span>
          </div>
        ))}
      </div>
      <span className='text-gray-500 self-center'>for</span>
      <div className='flex flex-col items-center'>
        {notification.offer.userCounter.map((item: any) => (
          <div key={item.id} className='flex items-center mb-1'>
            <img
              src={item.image}
              alt={item.name}
              width={30}
              height={30}
              className='rounded-md mr-2'
            />
            <span className='text-sm'>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

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

  const renderNotification = (notification: any) => {
    switch (notification.notification_type) {
      case 'follow':
        return <FollowNotification notification={notification.metadata} />
      case 'new_offer':
        return <NewOfferNotification notification={notification.metadata} />
      case 'offer_update':
        return <OfferUpdateNotification notification={notification.metadata} />
      case 'offer_accepted':
        return <OfferAcceptedNotification notification={notification.metadata} />
      default:
        return <div>Unknown notification type</div>
    }
  }

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
                  {renderNotification(notification)}
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
