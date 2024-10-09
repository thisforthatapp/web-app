"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/authProvider";
import { GRID_ITEMS_PER_PAGE } from "@/utils/constants";
import { supabase } from "@/utils/supabaseClient";
import { NFTUserEditItem } from "@/components/shared";
import { AddNft, VerifyNft } from "@/components/modals";
import { UserNFT } from "@/types/supabase";

const AccountNFTSPage: React.FC = () => {
  const { user } = useAuth();
  const [userNfts, setUserNfts] = useState<UserNFT[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [modal, setModal] = useState<"add" | "verify" | null>(null);

  const fetchUserNfts = async (page: number) => {
    const { data, error } = await supabase
      .from("user_nfts")
      .select("*, nfts!user_nfts_nft_id_fkey(*)")
      .order("created_at", { ascending: false })
      .range((page - 1) * GRID_ITEMS_PER_PAGE, page * GRID_ITEMS_PER_PAGE - 1);

    if (error) {
      console.error("Error fetching items:", error);
      return;
    }

    if (page === 1) {
      setUserNfts(data);
    } else {
      setUserNfts((prevUserNfts) => {
        const newUserNfts = data.filter(
          (newUserNft: UserNFT) =>
            !prevUserNfts.some(
              (prevUserNft) => prevUserNft.nft_id === newUserNft.nft_id
            )
        );
        return [...prevUserNfts, ...newUserNfts];
      });
    }

    setHasMore(data.length === GRID_ITEMS_PER_PAGE);
  };

  useEffect(() => {
    if (user) {
      fetchUserNfts(1);
      setPage(1);
    }
  }, [user]);

  const toggleForSwap = async (item: UserNFT) => {
    const newForSwapValue = !item.for_swap;

    setUserNfts((prev) =>
      prev.map((nft) => {
        if (nft.id === item.id) {
          return { ...nft, for_swap: newForSwapValue };
        }

        return nft;
      })
    );

    const { error } = await supabase
      .from("user_nfts")
      .update({ for_swap: newForSwapValue })
      .eq("id", item.id);

    if (error) {
      console.error("Error updating Supabase:", error);
      return;
    }
  };

  return (
    <>
      <div className="absolute top-[75px] bottom-0 w-full flex flex-col">
        <div className="flex justify-between items-center p-4">
          <div className="text-xl font-semibold">My NFTs</div>
          <div className="flex space-x-4">
            <button
              onClick={() => setModal("add")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Add NFTs
            </button>
            <button
              onClick={() => setModal("verify")}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <span className="mr-2">✓</span>
              Verify NFTs
            </button>
          </div>
        </div>
        <div className="flex flex-col flex-grow overflow-hidden">
          <div className="flex-grow overflow-y-auto p-5 pt-2 hide-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {userNfts.map((userNft) => (
                <NFTUserEditItem
                  key={userNft.id}
                  item={userNft}
                  toggleForSwap={() => toggleForSwap(userNft)}
                />
              ))}
            </div>
          </div>
          {hasMore && (
            <button onClick={() => setPage((prev) => prev + 1)}>
              Load More
            </button>
          )}
        </div>
      </div>
      {modal === "add" && <AddNft closeModal={() => setModal(null)} />}
      {modal === "verify" && <VerifyNft closeModal={() => setModal(null)} />}
    </>
  );
};

export default AccountNFTSPage;
