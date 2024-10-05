"use client";

import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/providers/authProvider";
import { supabase } from "@/utils/supabaseClient";
import { UserNavigation } from "@/components/user";
import { Profile } from "@/types/supabase";

type NFTCategory = "my-interests" | "not-for-swap" | "for-swap";

interface NFT {
  id: string;
  imageUrl: string;
  title: string;
}

interface UserPageProps {
  params: {
    id: string;
  };
}

const UserPage: FC<UserPageProps> = ({ params }) => {
  // query for user profile
  const [profile, setProfile] = useState<Profile | null>(null);

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

    setProfile(data);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  console.log("params", params);

  const [selectedCategory, setSelectedCategory] =
    useState<NFTCategory>("my-interests");

  const nfts: { [key in NFTCategory]: NFT[] } = {
    "my-interests": [
      { id: "5", imageUrl: "/temp/nft.png", title: "NFT 5" },
      { id: "6", imageUrl: "/temp/nft.png", title: "NFT 6" },
    ],
    "not-for-swap": [
      { id: "1", imageUrl: "/temp/nft.png", title: "NFT 1" },
      { id: "2", imageUrl: "/temp/nft.png", title: "NFT 2" },
    ],
    "for-swap": [
      { id: "3", imageUrl: "/temp/nft.png", title: "NFT 3" },
      { id: "4", imageUrl: "/temp/nft.png", title: "NFT 4" },
    ],
  };

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex justify-center">
      <div className="w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar">
        <div className="px-8 container mx-auto">
          {/* Profile Header */}
          <div className="mt-12 mb-6 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="relative w-[150px] h-[150px]">
                <img
                  src={
                    process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
                    profile?.profile_pic_url
                  }
                  alt="Profile Picture"
                  className="w-full h-full rounded-full mx-auto"
                />
              </div>
              <div className="flex items-center mt-4">
                <div className="text-3xl font-bold">{profile?.username}</div>
              </div>
              <p className="text-gray-600 mt-2">{profile?.bio}</p>
              <div className="flex items-center text-sm bg-gray-100 border border-gray-200 px-3 py-1 rounded-full mt-4 cursor-pointer">
                <div className="ml-1">follow</div>
              </div>
            </div>
          </div>

          {/* NFT Category Tabs */}
          <UserNavigation onNavigationChange={() => {}} />

          {/* NFT Grid */}
          <div className="mt-8 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nfts[selectedCategory].map((nft) => (
              <div
                key={nft.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <Image
                  src={nft.imageUrl}
                  alt={nft.title}
                  width={300}
                  height={300}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{nft.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
