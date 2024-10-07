import { FC, useEffect, useState } from "react";
import { useAuth } from "@/providers/authProvider";
import { supabase } from "@/utils/supabaseClient";
import { Offer } from "@/components/modals";
import { GridNavigation } from "@/components/home";
import { NFTFeedItem } from "@/components/shared";
import { GridTabOption } from "@/types/main";
import { NFTFeedItem as NFTFeedItemType } from "@/types/supabase";
import { GRID_ITEMS_PER_PAGE } from "@/utils/constants";

const Grid: FC = () => {
  const { user, loading } = useAuth();
  const [offerItem, setOfferItem] = useState<NFTFeedItemType | null>(null);

  const [nfts, setNfts] = useState<NFTFeedItemType[]>([]);
  const [tabOption, setTabOption] = useState<GridTabOption>("home");
  const [, setPage] = useState(1);
  const [, setHasMore] = useState(true);

  const fetchNfts = async (tabOption: GridTabOption, page: number) => {
    let query;

    switch (tabOption) {
      case "home":
        query = await supabase.rpc("get_home_feed", {
          current_user_id: user?.id,
          range_start: (page - 1) * GRID_ITEMS_PER_PAGE,
          range_end: page * GRID_ITEMS_PER_PAGE - 1,
        });
        break;
      case "followers":
        query = await supabase.rpc("get_following_feed", {
          current_user_id: user?.id,
          range_start: (page - 1) * GRID_ITEMS_PER_PAGE,
          range_end: page * GRID_ITEMS_PER_PAGE - 1,
        });
        break;
      case "pinned":
        query = await supabase.rpc("get_pinned_feed", {
          current_user_id: user?.id,
          range_start: (page - 1) * GRID_ITEMS_PER_PAGE,
          range_end: page * GRID_ITEMS_PER_PAGE - 1,
        });
        break;
      default:
        query = await supabase.rpc("get_home_feed", {
          current_user_id: user?.id,
          range_start: (page - 1) * GRID_ITEMS_PER_PAGE,
          range_end: page * GRID_ITEMS_PER_PAGE - 1,
        });
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching songs:", error);
      return;
    }

    if (page === 1) {
      setNfts(data);
    } else {
      setNfts((prevNfts) => {
        const newNfts = data.filter(
          (newNft: NFTFeedItemType) =>
            !prevNfts.some((prevNft) => prevNft.nft_id === newNft.nft_id)
        );
        return [...prevNfts, ...newNfts];
      });
    }

    setHasMore(data.length === GRID_ITEMS_PER_PAGE);
  };

  const makeOffer = async (nft: NFTFeedItemType) => {
    setOfferItem(nft);
  };

  // TEMP: disable unpin to prevent spammy toggling and too many notifications
  const pinItem = async (nft: NFTFeedItemType) => {
    if (!user) return;
    if (nft.is_pinned) return;

    const updatedNFTs = nfts.map((item) => {
      if (item.nft_id === nft.nft_id) {
        const isCurrentlyPinned = item.is_pinned;
        return {
          ...item,
          is_pinned: !isCurrentlyPinned,
          nft_pins: isCurrentlyPinned ? item.nft_pins - 1 : item.nft_pins + 1,
        };
      }
      return item;
    });

    setNfts(updatedNFTs);

    const { error } = await supabase.from("user_pins").insert([
      {
        user_id: user?.id,
        nft_id: nft.nft_id,
      },
    ]);

    if (error) {
      console.error("Error following user:", error);
      return;
    }
  };

  useEffect(() => {
    if (tabOption && !loading) {
      fetchNfts(tabOption, 1);
      setPage(1);
    }
  }, [tabOption, loading]);

  return (
    <div className="w-full overflow-y-auto hide-scrollbar">
      <GridNavigation
        tabOption={tabOption}
        onNavigationChange={(tabOption: GridTabOption) =>
          setTabOption(tabOption)
        }
      />
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {nfts.map((item) => (
          <NFTFeedItem
            key={item.nft_id}
            item={item}
            makeOffer={makeOffer}
            pinItem={pinItem}
          />
        ))}
      </div>
      {/* has more button */}
      {offerItem && (
        <Offer
          type="make_offer"
          initialNFT={offerItem}
          closeModal={() => setOfferItem(null)}
        />
      )}
    </div>
  );
};

export default Grid;
