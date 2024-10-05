import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VerifiedBadge from "./verifiedBadge";
import Options from "./options";
import { NFT, Profile } from "@/types/supabase";

interface ActionButtonProps {
  icon: string;
  label: string;
  count: number;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  count,
  onClick,
}) => (
  <button
    className="w-full flex justify-between items-center bg-blue-50 px-3 py-2 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors duration-200 group"
    onClick={onClick}
  >
    <span className="flex items-center">
      <span className="mr-1.5">{icon}</span>
      <span className="text-sm text-gray-600 group-hover:text-gray-800">
        {label}
      </span>
    </span>
    <span className="text-base font-semibold text-gray-800">{count}</span>
  </button>
);

interface NFTImageProps {
  src: string;
  alt: string;
  fallback: string;
}

const NFTImage: React.FC<NFTImageProps> = ({ src, alt, fallback }) => {
  const [error, setError] = React.useState<boolean>(false);

  if (error) {
    return (
      <div className="aspect-square flex items-center justify-center text-center p-4 bg-gray-200">
        <span className="text-gray-600 font-semibold break-words">
          {fallback}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="aspect-square object-cover w-full h-full"
      onError={() => setError(true)}
    />
  );
};

interface NFTItemProps {
  item: NFT;
  userProfile?: Profile;
  handleDealModalOpen: (id: string) => void;
}

const NFTItem: React.FC<NFTItemProps> = ({
  item,
  userProfile,
  handleDealModalOpen,
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
          <div className="space-y-2">
            <ActionButton
              icon="🤝"
              label="Swap"
              count={item.offers}
              onClick={(e) => {
                e.preventDefault();
                handleDealModalOpen(item.id);
              }}
            />
            <ActionButton
              icon="📌"
              label="Pin"
              count={item.interests}
              onClick={(e) => e.preventDefault()}
            />
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
