import { FC, useEffect, useState } from "react";
import { useAuth } from "@/providers/authProvider";
import { supabase } from "@/utils/supabaseClient";
import { Offer } from "@/components/modals";
import { GridTabOption } from "@/types/main";
import { NFT } from "@/types/supabase";
import { GRID_ITEMS_PER_PAGE } from "@/utils/constants";
import { NftItem } from "@/components/shared";

import GridNavigation from "./gridNavigation";

const Grid: FC = () => {
  const { user } = useAuth();
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [selectedItemId] = useState<number | null>(null);

  const [nfts, setNfts] = useState<NFT[]>([]);
  const [tabOption, setTabOption] = useState<GridTabOption>("home");
  const [, setPage] = useState(1);
  const [, setHasMore] = useState(true);

  /*
    const handleDealModalOpen = (itemId: number) => {
      setSelectedItemId(itemId);
      setDealModalOpen(true);
    };
  */

  const fetchNfts = async (tabOption: GridTabOption, page: number) => {
    let query;

    console.log("fetchNfts", tabOption);

    switch (tabOption) {
      case "home":
        query = supabase
          .from("nfts")
          .select("*, user_profile!nfts_user_fkey1 (*)")
          .order("updated_at", { ascending: false })
          .range(
            (page - 1) * GRID_ITEMS_PER_PAGE,
            page * GRID_ITEMS_PER_PAGE - 1
          );
        break;
      case "followers":
        query = await supabase.rpc("get_following_feed", {
          current_user_id: user?.id,
          range_start: (page - 1) * GRID_ITEMS_PER_PAGE,
          range_end: page * GRID_ITEMS_PER_PAGE - 1,
        });
        break;
      // case "most_interested":
      //   query = query.order("interests", { ascending: false });
      //   break;
      default:
        query = supabase
          .from("nfts")
          .select("*, user_profile!nfts_user_fkey1 (*)")
          .order("updated_at", { ascending: false });
    }

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
    if (tabOption) {
      fetchNfts(tabOption, 1);
      setPage(1);
    }
  }, [tabOption]);

  return (
    <div className="w-full overflow-y-auto hide-scrollbar">
      <GridNavigation
        tabOption={tabOption}
        onNavigationChange={(tabOption: GridTabOption) =>
          setTabOption(tabOption)
        }
      />
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
