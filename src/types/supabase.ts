export interface Profile {
  id: string
  username: string
  bio: string
  profile_pic_url: string
  profile_nft_id: string
  social_links: JSON
  created_at: string
  updated_at: string
  wallet: string
  banned: boolean
}

export interface ProfileMinimal {
  id: string
  username: string
  profile_pic_url: string
}

export interface UserNFT {
  id: string
  user_id: string
  nft_id: string
  for_swap: boolean
  nfts: NFT
}

export interface NFT {
  id: string
  name: string
  image: string
  thumbnail: string
  chain_id: number
  collection_contract: string
  collection_name: string
  token_type: string
  token_id: string
  token_uri: string | null
  created_at: string
  updated_at: string
  wallet_address: string
  interests: number
  offers: number
  is_verified: boolean
  verified_at: string
  user_id: string
  possible_spam?: boolean
  pins: number // not being used
  for_swap: boolean
  user_profile: Profile
}

export interface NFTFeedItem {
  nft_chain_id: number
  nft_collection_contract: string
  nft_collection_name: string
  nft_created_at: string
  nft_id: string
  nft_name: string
  nft_pins: number // not being used
  nft_image: string
  nft_thumbnail: string
  nft_token_id: string
  nft_token_type: string
  nft_user_id: string
  nft_user_id_profile_pic_url: string
  nft_user_id_username: string
  nft_is_verified: boolean
  nft_verified_at: string | null
  nft_for_swap: boolean
}

export interface NFTOffers {
  id: string
  nft_id: string
  offer_id: string
  created_at: string
  updated_at: string
  user_offers: OfferFeedItem
}

export interface NFTOfferMetadata {
  id: string
  name: string
  image: string
  chaind_id: number
  collection_contract: string
  token_id: string
  token_type: string
}

export interface OfferFeedItem {
  id: string
  user_id: string
  user_id_counter: string
  offer_user_id: string
  offer: unknown // JSON
  status: 'pending' | 'accepted' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
  user: Profile
  counter_user: Profile
  chain_id: number
  onchain_trade_id: string | null
  onchain_done: boolean
  onchain_tx: string | null
}

export interface Activity {
  id: string
  user_id: string
  activity_type: 'message' | 'offer_start' | 'offer_counter' | 'offer_accepted'
  content: string | null
  metadata: unknown // JSON | null
  username: string
  profile_pic_url: string
  created_at: string
}
