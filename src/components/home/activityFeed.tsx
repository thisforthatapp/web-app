import { FC, useState, useRef, useEffect } from "react";
import { useAuth } from "@/providers/authProvider";
import { supabase } from "@/utils/supabaseClient";
import { CollapsibleIcon } from "@/icons";
import { Activity } from "@/types/supabase";

function renderMessageText(text: string) {
  // This regex matches most common URL formats
  const urlRegex =
    /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add the matched URL
    const fullUrl = match[0];
    parts.push(
      <a
        key={match.index}
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="underline"
      >
        {fullUrl}
      </a>
    );

    lastIndex = urlRegex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

const ActivityFeed: FC<{ showCollapsibleTab: boolean }> = ({
  showCollapsibleTab = true,
}) => {
  const { profile, hasProfile } = useAuth();
  const [feedCollapsed, setFeedCollapsed] = useState(false);
  const toggleFeed = () => setFeedCollapsed(!feedCollapsed);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const chatFeedRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    // Subscribe to real-time updates
    supabase
      .channel("activities")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
        },
        (payload) => {
          setActivities((prevActivities) => [
            payload.new as Activity,
            ...prevActivities,
          ]);
        }
      )
      .subscribe();

    // Fetch initial activities
    fetchActivities(page);

    return () => {
      supabase.channel("activities").unsubscribe();
    };
  }, []);

  const fetchActivities = async (page: number) => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .range((page - 1) * 20, page * 20 - 1);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setActivities((prevActivities) => [...prevActivities, ...data]);
        setPage(page + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setLoading(false);
    }
  };

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim()) return;
    if (!profile) return;

    try {
      // if (profile?.banned) {
      //   alert("You are banned from commenting.");
      //   return;
      // }

      const optimisticId = Math.random();
      const newMsg = {
        user_id: profile.id,
        activity_type: "message",
        content: newMessage.trim(),
        username: profile.username,
        profile_pic_url: profile.profile_pic_url,
      };

      // optimistaclly update the UI
      setActivities((prevActivities) => [
        ...prevActivities,
        {
          ...newMsg,
          id: optimisticId,
          created_at: new Date().toISOString(),
          metadata: null,
        } as unknown as Activity,
      ]);

      const { error } = await supabase.from("activities").insert(newMsg);

      if (error) {
        console.error("Error submitting comment:", error);
        setActivities(
          activities.filter((activity) => Number(activity.id) !== optimisticId)
        );
      } else {
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const desktopStyle = `shadow-[0_0_3px_#bbbbbb] hidden lg:flex flex-col h-full ${
    feedCollapsed ? "w-12" : "w-[460px]"
  } bg-white transition-all duration-300 ease-in-out shrink-0`;
  const mobileStyle = `h-full w-full`;

  return (
    <div className={`${showCollapsibleTab ? desktopStyle : mobileStyle}`}>
      {showCollapsibleTab && (
        <button
          onClick={toggleFeed}
          className={`relative bg-white flex items-center justify-center text-lg font-semibold py-2 border-b border-gray-100 w-full ${
            feedCollapsed ? "h-full" : "px-4"
          }`}
        >
          {feedCollapsed ? (
            <div className="w-full h-full flex items-center justify-center">
              <CollapsibleIcon collapsed={feedCollapsed} />
            </div>
          ) : (
            <>
              <div className="absolute left-4">
                <CollapsibleIcon collapsed={feedCollapsed} />
              </div>
              <span className="flex-grow text-center">Activity</span>
            </>
          )}
        </button>
      )}
      {!feedCollapsed && (
        <>
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {loading && (
              <div className="text-center text-gray-500">Loading...</div>
            )}
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start border-b border-[#f7f7f7] px-4 pt-4 pb-2"
              >
                <img
                  src={
                    process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL +
                    activity.profile_pic_url
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="text-sm font-semibold">{activity.username}</p>
                  <p className="text-sm text-gray-700">
                    {renderMessageText(activity.content || "")}
                  </p>
                  <span className="text-xs text-gray-400">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
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
      )}
    </div>
  );
};

export default ActivityFeed;
