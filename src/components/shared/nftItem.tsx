import { FC, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NFTImage, VerifiedBadge, Options } from "@/components/shared";
import { NFT, Profile } from "@/types/supabase";

interface NFTItemProps {
  item: NFT;
  userProfile?: Profile;
  makeOffer: (nft: NFT, user: Profile) => void;
  pinItem: (nft: NFT) => void;
}

const NFTItem: FC<NFTItemProps> = ({
  item,
  userProfile,
  makeOffer,
  pinItem,
}) => {
  const router = useRouter();
  const nftUser = userProfile || item.user_profile;

  const navigateToUser = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    router.push(`/${nftUser?.username}`);
  };

  console.log("nftUser", nftUser);

  return (
    <Link
      href={`/nft/${item.chain_id}/${item.collection_contract}/${item.token_id}`}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
        <div className="absolute top-1 right-1 z-10">
          <Options onOptionSelect={() => {}} />
        </div>
        <VerifiedBadge
          isVerified={item.is_verified}
          verifiedDate={item.verified_at}
          className="absolute left-1 top-1 z-10 w-10 h-10"
        />
        <NFTImage
          src={item.image || "/temp/nft.png"}
          alt={item.name}
          fallback={item.name}
        />

        <div className="p-3">
          <div className="font-semibold text-sm text-center mb-3">
            {item.name}
          </div>
          <div className="flex space-x-2">
            <button
              className="w-full flex justify-center items-center bg-blue-50 px-3 py-2 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors duration-200 group"
              onClick={(e) => {
                e.preventDefault();
                makeOffer(item, nftUser);
              }}
            >
              <span className="flex items-center">
                <span className="text-gray-600 group-hover:text-gray-800">
                  🤝 Make Offer
                </span>
              </span>
            </button>
            <button
              className="w-[75px] flex justify-between items-center bg-blue-50 px-3 py-2 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors duration-200 group"
              onClick={(e) => {
                e.preventDefault();
                pinItem(item.id);
              }}
            >
              <span className="flex items-center">
                <span className="mr-1.5">📌</span>
              </span>
              <span className="text-base font-semibold text-gray-800">1</span>
            </button>
          </div>
        </div>

        <div
          className="px-3 pt-2 pb-3 flex items-center"
          onClick={navigateToUser}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL}${nftUser?.profile_pic_url}`}
            alt={nftUser?.username}
            className="w-6 h-6 rounded-full"
          />
          <span className="ml-2 font-semibold">{nftUser?.username}</span>
        </div>
      </div>
    </Link>
  );
};

export default NFTItem;
