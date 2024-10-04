import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pin } from "@/icons";
import VerifiedBadge from "../verifiedBadge";
import Options from "../options";

const NFTGridItem = ({ item, pinImage, handleDealModalOpen }) => {
  const router = useRouter();

  return (
    <Link
      href={`/nft/${item.chain_id}/${item.collection_contract}/${item.token_id}`}
      className="relative cursor-pointer"
    >
      <div
        className="absolute top-2 left-2 rounded-full w-7 h-7 flex items-center justify-center bg-gray-200 opacity-25"
        onClick={(e) => {
          e.preventDefault();
          pinImage(item.id);
        }}
      >
        <Pin className="text-gray-600" />
      </div>
      <div className="absolute top-1 right-1">
        <Options onOptionSelect={() => {}} />
      </div>
      <VerifiedBadge
        isVerified={item.is_verified}
        verifiedDate={item.verified_at}
        className="absolute bottom-3 right-2"
      />
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <img
          src={item.image || "/temp/nft.png"}
          alt={item.name}
          className="w-full h-auto object-cover"
        />
        <div className="p-3">
          <div
            className="flex items-center"
            onClick={(e) => {
              e.preventDefault();
              router.push(`/user/${item.user_profile.username}`);
            }}
          >
            <img
              src={
                process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
                item.user_profile.profile_pic_url
              }
              alt="profile"
              className="w-5 h-5 rounded-full"
            />
            <div className="ml-2 text-base font-semibold">
              {item.user_profile.username}
            </div>
          </div>
          <div className="flex items-center mt-1">
            <div className="my-1 text-sm">{item.name}</div>
          </div>
          <div className="font-semibold text-sm flex gap-x-1.5 mt-2">
            <div
              onClick={(e) => {
                e.preventDefault();
                handleDealModalOpen(item.id);
              }}
              className="bg-gray-50 px-2 py-0.5 rounded-md border text-lg border-gray-200 cursor-pointer"
            >
              🤝 {item.offers}
            </div>
            <div className="bg-gray-50 px-2 py-0.5 rounded-md border text-lg border-gray-200 cursor-pointer">
              👀 {item.interests}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NFTGridItem;
