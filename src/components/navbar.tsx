// TODO: refactor + finish up search implmentation

'use client'

import { FC, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { debounce } from 'lodash'

import { AccountDropdown, NotificationDropdown, TransactionsDropdown } from '@/components'
import { Login as LoginModal, Onboard as OnboardModal } from '@/components/modals'
import { useIsMobile } from '@/hooks'
import { Close, Hamburger, Login, Search } from '@/icons'
import { useAuth } from '@/providers/authProvider'
import { supabase } from '@/utils/supabaseClient'

const Navbar: FC = () => {
  const { user, loading, profile, hasProfile } = useAuth()
  const isMobile = useIsMobile()
  const [modal, setModal] = useState<boolean | 'login' | 'onboard'>(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<{ nfts: any[]; users: any[] }>({
    nfts: [],
    users: [],
  })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const performSearch = useCallback(async (term: string) => {
    if (term.length < 3) {
      setSearchResults({ nfts: [], users: [] })
      setShowResults(false)
      return
    }

    setIsSearching(true)

    const nftResults = await supabase
      .from('nfts')
      .select('id, name')
      .ilike('name', `%${term}%`)
      .limit(5)

    const userResults = await supabase
      .from('user_profile')
      .select('id, username')
      .ilike('username', `%${term}%`)
      .limit(5)

    setSearchResults({
      nfts: nftResults.data || [],
      users: userResults.data || [],
    })

    setIsSearching(false)
  }, [])

  const debouncedSearch = useCallback(
    debounce((term: string) => performSearch(term), 300),
    [performSearch],
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (user && !loading && !hasProfile) {
      setModal('onboard')
    }
  }, [user, loading, hasProfile])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const renderButtons = (isMobileMenu = false) => (
    <>
      {(user || loading) && (
        <>
          {isMobileMenu ? (
            <>
              <Link
                href='/account/nfts'
                onClick={toggleMenu}
                className='flex items-center text-xl mb-4'
              >
                My NFTs
              </Link>
              <Link
                className='flex items-center text-xl mb-4'
                href='/transactions'
                onClick={toggleMenu}
              >
                Transactions
              </Link>
              <Link
                className='flex items-center text-xl mb-4'
                href='/notifications'
                onClick={toggleMenu}
              >
                Notifications
              </Link>
              <Link
                className='flex items-center text-xl mb-4'
                href='/account/profile'
                onClick={toggleMenu}
              >
                Edit Profile
              </Link>
              <Link
                className='flex items-center text-xl mb-4'
                href={`/${profile?.username}`}
                onClick={toggleMenu}
              >
                View Profile
              </Link>
              <button
                className='flex items-center text-xl mb-4'
                onClick={async () => {
                  await supabase.auth.signOut()
                  toggleMenu()
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <TransactionsDropdown transactions={[]} />
              <NotificationDropdown notifications={notifications} />
              <AccountDropdown username={profile?.username || ''} />
            </>
          )}
        </>
      )}
      {!user && !loading && (
        <button
          className={`flex items-center ${
            isMobileMenu
              ? 'text-xl mb-4'
              : 'bg-black text-white rounded-md px-4 py-2 cursor-pointer font-semibold h-[44px]'
          }`}
          onClick={() => setModal('login')}
        >
          <Login
            className={`${isMobileMenu ? 'w-6 h-6 mr-2' : 'w-6 h-6'} ${
              isMobileMenu ? 'text-black' : 'text-white'
            }`}
          />
          <div className={isMobileMenu ? '' : 'ml-1'}>Login</div>
        </button>
      )}
    </>
  )

  const getLatestNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return
    }

    setNotifications(data)
  }

  useEffect(() => {
    if (user) {
      getLatestNotifications()
    }
  }, [user])

  return (
    <>
      <nav className='z-[20] top-0 fixed w-full bg-white flex justify-between items-center px-2 h-[75px] border-b border-gray-200'>
        <Link href='/'>
          <img src='/logo.png' className='w-[70px] h-[70px] p-2' alt='Logo' />
        </Link>
        <div className='flex-1 max-w-xl mx-4'>
          <div className='relative' ref={searchRef}>
            <input
              type='text'
              placeholder='Search by NFT or User'
              className='w-full px-4 h-[44px] pl-10 pr-4 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              value={searchTerm}
              onChange={handleSearchInputChange}
              onFocus={() => setShowResults(true)}
            />
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search />
            </div>
            {showResults &&
              (searchResults.nfts.length > 0 || searchResults.users.length > 0) && (
                <div className='absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10'>
                  {searchResults.nfts.length > 0 && (
                    <div className='p-2'>
                      <h3 className='text-sm font-semibold mb-1'>NFTs</h3>
                      {searchResults.nfts.map((nft) => (
                        <Link
                          key={nft.id}
                          href={`/nft/${nft.id}`}
                          className='block hover:bg-gray-100 p-2 rounded'
                        >
                          {nft.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.users.length > 0 && (
                    <div className='p-2'>
                      <h3 className='text-sm font-semibold mb-1'>Users</h3>
                      {searchResults.users.map((user) => (
                        <Link
                          key={user.id}
                          href={`/${user.username}`}
                          className='block hover:bg-gray-100 p-2 rounded'
                        >
                          {user.username}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className='p-2 text-center'>
                    <Link
                      href={`/search?q=${encodeURIComponent(searchTerm)}`}
                      className='text-blue-500 hover:underline'
                    >
                      View all results
                    </Link>
                  </div>
                </div>
              )}
          </div>
        </div>
        {isMobile ? (
          <button onClick={toggleMenu} className='p-2'>
            <Hamburger className='w-8' />
          </button>
        ) : (
          <div className='flex gap-x-2 h-[44px] relative mr-2'>{renderButtons()}</div>
        )}
      </nav>
      {isMobile && isMenuOpen && (
        <div className='fixed inset-0 bg-white z-50 flex flex-col'>
          <div className='flex justify-end p-4'>
            <button onClick={toggleMenu} className='p-2'>
              <Close className='w-8 h-8' />
            </button>
          </div>
          <div className='flex-1 flex flex-col px-7 items-end'>{renderButtons(true)}</div>
          <div className='p-4 text-center text-sm text-gray-500'>
            <p>© TFT Labs</p>
            <div className='mt-2 space-x-2'>
              <Link href='/about'>About</Link>
              <Link href='/legal/terms'>Terms</Link>
              <Link href='/legal/privacy'>Privacy</Link>
              <Link href='/discord'>Discord</Link>
            </div>
          </div>
        </div>
      )}
      {modal === 'login' && <LoginModal closeModal={() => setModal(false)} />}
      {modal === 'onboard' && <OnboardModal closeModal={() => setModal(false)} />}
    </>
  )
}

export default Navbar
