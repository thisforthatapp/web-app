"use client";

import React, { FC, useEffect, useState } from "react";
import Link from "next/link";
import { OfferFeedItem, Options, VerifiedBadge } from "@/components/shared";
import { supabase } from "@/utils/supabaseClient";
import { GRID_ITEMS_PER_PAGE } from "@/utils/constants";

interface ActivityItem {
  id: string;
  type: "offers" | "looking" | "transactions";
  user: string;
  amount?: string;
  timestamp: Date;
}

interface InfoItemProps {
  label: string;
  value: string;
  link?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, link }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500">{label}</span>
    {link ? (
      <Link href={link} className="text-blue-500 hover:underline">
        {value}
      </Link>
    ) : (
      <span className="font-semibold">{value}</span>
    )}
  </div>
);

interface ActionButtonProps {
  emoji: string;
  text: string;
  count: number;
  onClick: () => void;
  className: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  emoji,
  text,
  count,
  onClick,
  className,
}) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 text-white rounded-lg transition-colors text-sm flex items-center justify-center px-3 ${className}`}
  >
    <span>{emoji}</span>
    <span className="ml-2">{text}</span>
    <span className="ml-auto font-bold">{count}</span>
  </button>
);

const NFTComponent: FC<{ nft: any }> = ({ nft }) => {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Mock data - replace with actual data fetching logic
  const image = "/temp/nft.png";
  const owner = "fredwilson";
  const ownerImage = "/temp/profile.webp";
  const chain = "Ethereum";
  const collection = "CryptoPunks";
  const tokenId = "1";
  const floorPrice = "5 ETH";
  const lastSalePrice = "6 ETH";
  const isVerified = true;
  const verifiedDate = "2024-09-25";
  const openseaLink = "https://opensea.io/collection/cryptopunks";

  const fetchItems = async (page: number) => {
    const { data, error } = await supabase
      .from("nfts_offers")
      .select(
        "*, user_offers!nfts_offers_offer_id_fkey(*, user:user_profile!user_offers_user_id_fkey(*), counter_user:user_profile!user_offers_user_id_counter_fkey(*))"
      )
      .eq("nft_id", nft.id)
      .order("updated_at", { ascending: false })
      .range((page - 1) * GRID_ITEMS_PER_PAGE, page * GRID_ITEMS_PER_PAGE - 1);

    if (error) {
      console.error("Error fetching items:", error);
      return;
    }

    if (page === 1) {
      setItems(data);
    } else {
      setItems((prevOffers) => {
        const newOffers = data.filter(
          (newOffer: any) =>
            !(prevOffers as any[]).some(
              (prevOffer) => prevOffer.id === newOffer.id
            )
        );
        return [...prevOffers, ...newOffers];
      });
    }

    setHasMore(data.length === GRID_ITEMS_PER_PAGE);
  };

  useEffect(() => {
    fetchItems(1);
    setPage(1);
  }, []);

  console.log("items", items);

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <div className="w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar justify-center my-8">
        <div className="flex flex-col lg:flex-row justify-center gap-x-8">
          <div className="relative w-[400px]">
            <img
              src={nft?.image}
              alt="NFT"
              className="w-full h-[400px] w-[400px] object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2">
              <Options onOptionSelect={() => {}} />
            </div>
            <div className="px-2 py-4 mb-4">
              <Link
                href="/user/1"
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center">
                  <img
                    src={ownerImage}
                    alt={owner}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-xl font-bold ml-2">{owner}</div>
                  {/* <button className="bg-gray-100 px-2 py-1 rounded-full text-xs ml-3 border border-gray-200">
                Follow
              </button> */}
                </div>
                <VerifiedBadge isVerified={isVerified} className="" />
              </Link>

              <div className="grid grid-cols-3 gap-4">
                <InfoItem label="Chain" value={chain} link={openseaLink} />
                <InfoItem
                  label="Collection"
                  value={collection}
                  link={openseaLink}
                />
                <InfoItem label="Token ID" value={tokenId} link={openseaLink} />
                <InfoItem label="Floor Price" value={floorPrice} />
                <InfoItem label="Last Sale" value={lastSalePrice} />
              </div>
            </div>
            <div className="flex space-x-4">
              <ActionButton
                emoji="🤝"
                text="Make Offer"
                count={4}
                onClick={() => setDealModalOpen(true)}
                className="bg-gray-800"
              />
              <ActionButton
                emoji="👀"
                text="Looking"
                count={10}
                onClick={() => setInterestModalOpen(true)}
                className="bg-gray-800"
              />
            </div>
          </div>
          <div className="overflow-y-auto hide-scrollbar h-[650px] w-[600px] flex flex-col gap-y-4">
            {(items as any[]).map((item) => (
              <OfferFeedItem
                key={item.id}
                item={item.user_offers}
                // expandOffer={expandOffer}
              />
            ))}
          </div>
          <div className="flex lg:hidden">
            action buttons that show on mobile
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTComponent;
