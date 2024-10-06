export interface Profile {
  id: string;
  username: string;
  bio: string;
  profile_pic_url: string;
  profile_nft_id: string;
  social_links: JSON;
  created_at: string;
  updated_at: string;
}

export interface NFT {
  id: string;
  name: string;
  image: string;
  thumbnail: string;
  chain_id: number;
  collection_contract: string;
  collection_name: string;
  token_type: string;
  token_id: string;
  token_uri: string | null;
  created_at: string;
  updated_at: string;
  wallet_address: string;
  interests: number;
  offers: number;
  is_verified: boolean;
  verified_at: string;
  possible_spam?: boolean;
  user_profile: Profile;
}

export interface Activity {
  id: string;
  user_id: string;
  activity_type:
    | "message"
    | "offer_start"
    | "offer_counter"
    | "offer_accepted"
    | "pin";
  content: string | null;
  metadata: JSON | null;
  username: string;
  profile_pic_url: string;
  created_at: string;
}
