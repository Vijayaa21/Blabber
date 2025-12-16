import { Link } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { FaUserPlus, FaUserMinus } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getProfileImageUrl } from "../../utils/avatar";
import LoadingSpinner from "./LoadingSpinner";

const UserListModal = ({ isOpen, onClose, title, users, isLoading }) => {
	const queryClient = useQueryClient();
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const { mutate: followUser, isPending } = useMutation({
		mutationFn: async (userId) => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/follow/${userId}`, {
				method: "POST",
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to follow user");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
			queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	if (!isOpen) return null;

	return (
		<div 
			className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex justify-center items-center p-4"
			onClick={onClose}
		>
			<div 
				className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center">
					<h2 className="text-lg font-bold text-white">{title}</h2>
					<button 
						onClick={onClose}
						className="p-2 hover:bg-white/10 rounded-full transition-colors"
					>
						<IoClose className="w-5 h-5 text-slate-400" />
					</button>
				</div>

				{/* User List */}
				<div className="overflow-y-auto max-h-[calc(70vh-60px)]">
					{isLoading ? (
						<div className="flex justify-center py-12">
							<LoadingSpinner size="lg" />
						</div>
					) : users?.length === 0 ? (
						<div className="text-center py-12">
							<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
								<span className="text-3xl">👥</span>
							</div>
							<p className="text-slate-400">No users to show</p>
						</div>
					) : (
						<div className="p-2">
							{users?.map((user) => {
								const isFollowing = authUser?.following?.includes(user._id);
								const isOwnProfile = authUser?._id === user._id;

								return (
									<div 
										key={user._id} 
										className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group"
									>
										<Link 
											to={`/profile/${user.username}`}
											onClick={onClose}
											className="flex items-center gap-3 flex-1 min-w-0"
										>
											<img 
												src={getProfileImageUrl(user.profileImg, user.username)} 
												alt={user.fullName}
												className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-violet-500/30 transition-all"
											/>
											<div className="min-w-0">
												<p className="font-semibold text-white truncate group-hover:text-violet-400 transition-colors">
													{user.fullName}
												</p>
												<p className="text-sm text-slate-500 truncate">@{user.username}</p>
											</div>
										</Link>

										{!isOwnProfile && (
											<button
												onClick={(e) => {
													e.preventDefault();
													followUser(user._id);
												}}
												disabled={isPending}
												className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
													isFollowing
														? 'bg-slate-800 text-slate-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 border border-white/10'
														: 'bg-violet-600 text-white hover:bg-violet-700'
												}`}
											>
												{isFollowing ? (
													<>
														<FaUserMinus size={12} />
														<span className="hidden sm:inline">Following</span>
													</>
												) : (
													<>
														<FaUserPlus size={12} />
														<span className="hidden sm:inline">Follow</span>
													</>
												)}
											</button>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default UserListModal;