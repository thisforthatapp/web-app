import { FC, useEffect, useState } from "react";
import { useAuth } from "@/providers/authProvider";
import { supabase } from "@/utils/supabaseClient";
import { Offer } from "@/components/modals";
import { GridNavigation } from "@/components/home";
import { NFTFeedItem, OfferFeedItem } from "@/components/shared";
import { GridTabOption } from "@/types/main";
import {
  NFTFeedItem as NFTFeedItemType,
  OfferFeedItem as OfferFeedItemType,
} from "@/types/supabase";
import { GRID_ITEMS_PER_PAGE } from "@/utils/constants";

const Grid: FC = () => {
  const { user, loading } = useAuth();

  const [makeOfferItem, setMakeOfferItem] = useState<NFTFeedItemType | null>(
    null
  );
  const [expandOfferItem, setExpandOfferItem] =
    useState<OfferFeedItemType | null>(null);

  const [items, setItems] = useState<(NFTFeedItemType | OfferFeedItemType)[]>(
    []
  );

  const [tabOption, setTabOption] = useState<GridTabOption>("offers");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = async (tabOption: GridTabOption, page: number) => {
    let query;

    // required logged in
    if (tabOption === "offers" || tabOption === "pinned") {
      if (!user?.id) {
        setItems([]);
        setPage(1);
        setHasMore(true);
        return;
      }
    }

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
      case "offers":
        query = await supabase
          .from("user_offers")
          .select(
            "*, user:user_profile!user_offers_user_id_fkey(*), counter_user:user_profile!user_offers_user_id_counter_fkey(*)"
          )
          .or(`user_id.eq.${user?.id},user_id_counter.eq.${user?.id}`)
          .range(
            (page - 1) * GRID_ITEMS_PER_PAGE,
            page * GRID_ITEMS_PER_PAGE - 1
          );
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
      console.error("Error fetching items:", error);
      return;
    }

    if (page === 1) {
      setItems(data);
    } else {
      if (tabOption === "offers") {
        setItems((prevOffers) => {
          const newOffers = data.filter(
            (newOffer: OfferFeedItemType) =>
              !(prevOffers as OfferFeedItemType[]).some(
                (prevOffer) => prevOffer.id === newOffer.id
              )
          );
          return [...prevOffers, ...newOffers];
        });
      } else {
        setItems((prevNfts) => {
          const newNfts = data.filter(
            (newNft: NFTFeedItemType) =>
              !(prevNfts as NFTFeedItemType[]).some(
                (prevNft) => prevNft.nft_id === newNft.nft_id
              )
          );
          return [...prevNfts, ...newNfts];
        });
      }
    }

    setHasMore(data.length === GRID_ITEMS_PER_PAGE);
  };

  const makeOffer = async (nft: NFTFeedItemType) => {
    setMakeOfferItem(nft);
  };

  const expandOffer = async (offer: OfferFeedItemType) => {
    console.log("Expanding offer:", offer);
    setExpandOfferItem(offer);
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

    setItems(updatedNFTs);

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
      fetchItems(tabOption, 1);
      setPage(1);
    }
  }, [tabOption, loading]);

  return (
    <div className="w-full overflow-y-auto hide-scrollbar">
      <GridNavigation
        tabOption={tabOption}
        onNavigationChange={(tabOption: GridTabOption) => {
          setItems([]);
          setTabOption(tabOption);
        }}
      />
      {tabOption === "offers" ? (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {(items as OfferFeedItemType[]).map((item) => (
            <OfferFeedItem
              key={item.id}
              item={item}
              expandOffer={expandOffer}
            />
          ))}
        </div>
      ) : (
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {(items as NFTFeedItemType[]).map((item) => (
            <NFTFeedItem
              key={item.nft_id}
              item={item}
              makeOffer={makeOffer}
              pinItem={pinItem}
            />
          ))}
        </div>
      )}
      {/* has more button */}
      {makeOfferItem && (
        <Offer
          type="make_offer"
          initialNFT={makeOfferItem}
          closeModal={() => setMakeOfferItem(null)}
        />
      )}
      {expandOfferItem && (
        <Offer
          type="view_offer"
          offerId={expandOfferItem.id}
          closeModal={() => setExpandOfferItem(null)}
        />
      )}
    </div>
  );
};

export default Grid;
