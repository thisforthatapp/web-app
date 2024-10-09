import { FC, useState } from "react";
import { Close } from "@/icons";

const Main: FC = () => {
  const [newMessage, setNewMessage] = useState<string>("");

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    // if (!newMessage.trim()) return;
    // if (!profile) return;

    // try {
    //   if (profile?.banned) {
    //     alert("You are banned from commenting.");
    //     return;
    //   }

    //   const optimisticId = Math.random();
    //   const newMsg = {
    //     user_id: profile.id,
    //     activity_type: "message",
    //     content: newMessage.trim(),
    //     username: profile.username,
    //     profile_pic_url: profile.profile_pic_url,
    //   };

    //   // optimistaclly update the UI
    //   setActivities((prevActivities) => [
    //     ...prevActivities,
    //     {
    //       ...newMsg,
    //       id: optimisticId,
    //       created_at: new Date().toISOString(),
    //       metadata: null,
    //     } as unknown as Activity,
    //   ]);

    //   const { error } = await supabase.from("activities").insert(newMsg);

    //   if (error) {
    //     console.error("Error submitting comment:", error);
    //     setActivities(
    //       activities.filter((activity) => Number(activity.id) !== optimisticId)
    //     );
    //   } else {
    //     setNewMessage("");
    //   }
    // } catch (error) {
    //   console.error("Failed to send message", error);
    // }
  };

  return (
    <>
      <div>
        <p className="font-semibold">Alica</p>
        <p className="text-sm text-gray-500">
          Offer made 10/9/2024, 11:07:37 AM
        </p>
        <div className="text-sm font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
          Negotiation
        </div>
        <div onClick={() => {}}>
          <Close className="w-6 h-6" />
        </div>
      </div>
      <div className="min-h-[350px] bg-gray-100">Body</div>
      <div className="flex justify-between bg-gray-100">
        <div>Create A Counter Offer</div>
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
