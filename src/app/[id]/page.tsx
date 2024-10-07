"use client";

import { FC, useEffect, useState } from "react";
import { useAuth } from "@/providers/authProvider";
import { supabase } from "@/utils/supabaseClient";
import { Offer } from "@/components/modals";
import { UserNavigation } from "@/components/user";
import { NFTFeedItem } from "@/components/shared";
import { UserTabOption } from "@/types/main";
import { Profile, NFTFeedItem as NFTFeedItemType } from "@/types/supabase";
import { GRID_ITEMS_PER_PAGE } from "@/utils/constants";

interface UserPageProps {
  params: {
    id: string;
  };
}

const UserPage: FC<UserPageProps> = ({ params }) => {
  const { user, loading, profile } = useAuth();
  const [offerItem, setOfferItem] = useState<NFTFeedItemType | null>(null);

  const [userPageProfile, setUserPageProfile] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const [nfts, setNfts] = useState<NFTFeedItemType[]>([]);
  const [tabOption, setTabOption] = useState<UserTabOption>("yes_for_swap");
  const [, setPage] = useState(1);
  const [, setHasMore] = useState(true);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("user_profile")
      .select("*")
      .eq("username", params.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    setUserPageProfile(data);
  };

  const checkIfFollowing = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from("user_follows")
      .select("*")
      .eq("follower_id", user?.id)
      .eq("followed_id", userPageProfile?.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking follow status:", error);
      return;
    }
    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!profile) return;

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
      setIsFollowing(false);
    } else {
      const { error } = await supabase.from("user_follows").insert([
        {
          follower_id: user?.id,
          followed_id: userPageProfile?.id,
        },
      ]);

      if (error) {
        console.error("Error following user:", error);
        return;
      }
      setIsFollowing(true);
    }
  };

  useEffect(() => {
    if (loading) return;

    if (params.id === profile?.username) {
      setUserPageProfile(profile);
    } else {
      fetchProfile();
    }
  }, [loading, profile]);

  useEffect(() => {
    if (loading) return;

    if (userPageProfile?.id !== profile?.id) {
      checkIfFollowing();
    }
  }, [userPageProfile]);

  const fetchNfts = async (tabOption: UserTabOption, page: number) => {
    let query;

    switch (tabOption) {
      case "yes_for_swap":
      case "no_for_swap":
        query = await supabase.rpc("get_user_feed", {
          page_user_id: userPageProfile?.id,
          current_user_id: user?.id,
          nft_for_swap: tabOption === "yes_for_swap",
          range_start: (page - 1) * GRID_ITEMS_PER_PAGE,
          range_end: page * GRID_ITEMS_PER_PAGE - 1,
        });
        break;
      case "pinned":
        query = await supabase.rpc("get_user_pinned_feed", {
          page_user_id: userPageProfile?.id,
          current_user_id: user?.id,
          range_start: (page - 1) * GRID_ITEMS_PER_PAGE,
          range_end: page * GRID_ITEMS_PER_PAGE - 1,
        });
        break;
      default:
        query = await supabase.rpc("get_user_feed", {
          page_user_id: userPageProfile?.id,
          current_user_id: user?.id,
          nft_for_swap: true,
          range_start: (page - 1) * GRID_ITEMS_PER_PAGE,
          range_end: page * GRID_ITEMS_PER_PAGE - 1,
        });
        break;
    }

    const { data, error } = await query;

    const dataUpdated = data.map((nft: NFTFeedItemType) => {
      return {
        ...nft,
        nft_user_id_username: userPageProfile?.username,
        nft_user_id_profile_pic_url: userPageProfile?.profile_pic_url,
      };
    });

    if (error) {
      console.error("Error fetching songs:", error);
      return;
    }

    if (page === 1) {
      setNfts(dataUpdated);
    } else {
      setNfts((prevNfts) => {
        const newNfts = dataUpdated.filter(
          (newNft: NFTFeedItemType) =>
            !prevNfts.some((prevNft) => prevNft.nft_id === newNft.nft_id)
        );
        return [...prevNfts, ...newNfts];
      });
    }

    setHasMore(dataUpdated.length === GRID_ITEMS_PER_PAGE);
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
    if (tabOption && userPageProfile && !loading) {
      fetchNfts(tabOption, 1);
      setPage(1);
    }
  }, [tabOption, userPageProfile, loading]);

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex justify-center">
      <div className="w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar">
        <div className="px-8 container mx-auto">
          <div className="mt-12 mb-6 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="relative w-[150px] h-[150px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL! +
                    userPageProfile?.profile_pic_url
                  }
                  alt="Profile Picture"
                  className="w-full h-full rounded-full mx-auto"
                />
              </div>
              <div className="flex items-center mt-4">
                <div className="text-3xl font-bold">
                  {userPageProfile?.username}
                </div>
              </div>
              <p className="text-gray-600 mt-2">{userPageProfile?.bio}</p>
              <div
                className={`flex items-center border px-3 py-1 rounded-full mt-4 cursor-pointer ${
                  isFollowing
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 border-gray-200"
                }`}
                onClick={handleFollow}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </div>
            </div>
          </div>

          <UserNavigation
            tabOption={tabOption}
            onNavigationChange={(tabOption: UserTabOption) =>
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
        </div>
      </div>
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

export default UserPage;
