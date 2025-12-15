import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineSearch } from "react-icons/hi";

import useFollow from "../../hooks/useFollow";

import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";
import { getProfileImageUrl } from "../../utils/avatar";

const RightPanel = () => {
	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/suggested`, {
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Something went wrong!");
			}
			return data;
		},
	});

	const { follow, isPending } = useFollow();

	return (
		<div className="flex flex-col gap-6 h-full">
			{/* Search Card */}
			<div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-3xl">
				<div className="relative group">
					<div className="absolute left-4 top-3 text-slate-500 group-focus-within:text-violet-400 transition-colors">
						<HiOutlineSearch size={18} />
					</div>
					<input
						type="text"
						placeholder="Search..."
						className="w-full bg-slate-950/50 border border-transparent focus:border-violet-500/50 text-slate-200 rounded-xl py-2.5 pl-11 pr-4 outline-none transition-all placeholder-slate-600 text-sm"
					/>
				</div>
			</div>

			{/* Who to Follow Card */}
			<div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden flex-1 min-h-0 overflow-y-auto no-scrollbar">
				<h3 className="font-bold text-lg p-6 pb-4 sticky top-0 bg-slate-900/90 backdrop-blur-xl z-10 border-b border-white/5 text-white">
					Who to follow
				</h3>

				<div className="p-3 space-y-1">
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}

					{!isLoading && suggestedUsers?.length === 0 && (
						<p className="text-slate-500 text-sm text-center py-8">No suggestions available</p>
					)}

					{!isLoading &&
						suggestedUsers?.map((user) => (
							<div
								key={user._id}
								className="flex items-center justify-between gap-3 hover:bg-white/5 transition-colors rounded-2xl p-3 cursor-pointer group"
							>
								<Link to={`/profile/${user.username}`} className="flex gap-3 items-center flex-1 min-w-0">
									<div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-violet-500/20 transition-all flex-shrink-0">
										<img
											src={getProfileImageUrl(user.profileImg, user.username)}
											alt={user.fullName}
											className="w-full h-full object-cover"
										/>
									</div>
									<div className="flex flex-col min-w-0">
										<span className="font-semibold text-white truncate text-sm group-hover:text-violet-300 transition-colors">
											{user.fullName}
										</span>
										<span className="text-xs text-slate-500 truncate">@{user.username}</span>
									</div>
								</Link>
								<button
									className="bg-white text-slate-950 hover:bg-violet-100 rounded-full px-4 py-1.5 text-xs font-bold transition-all flex-shrink-0 shadow-sm"
									onClick={(e) => {
										e.preventDefault();
										follow(user._id);
									}}
									disabled={isPending}
								>
									{isPending ? <LoadingSpinner size="sm" /> : "Follow"}
								</button>
							</div>
						))}
				</div>
			</div>

			{/* Premium Card */}
			<div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/20 backdrop-blur-md border border-violet-500/20 rounded-3xl p-6 relative overflow-hidden">
				<div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/20 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
				<h3 className="font-bold text-xl mb-2 relative z-10 text-white">Premium</h3>
				<p className="text-violet-200/70 text-sm mb-4 relative z-10">Unlock exclusive tools and badges.</p>
				<button className="w-full bg-white text-violet-950 font-bold py-2.5 rounded-xl text-sm relative z-10 hover:bg-violet-50 transition-colors shadow-lg">
					Upgrade
				</button>
			</div>
		</div>
	);
};

export default RightPanel;
