import React, { useState } from "react";
import { useAuth } from "@/providers/authProvider";
import { supabase } from "@/utils/supabaseClient";
import SelectNFT from "./selectNft";

const Select = ({ initialNFT }) => {
  const { profile } = useAuth();
  const [user1Items, setUser1Items] = useState([]);
  const [user2Items, setUser2Items] = useState([
    {
      id: initialNFT.nft_id,
      name: initialNFT.nft_name,
      image: initialNFT.nft_image,
      chaind_id: initialNFT.nft_chain_id,
      collection_contract: initialNFT.nft_collection_contract,
      token_id: initialNFT.nft_token_id,
      token_type: initialNFT.nft_token_type,
    },
  ]);
  const [isSelectingNFTs, setIsSelectingNFTs] = useState(false);
  const [selectingUser, setSelectingUser] = useState(null);

  const addItem = (user) => {
    setSelectingUser(user);
    setIsSelectingNFTs(true);
  };

  const handleNFTSelection = (nfts) => {
    if (selectingUser === "user1") {
      setUser1Items(nfts);
    } else {
      setUser2Items(nfts);
    }
  };

  const closeNFTSelection = () => {
    setIsSelectingNFTs(false);
    setSelectingUser(null);
  };

  const proposeTrade = async () => {
    try {
      console.log("Proposing trade with the following items:");
      console.log("User 1:", user1Items);
      console.log("User 2:", user2Items);

      const { data, error } = await supabase.rpc("create_initial_offer", {
        p_user_id: profile?.id,
        p_user_id_counter: initialNFT.nft_user_id,
        p_offer: {
          user: user1Items,
          userCounter: user2Items,
        },
      });

      console.log("return data:", data, error);

      if (error) throw error;

      // alert("Trade proposed successfully!");
      // go to main screen
    } catch (error) {
      console.error("Error proposing trade:", error);
      alert("Failed to propose trade. Please try again.");
    }
  };

  const UserSection = ({ user, items, onAddItem }) => (
    <div
      className={`flex-1 p-5 relative ${
        user === "user2" ? "bg-gray-100" : "bg-white"
      }`}
    >
      <div className="flex items-center">
        <img
          src={
            process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
            (user === "user1"
              ? profile?.profile_pic_url
              : initialNFT?.nft_user_id_profile_pic_url)
          }
          alt="Profile Picture"
          className="w-10 h-10 rounded-full"
        />
        <div className="text-lg font-semibold ml-2">
          {user === "user1"
            ? profile?.username
            : initialNFT?.nft_user_id_username}
        </div>
      </div>
      <button
        className="absolute top-5 right-5 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
        onClick={() => onAddItem(user)}
      >
        + Add NFT
      </button>
      <div className="mt-12 grid grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="border-gray-900 border-4 p-4 rounded-lg flex-1 text-center cursor-pointer"
            onClick={() => {
              if (user === "user1") {
                setUser1Items((prev) => prev.filter((i) => i.id !== item.id));
              } else {
                setUser2Items((prev) => prev.filter((i) => i.id !== item.id));
              }
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-32 object-cover rounded"
            />
            <p className="mt-2">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen rounded-lg bg-gray-100 overflow-hidden">
      <UserSection user="user1" items={user1Items} onAddItem={addItem} />
      <UserSection user="user2" items={user2Items} onAddItem={addItem} />

      <button
        className="p-4 m-5 bg-yellow-200 text-lg rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200"
        onClick={proposeTrade}
      >
        Propose Trade
      </button>

      {isSelectingNFTs && (
        <SelectNFT
          userId={
            selectingUser === "user1" ? profile.id : initialNFT.nft_user_id
          }
          selectedNFTs={selectingUser === "user1" ? user1Items : user2Items}
          onSelect={handleNFTSelection}
          onClose={closeNFTSelection}
        />
      )}
    </div>
  );
};

export default Select;
