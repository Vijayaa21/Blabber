import { useState } from "react";
import { HiOutlineSparkles } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import { getProfileImageUrl } from "../../utils/avatar";

const TabButton = ({ text, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
      active 
        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    {text}
  </button>
);

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0B0C15]/80 backdrop-blur-xl border-b border-white/5 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={getProfileImageUrl(authUser?.profileImg, authUser?.username)}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/30 sm:hidden"
            />
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <HiOutlineSparkles className="text-violet-400" />
                Home
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">See what's happening</p>
            </div>
          </div>
          
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5">
            <TabButton 
              text="For you" 
              active={feedType === "forYou"} 
              onClick={() => setFeedType("forYou")} 
            />
            <TabButton 
              text="Following" 
              active={feedType === "following"} 
              onClick={() => setFeedType("following")} 
            />
          </div>
        </div>
      </div>

      {/* Create Post Area */}
      <CreatePost />

      {/* Feed Info */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          {feedType === "forYou" ? "Latest Posts" : "From People You Follow"}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      {/* Posts Feed */}
      <Posts feedType={feedType} />
    </div>
  );
};

export default HomePage;
