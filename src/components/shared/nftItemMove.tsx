import React from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import VerifiedBadge from "./verifiedBadge";
import Options from "./options";
import { NFT, Profile } from "@/types/supabase";

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
  userProfile: Profile;
  handleDealModalOpen: (id: string) => void;
}

const NFTItemMove: React.FC<NFTItemProps> = ({ item }) => {
  // const router = useRouter();
  // const nftUser = userProfile || item.user_profile;

  /*
  const navigateToUser = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    router.push(`/${nftUser?.username}`);
  };
  */

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

        <div className="p-3 font-semibold text-sm text-center">{item.name}</div>
        <button className="bg-black w-full text-white p-3">
          Move to {item.forSwap ? "Yes" : "No"}
        </button>
      </div>
    </Link>
  );
};

export default NFTItemMove;
