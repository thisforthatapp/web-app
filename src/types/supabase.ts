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
  some(arg0: (item: NFT) => boolean): unknown;
  id: string;
  name: string;
  image: string;
  thumbnail: string;
  chain_id: number;
  collection_contract: string;
  collection_name: string;
  token_type: string;
  token_id: string;
  token_uri: JSON;
  created_at: string;
  updated_at: string;
  wallet_address: string;
  possible_spam?: boolean;
}
