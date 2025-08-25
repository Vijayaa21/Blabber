import { useState } from "react";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import { useQuery } from "@tanstack/react-query";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const username = authUser?.username;

  const getPostEndpoint = () => {
    if (feedType === "forYou") {
      return `/api/posts/user/${username}`; // Fetch all posts for the "For you" tab
    }
    return "/api/posts/following"; // Fetch posts from followed users for the "Following" tab
  };

  const {
    data: posts,
    isLoading,
    isRefetching,
    error,
  } = useQuery({
    queryKey: ["posts", feedType],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}${getPostEndpoint()}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    enabled: !!authUser,
    placeholderData: (previousData) => previousData,
  });

  return (
    <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
      {/* Header with improved tabs */}
      <div className="flex w-full border-b border-gray-700">
        <div
          className={
            "flex justify-center flex-1 p-3 hover:bg-white/10 transition duration-300 cursor-pointer relative font-semibold"
          }
          onClick={() => setFeedType("forYou")}
        >
          For you
          {feedType === "forYou" && (
            <div className="absolute bottom-0 w-full h-1 rounded-full bg-blue-500"></div>
          )}
        </div>
        <div
          className="flex justify-center flex-1 p-3 hover:bg-white/10 transition duration-300 cursor-pointer relative font-semibold"
          onClick={() => setFeedType("following")}
        >
          Following
          {feedType === "following" && (
            <div className="absolute bottom-0 w-full h-1 rounded-full bg-blue-500"></div>
          )}
        </div>
      </div>

      {feedType === "forYou" && (
        <div className="p-4 border-b border-gray-700">
          <CreatePost />
        </div>
      )}

      {/* POSTS */}
      <Posts
        posts={posts}
        isLoading={isLoading}
        isRefetching={isRefetching}
        feedType={feedType}
      />
    </div>
  );
};
export default HomePage;
