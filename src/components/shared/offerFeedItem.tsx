import React, { FC } from "react";
import Link from "next/link";
import { NFTImage } from "@/components/shared";
import { timeAgoShort } from "@/utils/helpers";
import { OfferFeedItem as OfferFeedItemType } from "@/types/supabase";

interface OfferItemProps {
  item: OfferFeedItemType;
  expandOffer: (offer: OfferFeedItemType) => void;
}

const OfferFeedItem: FC<OfferItemProps> = ({ item, expandOffer }) => {
  const StatusBubble: FC<{ status: string }> = ({ status }) => {
    return (
      <div className="text-sm font-semibold bg-yellow-200 text-yellow-800 px-2 py-1 rounded absolute top-4 right-4">
        negotiating
      </div>
    );
  };

  return (
    <div
      className="flex items-center shadow-sm rounded-md cursor-pointer py-4 relative bg-yellow-50 border-gray-200 border"
      onClick={() => expandOffer(item)}
    >
      <StatusBubble status={item.status} />
      <div className="absolute bottom-4 right-4 text-gray-700 font-semibold">
        {timeAgoShort(new Date(item.updated_at))}
      </div>
      <div className="ml-6 mr-2 flex flex-col font-semibold shrink-0 gap-y-4">
        <div className="flex gap-x-4">
          <div className="flex items-center">
            <img
              src={
                process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
                item.user.profile_pic_url
              }
              className="w-12 h-12 mr-2 rounded-full shrink-0 border-2 border-black"
            />
          </div>
          {item.offer.user.map((nft) => (
            <div
              key={nft.id}
              className="w-16 h-16 object-cover rounded-lg overflow-hidden"
            >
              <NFTImage
                key={nft.id}
                src={nft.image}
                alt={nft.name}
                fallback={nft.name}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-x-4">
          <div className="flex items-center">
            <img
              src={
                process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
                item.counter_user.profile_pic_url
              }
              className="w-12 h-12 mr-2 rounded-full shrink-0 border-2 border-black"
            />
          </div>
          {item.offer.userCounter.map((nft) => (
            <div
              key={nft.id}
              className="w-16 h-16 object-cover rounded-lg overflow-hidden"
            >
              <NFTImage
                key={nft.id}
                src={nft.image}
                alt={nft.name}
                fallback={nft.name}
              />
            </div>
          ))}
        </div>
      </div>
      {/* <div className="p-4">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <div className="flex gap-2">
                {item.offer.user.map((nft) => (
                  <div
                    key={nft.id}
                    className="w-24 h-24 object-cover rounded-lg border-4 border-red-500"
                  >
                    <NFTImage
                      key={nft.id}
                      src={nft.image}
                      alt={nft.name}
                      fallback={nft.name}
                    />
                  </div>
                ))}
                {item.offer.userCounter.map((nft) => (
                  <div
                    key={nft.id}
                    className="w-24 h-24 object-cover rounded-lg border-4 border-blue-500"
                  >
                    <NFTImage
                      key={nft.id}
                      src={nft.image}
                      alt={nft.name}
                      fallback={nft.name}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default OfferFeedItem;
