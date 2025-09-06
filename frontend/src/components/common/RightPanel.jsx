import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import useFollow from "../../hooks/useFollow";

import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";

const RightPanel = () => {
	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/suggested`,{
          		credentials: "include",
        		});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
	});

	const { follow, isPending } = useFollow();

	if (suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>;

	return (
		<div className="hidden lg:block w-72 my-4 ">
			<div
				className="
					bg-gradient-to-br from-[#7B2FF7]/20 to-[#2C3E50]/20 
					backdrop-blur-lg border border-white/10 
					rounded-2xl p-5 sticky top-4 shadow-md
				"
			>
				<p className="font-bold text-white mb-4 text-lg">Who to follow</p>

				<div className="flex flex-col gap-4">
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}

					{!isLoading &&
						suggestedUsers?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								key={user._id}
								className="
									flex items-center justify-between gap-4
									hover:bg-white/10 transition-colors rounded-xl p-2
									cursor-pointer
								"
							>
								<div className="flex gap-3 items-center">
									<div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-sm">
										<img
											src={user.profileImg || "/avatar-placeholder.png"}
											alt={user.fullName}
											className="w-full h-full object-cover"
										/>
									</div>

									<div className="flex flex-col">
										<span className="font-semibold text-white truncate max-w-[120px]">
											{user.fullName}
										</span>
										<span className="text-sm text-slate-400">@{user.username}</span>
									</div>
								

								<div>
									<button
										className="
											bg-white text-black hover:opacity-90 
											rounded-full btn-sm px-4 py-1 font-semibold
											transition
										"
										onClick={(e) => {
											e.preventDefault();
											follow(user._id);
										}}
										disabled={isPending}
									>
										{isPending ? <LoadingSpinner size="sm" /> : "Follow"}
									</button></div>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};

export default RightPanel;
