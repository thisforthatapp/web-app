import { FC, useEffect, useState } from "react";
import { useAuth } from "@/providers/authProvider";
import { supabase } from "@/utils/supabaseClient";
import { Close } from "@/icons";

const Main: FC<{ offerId: string; info: any }> = ({ offerId, info }) => {
  const { profile, hasProfile } = useAuth();
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

      setOfferActivityItems(data);
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

  return (
    <>
      <div className="flex py-4">
        <div>
          <div className="font-semibold">Alice</div>
          <div className="text-sm text-gray-500">
            Offer made 10/9/2024, 11:07:37 AM
          </div>
        </div>
        <div className="ml-auto text-sm font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
          Negotiation
        </div>
        <div className="mx-6" onClick={() => {}}>
          <Close className="w-6 h-6" />
        </div>
      </div>
      <div className="min-h-[500px] bg-gray-100">
        {offerActivityItems.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border-b border-gray-200"
          >
            <div>
              <div className="font-semibold">{item.item_type}</div>
              {/* <div className="text-sm text-gray-500">{item.content}</div> */}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center bg-gray-100 px-4 gap-x-4">
        <button className="bg-green-300 px-4 py-4 rounded-md mb-4 shadow-sm cursor-pointer">
          🤝 Accept Offer
        </button>
        <button className="bg-yellow-300 px-4 py-4 rounded-md mb-4 shadow-sm cursor-pointer">
          🤝 Counter Offer
        </button>
      </div>
      <div className="p-3">
        <form onSubmit={submitMessage} className="gap-x-2 flex">
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
    </>
  );
};

export default Main;
