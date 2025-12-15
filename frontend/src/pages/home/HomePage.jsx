import { useState } from "react";
import { HiOutlineViewGrid, HiOutlineFilter } from "react-icons/hi";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const TabButton = ({ text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      active ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
    }`}
  >
    {text}
  </button>
);

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  return (
    <div className="w-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-4 z-40 bg-[#0B0C15]/80 backdrop-blur-xl p-4 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex bg-slate-900/50 p-1 rounded-xl w-fit border border-white/5">
          <TabButton text="For you" active={feedType === "forYou"} onClick={() => setFeedType("forYou")} />
          <TabButton text="Following" active={feedType === "following"} onClick={() => setFeedType("following")} />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <HiOutlineFilter size={20} />
          </button>
        </div>
      </div>

      {/* Create Post Area - Floating Card */}
      <CreatePost />

      {/* Posts Feed */}
      <Posts feedType={feedType} />
    </div>
  );
};

export default HomePage;
