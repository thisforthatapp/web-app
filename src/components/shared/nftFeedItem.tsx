import { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NFTImage, VerifiedBadge, Options } from "@/components/shared";
import { NFTFeedItem as NFTFeedItemType } from "@/types/supabase";

interface NFTItemProps {
  item: NFTFeedItemType;
  makeOffer: (nft: NFTFeedItemType) => void;
  pinItem: (nft: NFTFeedItemType) => void;
}

const NFTFeedItem: FC<NFTItemProps> = ({ item, makeOffer, pinItem }) => {
  const router = useRouter();

  const navigateToUser = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    router.push(`/${item.nft_user_id_username}`);
  };

  return (
    <Link
      href={`/nft/${item.nft_chain_id.toString()}/${
        item.nft_collection_contract
      }/${item.nft_token_id}`}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
        <div className="absolute top-1 right-1 z-10">
          <Options onOptionSelect={() => {}} />
        </div>
        <VerifiedBadge
          id={item.nft_id}
          isVerified={item.nft_is_verified}
          className="absolute left-1 top-1 z-10 w-10 h-10"
        />
        <NFTImage
          src={item.nft_image}
          alt={item.nft_name}
          fallback={item.nft_name}
        />
        <div className="text-center my-4 font-semibold">{item.nft_name}</div>
        <div className="flex justify-between px-3 pb-3">
          <div className="pt-2 flex items-center" onClick={navigateToUser}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL}${item?.nft_user_id_profile_pic_url}`}
              alt={item?.nft_user_id_username}
              className="w-6 h-6 rounded-full"
            />
            <span className="ml-2 text-gray-700">
              {item?.nft_user_id_username}
            </span>
          </div>
          <button
            className={`text-sm flex justify-between items-center px-2.5 py-1 rounded-md transition-colors duration-200 ${
              item.is_pinned
                ? "bg-gray-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
            onClick={(e) => {
              e.preventDefault();
              pinItem(item);
            }}
          >
            <span className="flex items-center mr-1.5">📌</span>
            <span className="font-semibold">{item.nft_pins}</span>
          </button>
        </div>
      </div>
      <div className="mt-3">
        <button
          className="w-full flex justify-center items-center bg-yellow-50 px-3 py-2 rounded-md hover:bg-yellow-100 transition-colors duration-200 shadow-sm"
          onClick={(e) => {
            e.preventDefault();
            makeOffer(item);
          }}
        >
          <span className="flex items-center mr-2.5 text-2xl">🤝</span>
          <span className="text-gray-800 text-lg font-semibold">Offer</span>
        </button>
      </div>
    </Link>
  );
};

export default NFTFeedItem;
