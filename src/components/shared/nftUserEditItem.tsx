import React from "react";
import Link from "next/link";
import { VerifiedBadge, Options, NFTImage } from "@/components/shared";
import { UserNFT } from "@/types/supabase";

interface NFTItemProps {
  item: UserNFT;
  toggleForSwap: () => void;
}

const NFTUserEditItem: React.FC<NFTItemProps> = ({ item, toggleForSwap }) => {
  return (
    <Link
      href={`/nft/${item.nfts.chain_id}/${item.nfts.collection_contract}/${item.nfts.token_id}`}
    >
      <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden relative">
        <div className="absolute top-1 right-1 z-10">
          <Options onOptionSelect={() => {}} />
        </div>
        <VerifiedBadge
          id={item.nft_id}
          isVerified={
            item.nfts.is_verified && item.nfts.user_id === item.user_id
          }
          className="absolute left-1 top-1 z-10 w-10 h-10"
        />
        <NFTImage
          src={item.nfts.image}
          alt={item.nfts.name}
          fallback={item.nfts.name}
        />

        <div className="p-3 font-semibold text-sm text-center">
          {item.nfts.name}
        </div>
        <button
          className={`${
            item.for_swap ? "bg-green-100" : "bg-red-100"
          } p-2 border border-gray-100 rounded-md m-2 hover:bg-gray-200 transition-colors duration-200`}
          onClick={(e) => {
            e.preventDefault();
            toggleForSwap();
          }}
        >
          {item.for_swap ? "✅ Ok To Trade" : "❌ Not Eager To Trade"}
        </button>
      </div>
    </Link>
  );
};

export default NFTUserEditItem;
