import React, { FC } from "react";
import Link from "next/link";
import { OfferFeedItem as OfferFeedItemType } from "@/types/supabase";

interface OfferItemProps {
  item: OfferFeedItemType;
  expandOffer: (offer: OfferFeedItemType) => void;
}

const OfferFeedItem: FC<OfferItemProps> = ({ item, expandOffer }) => {
  const StatusBubble: FC<{ status: string }> = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case "initiated":
          return "bg-blue-500";
        case "negotiating":
          return "bg-yellow-500";
        case "accepted":
          return "bg-green-500";
        case "denied":
          return "bg-red-500";
        case "completed":
          return "bg-purple-500";
        default:
          return "bg-gray-500";
      }
    };

    return (
      <div
        className={`${getStatusColor(
          status
        )} text-white text-sm font-semibold px-3 py-1 rounded-full`}
      >
        {status}
      </div>
    );
  };

  console.log("item", item);

  const formatItems = (items) => {
    return items.map((nft, index) => (
      <React.Fragment key={nft.id}>
        <Link
          href={`/nft/${nft.id}`}
          className="font-semibold text-blue-600 hover:underline"
        >
          {nft.name}
        </Link>
        {index < items.length - 1 && ", "}
      </React.Fragment>
    ));
  };

  const userItems = formatItems(item.initial_offer.user);
  const counterUserItems = formatItems(item.initial_offer.userCounter);

  return (
    <div
      className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer"
      onClick={() => expandOffer(item)}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-semibold text-gray-800">
            <div className="flex">
              <img
                src={
                  process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
                  item.user.profile_pic_url
                }
                alt={item.user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>{item.user.username}</div>
            </div>
            <div className="flex">
              <img
                src={
                  process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
                  item.counter_user.profile_pic_url
                }
                alt={item.counter_user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>{item.counter_user.username}</div>
            </div>
          </div>
          <StatusBubble status={item.status} />
        </div>
        <div className="space-y-4">
          <p className="text-lg">
            <Link
              href={`/user/${item.user.id}`}
              className="font-semibold text-blue-600 hover:underline"
            >
              {item.user.username}
            </Link>{" "}
            made an offer to trade {userItems} for {counterUserItems}.
          </p>

          <div className="flex flex-wrap gap-4">
            <div>
              <div className="flex gap-2">
                {item.initial_offer.user.map((nft) => (
                  <img
                    key={nft.id}
                    src={nft.image}
                    alt={nft.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="flex gap-2">
                {item.initial_offer.userCounter.map((nft) => (
                  <img
                    key={nft.id}
                    src={nft.image}
                    alt={nft.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferFeedItem;
