"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/providers/authProvider";
import { GRID_ITEMS_PER_PAGE } from "@/utils/constants";
import { supabase } from "@/utils/supabaseClient";
import { NFTItemMove } from "@/components/shared";
import { ResizableDivider } from "@/components";

interface NFT {
  id: string;
  // Add other properties of NFT
}

interface UserNFT {
  id: string;
  user_id: string;
  nft_id: string;
  forSwap: boolean;
  nfts: NFT;
}

const useNFTsForSwap = (userId: string | undefined, page: number) => {
  const [nftsForSwap, setNftsForSwap] = useState<UserNFT[]>([]);
  const [hasMoreForSwap, setHasMoreForSwap] = useState<boolean>(true);

  useEffect(() => {
    const fetchNFTsForSwap = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("user_nfts")
        .select("*, nfts!user_nfts_nft_id_fkey (*)")
        .eq("user_id", userId)
        .eq("forSwap", true)
        .range(
          (page - 1) * GRID_ITEMS_PER_PAGE,
          page * GRID_ITEMS_PER_PAGE - 1
        );

      if (error) {
        console.error("Error fetching NFTs for swap:", error);
        return;
      }

      if (data) {
        if (page === 1) {
          setNftsForSwap(data);
        } else {
          setNftsForSwap((prevNfts) => [...prevNfts, ...data]);
        }
        setHasMoreForSwap(data.length === GRID_ITEMS_PER_PAGE);
      }
    };

    fetchNFTsForSwap();
  }, [userId, page]);

  return { nftsForSwap, hasMoreForSwap, setNftsForSwap };
};

const useNFTsNotForSwap = (userId: string | undefined, page: number) => {
  const [nftsNotForSwap, setNftsNotForSwap] = useState<UserNFT[]>([]);
  const [hasMoreNotForSwap, setHasMoreNotForSwap] = useState<boolean>(true);

  useEffect(() => {
    const fetchNFTsNotForSwap = async () => {
      const { data, error } = await supabase
        .from("user_nfts")
        .select("*, nfts!user_nfts_nft_id_fkey (*)")
        .eq("user_id", userId)
        .eq("forSwap", false)
        .range(
          (page - 1) * GRID_ITEMS_PER_PAGE,
          page * GRID_ITEMS_PER_PAGE - 1
        );

      if (error) {
        console.error("Error fetching NFTs not for swap:", error);
        return;
      }

      if (data) {
        if (page === 1) {
          setNftsNotForSwap(data);
        } else {
          setNftsNotForSwap((prevNfts) => [...prevNfts, ...data]);
        }
        setHasMoreNotForSwap(data.length === GRID_ITEMS_PER_PAGE);
      }
    };

    if (userId) {
      fetchNFTsNotForSwap();
    }
  }, [userId, page]);

  return { nftsNotForSwap, hasMoreNotForSwap, setNftsNotForSwap };
};

interface SortableNFTItemProps {
  item: NFT;
  userProfile: Profile;
  // handleMoveNFT: (item: NFT) => void;
}

const SortableNFTItem: React.FC<SortableNFTItemProps> = ({
  item,
  userProfile,
  // handleMoveNFT,
}) => {
  return (
    <div className="nft-item">
      <NFTItemMove
        item={item}
        userProfile={userProfile}
        handleDealModalOpen={() => {}}
      />
    </div>
  );
};

const AccountNFTSPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [pageForSwap, setPageForSwap] = useState<number>(1);
  const [pageNotForSwap, setPageNotForSwap] = useState<number>(1);
  const [forSwapHeight, setForSwapHeight] = useState<number>(50); // 50% by default

  const { nftsForSwap, hasMoreForSwap, setNftsForSwap } = useNFTsForSwap(
    user?.id,
    pageForSwap
  );
  const { nftsNotForSwap, hasMoreNotForSwap, setNftsNotForSwap } =
    useNFTsNotForSwap(user?.id, pageNotForSwap);

  const handleMoveNFT = async (item: NFT) => {
    const newForSwapValue = !item.forSwap;

    const { error } = await supabase
      .from("user_nfts")
      .update({ forSwap: newForSwapValue })
      .eq("id", item.id);

    if (error) {
      console.error("Error updating Supabase:", error);
      return;
    }

    // Updating state
    if (item.forSwap) {
      setNftsForSwap((prev) => prev.filter((nft) => nft.id !== item.id));
      setNftsNotForSwap((prev) => [
        ...prev,
        { ...item, forSwap: newForSwapValue } as UserNFT,
      ]);
    } else {
      setNftsNotForSwap((prev) => prev.filter((nft) => nft.id !== item.id));
      setNftsForSwap((prev) => [
        ...prev,
        { ...item, forSwap: newForSwapValue } as UserNFT,
      ]);
    }
  };

  const handleResize = useCallback((clientY: number) => {
    const containerRect = document
      .getElementById("nftsContainer")
      ?.getBoundingClientRect();
    if (containerRect) {
      const newHeight =
        ((clientY - containerRect.top) / containerRect.height) * 100;
      setForSwapHeight(Math.max(10, Math.min(90, newHeight))); // Limit between 10% and 90%
    }
  }, []);

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex flex-col">
      <div className="flex justify-between items-center p-4">
        <div className="text-xl font-semibold">My NFTs</div>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              /* setIsAddModalOpen(true) */
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <span className="mr-2">+</span>
            Add NFTs
          </button>
          <button
            onClick={() => {
              /* setIsVerifyModalOpen(true) */
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
          >
            <span className="mr-2">✓</span>
            Verify NFTs
          </button>
        </div>
      </div>
      <div
        id="nftsContainer"
        className="flex flex-col flex-grow overflow-hidden"
      >
        <div
          className="flex flex-col border border-gray-300 overflow-hidden"
          style={{ height: `${forSwapHeight}%` }}
        >
          <h3 className="text-lg font-semibold p-5 pb-2">✅ For Swap</h3>
          <div className="flex-grow overflow-y-auto p-5 pt-2 hide-scrollbar">
            <div className="grid grid-cols-8 gap-6">
              {nftsForSwap.map((userNft) => (
                <SortableNFTItem
                  key={userNft.id}
                  item={userNft.nfts}
                  userProfile={profile}
                  handleMoveNFT={handleMoveNFT}
                />
              ))}
            </div>
          </div>
          {hasMoreForSwap && (
            <button onClick={() => setPageForSwap((prev) => prev + 1)}>
              Load More
            </button>
          )}
        </div>
        <ResizableDivider onResize={handleResize} />
        <div
          className="border border-gray-300 p-5 overflow-y-auto"
          id="nftsNotForSwap"
          style={{ height: `${100 - forSwapHeight}%` }}
        >
          <h3 className="text-lg font-semibold mb-4">❌ Not for Swap</h3>
          <div className="grid grid-cols-6 gap-4">
            {nftsNotForSwap.map((nft) => (
              <SortableNFTItem
                key={nft.id}
                item={nft.nfts}
                userProfile={profile}
                handleMoveNFT={handleMoveNFT}
              />
            ))}
          </div>
          {hasMoreNotForSwap && (
            <button onClick={() => setPageNotForSwap((prev) => prev + 1)}>
              Load More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountNFTSPage;
