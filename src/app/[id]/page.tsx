'use client'

import { FC, useEffect, useState } from 'react'

import { Offer } from '@/components/modals'
import { NFTFeedItem, NFTOfferItem } from '@/components/shared'
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
  viewOffer: (item: OfferFeedItemType) => void
  userId: string | null
}> = ({ items, viewOffer, userId }) => (
  <div className='p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'>
    {items.map((item) => (
      <NFTOfferItem key={item.id} item={item} viewOffer={viewOffer} userId={userId} />
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

const LoadMoreButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className='w-full flex items-center justify-center my-4'>
    <button
      onClick={onClick}
      className='px-10 py-3 text-lg rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors duration-300'
    >
      Load More
    </button>
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
  const [tabOption, setTabOption] = useState<UserTabOption>('nfts')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

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
      range_start: rangeStart,
      range_end: rangeEnd,
    }

    let query

    switch (tabOption) {
      case 'nfts':
        query = supabase.rpc('get_user_feed', {
          ...baseParams,
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
    if (tabOption && userPageProfile) {
      fetchItems(tabOption, 1)
      setPage(1)
    }
  }, [tabOption, userPageProfile])

  const makeOffer = async (nft: NFTFeedItemType) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    if (nft.nft_user_id === user.id) {
      showToast(`⚠️ You can't make an offer on your own NFT`, 2500)
      return
    }

    setMakeOfferItem(nft)
  }

  const viewOffer = async (offer: OfferFeedItemType) => {
    setViewOfferItem(offer)
  }

  const pinItem = async (nft: NFTFeedItemType) => {
    if (!user) {
      showToast(`⚠️ You have to login first`, 2500)
      return
    }

    showToast(`✅ NFT pinned`, 1500)

    const { error } = await supabase.from('user_pins').upsert(
      [
        {
          user_id: user?.id,
          nft_id: nft.nft_id,
        },
      ],
      {
        onConflict: 'user_id,nft_id',
        ignoreDuplicates: true,
      },
    )
    if (error) {
      showToast(`⚠️ Error pinning NFT`, 2500)
      console.error('Error pinning NFT:', error)
      return
    }
  }

  const handleTabChange = (newTabOption: UserTabOption) => {
    setItems([])
    setPage(1)
    setHasMore(false)
    setTabOption(newTabOption)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchItems(tabOption, nextPage)
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
          <UserNavigation tabOption={tabOption} onNavigationChange={handleTabChange} />
          {tabOption === 'offers' ? (
            <OfferGrid
              items={items as OfferFeedItemType[]}
              viewOffer={viewOffer}
              userId={user.id}
            />
          ) : (
            <NFTGrid
              items={items as NFTFeedItemType[]}
              makeOffer={makeOffer}
              pinItem={pinItem}
            />
          )}
          {items.length > 0 && hasMore && <LoadMoreButton onClick={handleLoadMore} />}
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
      {viewOfferItem && (
        <Offer
          type={
            viewOfferItem.status === 'accepted' || viewOfferItem.status === 'completed'
              ? 'transaction'
              : 'view_offer'
          }
          offerId={viewOfferItem.id}
          initialNFT={null}
          closeModal={() => setViewOfferItem(null)}
        />
      )}
    </div>
  )
}

export default UserPage
