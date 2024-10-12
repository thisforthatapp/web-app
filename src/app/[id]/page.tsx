'use client'

import { FC, useEffect, useState } from 'react'

import { Offer } from '@/components/modals'
import { NFTFeedItem, OfferFeedItem } from '@/components/shared'
import { UserNavigation } from '@/components/user'
import { useAuth } from '@/providers/authProvider'
import { useToast } from '@/providers/toastProvider'
import { UserTabOption } from '@/types/main'
import {
  NFTFeedItem as NFTFeedItemType,
  OfferFeedItem as OfferFeedItemType,
  Profile,
} from '@/types/supabase'
import { GRID_ITEMS_PER_PAGE } from '@/utils/constants'
import { supabase } from '@/utils/supabaseClient'

interface UserPageProps {
  params: {
    id: string
  }
}

const ProfilePicture = ({ profilePicUrl }: { profilePicUrl: string | null }) => (
  <div className='relative w-[175px] h-[175px] bg-gray-100 rounded-full'>
    {profilePicUrl && (
      <img
        src={process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL! + profilePicUrl}
        alt='Profile Picture'
        className='w-full h-full rounded-full'
      />
    )}
  </div>
)

const FollowButton = ({
  isFollowing,
  onClick,
}: {
  isFollowing: boolean
  onClick: () => void
}) => (
  <div
    className={`flex items-center border px-3 py-1 rounded-full mt-[-14px] z-10 cursor-pointer ${
      isFollowing ? 'bg-gray-800 text-white' : 'bg-gray-100 border-gray-200'
    }`}
    onClick={onClick}
  >
    {isFollowing ? 'Unfollow' : 'Follow'}
  </div>
)

const UserInfo = ({ username, bio }: { username: string | null; bio: string | null }) => (
  <>
    <div className='flex items-center mt-4'>
      <div className='text-3xl font-bold'>{username}</div>
    </div>
    <p className='text-gray-600 mt-2'>{bio}</p>
  </>
)

const OfferGrid: React.FC<{
  items: OfferFeedItemType[]
  expandOffer: (item: OfferFeedItemType) => void
}> = ({ items, expandOffer }) => (
  <div className='p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'>
    {items.map((item) => (
      <OfferFeedItem key={item.id} item={item} expandOffer={expandOffer} />
    ))}
  </div>
)

const NFTGrid = ({
  items,
  makeOffer,
  pinItem,
}: {
  items: NFTFeedItemType[]
  makeOffer: (item: NFTFeedItemType) => void
  pinItem: (item: NFTFeedItemType) => void
}) => (
  <div className='p-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6'>
    {items.map((item) => (
      <NFTFeedItem key={item.nft_id} item={item} makeOffer={makeOffer} pinItem={pinItem} />
    ))}
  </div>
)

const UserPage: FC<UserPageProps> = ({ params }) => {
  const { user, loading, profile } = useAuth()
  const { showToast } = useToast()
  const [makeOfferItem, setMakeOfferItem] = useState<NFTFeedItemType | null>(null)
  const [viewOfferItem, setViewOfferItem] = useState<OfferFeedItemType | null>(null)

  const [userPageProfile, setUserPageProfile] = useState<Profile | null>(null)
  const [isFollowing, setIsFollowing] = useState<boolean>(false)

  const [items, setItems] = useState<(NFTFeedItemType | OfferFeedItemType)[]>([])
  const [tabOption, setTabOption] = useState<UserTabOption>('yes_for_swap')
  const [, setPage] = useState(1)
  const [, setHasMore] = useState(true)

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('user_profile')
      .select('*')
      .eq('username', params.id)
      .single()

    if (error) {
      showToast(`⚠️ Error fetching profile`, 2500)
      console.error('Error fetching profile:', error)
      return
    }

    setUserPageProfile(data)
  }

  const checkIfFollowing = async () => {
    if (!user) return
    if (!userPageProfile) return

    const { data, error } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', user?.id)
      .eq('followed_id', userPageProfile?.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      showToast(`⚠️ Error getting follow status`, 2500)
      console.error('Error checking follow status:', error)
      return
    }
    setIsFollowing(!!data)
  }

  const handleFollow = async () => {
    if (!user) return
    if (!userPageProfile) return

    if (user.id === userPageProfile.id) {
      showToast(`⚠️ You can't follow yourself`, 2500)
      return
    }

    if (isFollowing) {
      setIsFollowing(false)

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user?.id)
        .eq('followed_id', userPageProfile?.id)

      if (error) {
        showToast(`⚠️ Error unfollowing user`, 2500)
        console.error('Error unfollowing user:', error)
        return
      }
    } else {
      setIsFollowing(true)

      const { error } = await supabase.from('user_follows').insert([
        {
          follower_id: user?.id,
          followed_id: userPageProfile?.id,
        },
      ])

      if (error) {
        showToast(`⚠️ Error following user`, 2500)
        console.error('Error following user:', error)
        return
      }
    }
  }

  useEffect(() => {
    if (loading) return

    if (params.id === profile?.username) {
      setUserPageProfile(profile)
    } else {
      fetchProfile()
    }
  }, [loading, profile])

  useEffect(() => {
    if (loading) return

    if (userPageProfile?.id !== profile?.id) {
      checkIfFollowing()
    }
  }, [loading, userPageProfile])

  const fetchItems = async (tabOption: UserTabOption, page: number) => {
    const rangeStart = (page - 1) * GRID_ITEMS_PER_PAGE
    const rangeEnd = page * GRID_ITEMS_PER_PAGE - 1

    const baseParams = {
      page_user_id: userPageProfile?.id,
      current_user_id: user?.id,
      range_start: rangeStart,
      range_end: rangeEnd,
    }

    let query

    switch (tabOption) {
      case 'yes_for_swap':
      case 'no_for_swap':
        query = supabase.rpc('get_user_feed', {
          ...baseParams,
          nft_for_swap: tabOption === 'yes_for_swap',
        })
        break
      case 'pinned':
        query = supabase.rpc('get_user_pinned_feed', baseParams)
        break
      case 'offers':
        query = supabase
          .from('user_offers')
          .select(
            '*, user:user_profile!user_offers_user_id_fkey(*), counter_user:user_profile!user_offers_user_id_counter_fkey(*)',
          )
          .or(`user_id.eq.${userPageProfile?.id},user_id_counter.eq.${userPageProfile?.id}`)
          .order('updated_at', { ascending: false })
          .range(rangeStart, rangeEnd)
        break
      default:
        query = supabase.rpc('get_user_feed', {
          ...baseParams,
          nft_for_swap: true,
        })
        break
    }

    const { data, error } = await query

    if (error) {
      showToast(`⚠️ Error fetching items`, 2500)
      console.error('Error fetching items:', error)
      return
    }

    if (tabOption !== 'offers') {
      const dataUpdated = data.map((nft: NFTFeedItemType) => ({
        ...nft,
        nft_user_id_username: userPageProfile?.username,
        nft_user_id_profile_pic_url: userPageProfile?.profile_pic_url,
      }))

      setItems((prevNfts) => {
        if (page === 1) return dataUpdated
        const newNfts = dataUpdated.filter(
          (newNft: NFTFeedItemType) =>
            !prevNfts.some((prevNft) => (prevNft as NFTFeedItemType).nft_id === newNft.nft_id),
        )
        return [...prevNfts, ...newNfts]
      })
    } else {
      setItems((prevOffers) => {
        if (page === 1) return data
        const newOffers = data.filter(
          (newOffer: OfferFeedItemType) =>
            !prevOffers.some(
              (prevOffer) => (prevOffer as OfferFeedItemType).id === newOffer.id,
            ),
        )
        return [...prevOffers, ...newOffers]
      })
    }

    setHasMore(data.length === GRID_ITEMS_PER_PAGE)
  }

  useEffect(() => {
    if (tabOption && userPageProfile && !loading) {
      fetchItems(tabOption, 1)
      setPage(1)
    }
  }, [tabOption, userPageProfile, loading])

  const makeOffer = async (nft: NFTFeedItemType) => {
    if (!user) {
      showToast(`⚠️ You have to login to use this`, 2500)
      return
    }

    if (nft.nft_user_id === user.id) {
      showToast(`⚠️ You can't make an offer on your own NFT`, 2500)
      return
    }

    setMakeOfferItem(nft)
  }

  const expandOffer = async (offer: OfferFeedItemType) => {
    setViewOfferItem(offer)
  }

  /* only allows pins for now. too many notifs if allow pin/unpin */
  const pinItem = async (nft: NFTFeedItemType) => {
    if (!user) {
      showToast(`⚠️ You have to login to use this`, 2500)
      return
    }

    if (nft.is_pinned) {
      showToast(`✅ NFT already pinned`, 1500)
      return
    }

    const updatedNFTs = (items as NFTFeedItemType[]).map((item: NFTFeedItemType) => {
      if (item.nft_id === nft.nft_id) {
        const isCurrentlyPinned = item.is_pinned
        return {
          ...item,
          is_pinned: !isCurrentlyPinned,
          nft_pins: isCurrentlyPinned ? item.nft_pins - 1 : item.nft_pins + 1,
        }
      }
      return item
    })

    setItems(updatedNFTs)
    showToast(`✅ NFT pinned`, 1500)

    const { error } = await supabase.from('user_pins').insert([
      {
        user_id: user?.id,
        nft_id: nft.nft_id,
      },
    ])

    if (error) {
      showToast(`⚠️ Error pinning NFT`, 2500)
      console.error('Error pinning NFT:', error)
      return
    }
  }

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex justify-center'>
      <div className='w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar'>
        <div className='px-8 md:container md:mx-auto'>
          <div className='mt-12 mb-4 flex justify-center'>
            <div className='flex flex-col items-center'>
              <ProfilePicture profilePicUrl={userPageProfile?.profile_pic_url || null} />
              <FollowButton isFollowing={isFollowing} onClick={handleFollow} />
              <UserInfo
                username={userPageProfile?.username || null}
                bio={userPageProfile?.bio || null}
              />
            </div>
          </div>
          <UserNavigation
            tabOption={tabOption}
            onNavigationChange={(newTabOption: UserTabOption) => {
              setItems([])
              setPage(1)
              setHasMore(false)
              setTabOption(newTabOption)
            }}
          />
          {tabOption === 'offers' ? (
            <OfferGrid items={items as OfferFeedItemType[]} expandOffer={expandOffer} />
          ) : (
            <NFTGrid
              items={items as NFTFeedItemType[]}
              makeOffer={makeOffer}
              pinItem={pinItem}
            />
          )}
        </div>
      </div>
      {makeOfferItem && (
        <Offer
          type='make_offer'
          offerId={null}
          initialNFT={makeOfferItem}
          closeModal={() => setMakeOfferItem(null)}
        />
      )}
    </div>
  )
}

export default UserPage
