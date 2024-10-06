import { FC, useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Offer } from "@/components/modals";
import { GridSortOption } from "@/types/main";
import { NFT } from "@/types/supabase";
import { GRID_ITEMS_PER_PAGE } from "@/utils/constants";

import { NftItem } from "../shared";
import GridNavigation from "./gridNavigation";

const Grid: FC = () => {
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const [nfts, setNfts] = useState<NFT[]>([]);
  const [sortOption] = useState<GridSortOption>("most_recent");
  const [, setPage] = useState(1);
  const [, setHasMore] = useState(true);

  /*
    const handleDealModalOpen = (itemId: number) => {
      setSelectedItemId(itemId);
      setDealModalOpen(true);
    };
  */

  const fetchNfts = async (sortOption: GridSortOption, page: number) => {
    let query;

    query = supabase.from("nfts").select("*, user_profile!nfts_user_fkey1 (*)");

    switch (sortOption) {
      case "most_recent":
        query = query.order("updated_at", { ascending: false });
        break;
      case "most_offers":
        query = query.order("offers", { ascending: false });
        break;
      case "most_interested":
        query = query.order("interests", { ascending: false });
        break;
      default:
        query = query.order("updated_at", { ascending: false });
    }

    query = query.range(
      (page - 1) * GRID_ITEMS_PER_PAGE,
      page * GRID_ITEMS_PER_PAGE - 1
    );

    const { data, error } = await query;

    console.log("query", query, data, error);

    if (error) {
      console.error("Error fetching songs:", error);
      return;
    }

    if (page === 1) {
      setNfts(data);
    } else {
      setNfts((prevNfts) => {
        const newNfts = data.filter(
          (newNft) => !prevNfts.some((prevNft) => prevNft.id === newNft.id)
        );
        return [...prevNfts, ...newNfts];
      });
    }

    setHasMore(data.length === GRID_ITEMS_PER_PAGE);
  };

  useEffect(() => {
    if (sortOption) {
      fetchNfts(sortOption, 1);
      setPage(1);
    }
  }, [sortOption]);

  return (
    <div className="w-full overflow-y-auto hide-scrollbar">
      <GridNavigation onNavigationChange={() => {}} />
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {nfts.map((item) => (
          <NftItem
            key={item.id}
            item={item}
            handleDealModalOpen={() => setDealModalOpen(true)}
          />
        ))}
      </div>
      {/* has more button */}
      {selectedItemId && (
        <>
          {dealModalOpen && (
            <Offer
              closeModal={() => setDealModalOpen(false)}
              itemId={selectedItemId.toString()}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Grid;
