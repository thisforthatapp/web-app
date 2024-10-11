import React, { FC, useEffect, useState } from "react";
import { useAuth } from "@/providers/authProvider";
import { supabase } from "@/utils/supabaseClient";
import { timeAgo, formatDate } from "@/utils/helpers";
import { NFTImage } from "@/components/shared";
import { Close } from "@/icons";

const ActivityItem = ({ item, user }: { item: any; user: any }) => {
  const MessageDisplay = ({ item }) => {
    return (
      <div className="flex p-4 border-b border-gray-200 w-full">
        <div className="relative w-12 h-12 mr-4 shrink-0">
          <img
            src={
              process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
              user?.profile_pic_url
            }
            alt="Profile"
            className="w-full h-full rounded-full"
          />
        </div>
        <div>
          <div className="flex items-center gap-x-2">
            <div className="text-sm font-semibold">{user?.username}</div>
            <div className="text-xs text-gray-400">
              {formatDate(new Date(item.created_at))}
            </div>
          </div>
          <div className="text-black mt-1">{item.content}</div>
        </div>
      </div>
    );
  };

  const formatItems = (items, decoration) => {
    return items.map((nft, index) => (
      <React.Fragment key={nft.id}>
        <span
          className={`font-semibold text-gray-800 hover:underline cursor-pointer underline decoration-4 ${decoration}`}
        >
          {nft.name}
        </span>
        {index < items.length - 1 && ", "}
      </React.Fragment>
    ));
  };

  const NFTOfferDisplay = ({ item }) => {
    const userItems = item.offer
      ? formatItems(item.offer.user, "decoration-red-500")
      : null;
    const counterUserItems = item.offer
      ? formatItems(item.offer.userCounter, "decoration-blue-500")
      : null;

    return (
      <div className="flex items-start border-b border-gray-200 px-4 py-6 w-full">
        <div className="relative w-12 h-12 mr-6 shrink-0">
          <img
            src={
              process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
              user?.profile_pic_url
            }
            alt="Profile"
            className="w-full h-full rounded-full"
          />
          <div className="absolute bottom-[-6px] right-[-6px] bg-white rounded-full text-xs p-1 shadow-sm border border-black">
            🤝
          </div>
        </div>
        <div>
          <div className="flex items-center gap-x-2">
            <div className="text-sm font-semibold">{user?.username}</div>
            <div className="text-xs text-gray-400">
              {formatDate(new Date(item.created_at))}
            </div>
          </div>
          <div className="mt-1">
            <div>
              offering <span>{userItems}</span> for{" "}
              <span>{counterUserItems}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {item.offer.user.map((nft) => (
                <div
                  key={nft.id}
                  className="w-20 h-20 object-cover rounded-md border-4 border-red-500"
                >
                  <NFTImage
                    key={nft.id}
                    src={nft.image}
                    alt={nft.name}
                    fallback={nft.name}
                  />
                </div>
              ))}
              {item.offer.userCounter.map((nft) => (
                <div
                  key={nft.id}
                  className="w-20 h-20 object-cover rounded-md border-4 border-blue-500"
                >
                  <NFTImage
                    key={nft.id}
                    src={nft.image}
                    alt={nft.name}
                    fallback={nft.name}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center w-full">
      {item.item_type === "message" && <MessageDisplay item={item} />}
      {item.item_type === "offer" && <NFTOfferDisplay item={item} />}
    </div>
  );
};

const Main: FC<{
  offerId: string;
  info: any;
  acceptOffer: any;
  counterOffer: any;
  closeModal: any;
}> = ({ offerId, info, acceptOffer, counterOffer, closeModal }) => {
  const { user, profile, hasProfile } = useAuth();
  const [newMessage, setNewMessage] = useState<string>("");

  const [offerActivityItems, setOfferActivityItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  const fetchOfferActivity = async () => {
    try {
      const { data, error } = await supabase
        .from("user_offer_items")
        .select("*")
        .eq("offer_id", offerId)
        .order("created_at", { ascending: false })
        .limit(25);
      // .range();

      if (error) {
        throw error;
      }

      const reversedData = data.reverse();

      setOfferActivityItems(reversedData);
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
    }
  };

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim()) return;
    if (!profile) return;

    try {
      if (profile?.banned) {
        alert("You are banned from commenting.");
        return;
      }

      const optimisticId = Math.random();

      const newOfferItem = {
        offer_id: offerId,
        user_id: profile.id,
        item_type: "message",
        content: newMessage.trim(),
      };

      // optimistaclly update the UI
      setOfferActivityItems((prevActivityItems) => [
        ...prevActivityItems,
        {
          ...newOfferItem,
          id: optimisticId,
          created_at: new Date().toISOString(),
        } as unknown,
      ]);

      const { error } = await supabase
        .from("user_offer_items")
        .insert(newOfferItem);

      if (error) {
        console.error("Error submitting comment:", error);
        setOfferActivityItems(
          offerActivityItems.filter(
            (activityItem) => Number(activityItem.id) !== optimisticId
          )
        );
      } else {
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  useEffect(() => {
    if (offerId) {
      fetchOfferActivity();
    }
  }, [offerId]);

  console.log("user info", info);

  return (
    <>
      <div className="flex items-center py-4 px-4">
        <div className="flex flex-col">
          <div className="flex items-center">
            <img
              src={
                process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
                info?.user?.profile_pic_url
              }
              alt={info?.user?.username}
              className="ml-2 w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-2.5">
              <div className="font-semibold">{info?.user?.username}</div>
              <div className="text-gray-500">
                made an offer {timeAgo(new Date(info?.created_at))}
              </div>
            </div>
          </div>
        </div>
        {/* <div className="ml-auto text-sm font-semibold bg-yellow-100 text-yellow-800 px-4 py-2 rounded">
          Negotiation
        </div> */}
        <div className="ml-auto cursor-pointer" onClick={() => closeModal()}>
          <Close className="w-8 h-8" />
        </div>
      </div>
      <div className="max-h-[450px] overflow-y-auto hide-scrollbar bg-gray-50">
        {info &&
          offerActivityItems.map((item: any) => (
            <ActivityItem
              key={item.id}
              item={item}
              user={
                item.user_id === info?.user_id ? info.user : info.counter_user
              }
            />
            // <div
            //   key={item.id}
            //   className="flex items-center justify-between p-4 border-b border-gray-200"
            // >
            //   <div>
            //     <div className="font-semibold">{item.item_type}</div>
            //     {/* <div className="text-sm text-gray-500">{item.content}</div> */}
            //   </div>
            //   <div className="text-sm text-gray-500">
            //     {new Date(item.created_at).toLocaleString()}
            //   </div>
            // </div>
          ))}
      </div>
      <div className="px-4 pt-4">
        <form onSubmit={submitMessage} className="gap-x-2 flex h-[50px]">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Send a message..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-gray-800 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!newMessage.trim() || !hasProfile}
          >
            Send
          </button>
        </form>
      </div>
      <div className="flex items-center justify-center p-4 gap-x-4">
        <button
          className="bg-green-300 p-3 rounded-md shadow-sm cursor-pointer w-full font-semibold text-xl"
          onClick={acceptOffer}
        >
          ✅ Accept
        </button>
        <button
          className="bg-yellow-300 p-3 rounded-md shadow-sm cursor-pointer w-full font-semibold text-xl"
          onClick={counterOffer}
        >
          🤝 Counter
        </button>
      </div>
    </>
  );
};

export default Main;
