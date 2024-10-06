import { FC, useEffect, useState } from "react";
import { useAuth } from "@/providers/authProvider";
import { supabase } from "@/utils/supabaseClient";
import { Offer } from "@/components/modals";
import { GridTabOption } from "@/types/main";
import { NFT, Profile } from "@/types/supabase";
import { GRID_ITEMS_PER_PAGE } from "@/utils/constants";
import { NftItem } from "@/components/shared";

import GridNavigation from "./gridNavigation";

const Grid: FC = () => {
  const { user } = useAuth();
  const [makeOfferInfo, setMakeOfferInfo] = useState<{
    nft: NFT;
    user: Profile;
  } | null>(null);

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

    // console.log("fetchNfts", tabOption);

    switch (tabOption) {
      case "home":
        query = supabase
          .from("nfts")
          .select(
            "*, user_pins!left(user_id), user_profile!nfts_user_id_fkey (*)"
          )
          // .eq("user_pins.user_id", user?.id)
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
          .select("*, user_profile!nfts_user_id_fkey (*)")
          .order("updated_at", { ascending: false })
          .range(
            (page - 1) * GRID_ITEMS_PER_PAGE,
            page * GRID_ITEMS_PER_PAGE - 1
          );
        break;
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

  const makeOffer = async (nft: NFT, user: Profile) => {
    setMakeOfferInfo({ nft, user });
  };

  const pinItem = async (nft: NFT) => {
    console.log("pinItem", nft);

    if (!user) return;

    const { data, error } = await supabase.from("user_pins").insert([
      {
        user_id: user?.id,
        nft_id: nft.id,
      },
    ]);

    console.log("data", data);

    if (error) {
      console.error("Error following user:", error);
      return;
    }

    /*
    if (isFollowing) {
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user?.id)
        .eq("followed_id", userPageProfile?.id);

      if (error) {
        console.error("Error unfollowing user:", error);
        return;
      }
      // setIsFollowing(false);
    } else {
      const { error } = await supabase.from("user_pins").insert([
        {
          user_id: user?.id,
          nft_id: itemId,
        },
      ]);

      if (error) {
        console.error("Error following user:", error);
        return;
      }
      // setIsFollowing(true);
    }
    */
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
            makeOffer={makeOffer}
            pinItem={pinItem}
          />
        ))}
      </div>
      {/* has more button */}
      {makeOfferInfo && (
        <Offer type="make_offer" closeModal={() => setMakeOfferInfo(null)} />
      )}
    </div>
  );
};

export default Grid;
