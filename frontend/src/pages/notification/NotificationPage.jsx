import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useState } from "react";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getProfileImageUrl } from "../../utils/avatar";

import { IoSettingsOutline, IoCheckmarkDone } from "react-icons/io5";
import { FaUser, FaComment, FaTrash } from "react-icons/fa";
import { FaHeart, FaRetweet } from "react-icons/fa6";
import { HiOutlineBell, HiOutlineSparkles } from "react-icons/hi";

const getNotificationContent = (type) => {
	switch (type) {
		case "follow":
			return {
				text: "started following you",
				icon: <FaUser className="w-4 h-4" />,
				color: "text-violet-500",
				bgColor: "bg-violet-500/10",
				borderColor: "border-violet-500/20"
			};
		case "like":
			return {
				text: "liked your post",
				icon: <FaHeart className="w-4 h-4" />,
				color: "text-pink-500",
				bgColor: "bg-pink-500/10",
				borderColor: "border-pink-500/20"
			};
		case "repost":
			return {
				text: "reposted your post",
				icon: <FaRetweet className="w-4 h-4" />,
				color: "text-green-500",
				bgColor: "bg-green-500/10",
				borderColor: "border-green-500/20"
			};
		case "comment":
			return {
				text: "commented on your post",
				icon: <FaComment className="w-4 h-4" />,
				color: "text-blue-500",
				bgColor: "bg-blue-500/10",
				borderColor: "border-blue-500/20"
			};
		default:
			return {
				text: "interacted with you",
				icon: <HiOutlineBell className="w-4 h-4" />,
				color: "text-slate-400",
				bgColor: "bg-slate-500/10",
				borderColor: "border-slate-500/20"
			};
	}
};

const formatTimeAgo = (date) => {
	const now = new Date();
	const diff = now - new Date(date);
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m`;
	if (hours < 24) return `${hours}h`;
	if (days < 7) return `${days}d`;
	return new Date(date).toLocaleDateString();
};

const NotificationPage = () => {
	const [filter, setFilter] = useState("all");
	const queryClient = useQueryClient();
	
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
	});

	const { mutate: deleteNotifications, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
				method: "DELETE",
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: () => {
			toast.success("All notifications cleared");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const filteredNotifications = notifications?.filter((n) => {
		if (filter === "all") return true;
		return n.type === filter;
	});

	const filterOptions = [
		{ value: "all", label: "All", icon: <HiOutlineSparkles size={16} /> },
		{ value: "follow", label: "Follows", icon: <FaUser size={14} /> },
		{ value: "like", label: "Likes", icon: <FaHeart size={14} /> },
		{ value: "comment", label: "Comments", icon: <FaComment size={14} /> },
		{ value: "repost", label: "Reposts", icon: <FaRetweet size={14} /> },
	];

	return (
		<div className="min-h-screen">
			{/* Header */}
			<div className="sticky top-0 z-20 bg-[#0B0C15]/80 backdrop-blur-xl border-b border-white/5">
				<div className="flex justify-between items-center px-4 sm:px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
							<HiOutlineBell className="text-white" size={20} />
						</div>
						<div>
							<h1 className="text-xl font-bold text-white">Notifications</h1>
							<p className="text-xs text-slate-500">{notifications?.length || 0} total</p>
						</div>
					</div>
					
					<div className="dropdown dropdown-end">
						<div tabIndex={0} role="button" className="p-2.5 hover:bg-white/5 rounded-xl transition-colors cursor-pointer border border-white/5">
							<IoSettingsOutline className="w-5 h-5 text-slate-400" />
						</div>
						<ul
							tabIndex={0}
							className="dropdown-content z-[1] menu p-2 shadow-2xl bg-slate-900 border border-white/10 rounded-xl w-56 mt-2"
						>
							<li>
								<button className="flex items-center gap-2 text-slate-300 hover:bg-white/5 rounded-lg">
									<IoCheckmarkDone size={16} />
									Mark all as read
								</button>
							</li>
							<li>
								<button
									onClick={() => deleteNotifications()}
									disabled={isDeleting}
									className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 rounded-lg"
								>
									<FaTrash size={14} />
									{isDeleting ? "Clearing..." : "Clear all"}
								</button>
							</li>
						</ul>
					</div>
				</div>

				{/* Filter Tabs */}
				<div className="px-4 sm:px-6 pb-3 overflow-x-auto hide-scrollbar">
					<div className="flex gap-2">
						{filterOptions.map((option) => (
							<button
								key={option.value}
								onClick={() => setFilter(option.value)}
								className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
									filter === option.value
										? "bg-violet-600 text-white"
										: "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/5"
								}`}
							>
								{option.icon}
								{option.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex justify-center items-center py-20">
					<LoadingSpinner size="lg" />
				</div>
			)}

			{/* Empty State */}
			{!isLoading && (!filteredNotifications || filteredNotifications.length === 0) && (
				<div className="text-center py-20 px-4">
					<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center">
						<HiOutlineBell className="text-violet-400" size={36} />
					</div>
					<h2 className="text-xl font-bold text-white mb-2">
						{filter === "all" ? "No notifications yet" : `No ${filter} notifications`}
					</h2>
					<p className="text-slate-400 max-w-sm mx-auto">
						{filter === "all" 
							? "When someone interacts with you, you'll see it here" 
							: `You don't have any ${filter} notifications yet`}
					</p>
				</div>
			)}

			{/* Notifications List */}
			{!isLoading && filteredNotifications && filteredNotifications.length > 0 && (
				<div className="divide-y divide-white/5">
					{filteredNotifications.map((notification) => {
						const content = getNotificationContent(notification.type);
						
						return (
							<div
								key={notification._id}
								className="flex items-start gap-4 p-4 sm:p-5 hover:bg-white/[0.02] transition-colors group"
							>
								{/* Icon Badge */}
								<div className={`w-10 h-10 rounded-full ${content.bgColor} flex items-center justify-center flex-shrink-0 ${content.color} border ${content.borderColor}`}>
									{content.icon}
								</div>

								{/* Content */}
								<div className="flex-1 min-w-0">
									<Link
										to={`/profile/${notification.from.username}`}
										className="flex items-center gap-3"
									>
										<img
											src={getProfileImageUrl(notification.from.profileImg, notification.from.username)}
											alt={notification.from.username}
											className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-violet-500/30 transition-all"
										/>
										<div className="min-w-0 flex-1">
											<p className="text-sm text-slate-200">
												<span className="font-semibold text-white hover:text-violet-400 transition-colors">
													{notification.from.fullName || `@${notification.from.username}`}
												</span>{" "}
												<span className="text-slate-400">{content.text}</span>
											</p>
											<p className="text-xs text-slate-600 mt-0.5">
												@{notification.from.username} · {formatTimeAgo(notification.createdAt)}
											</p>
										</div>
									</Link>

									{/* Post Preview (if applicable) */}
									{notification.post && (notification.type === "like" || notification.type === "comment" || notification.type === "repost") && (
										<Link 
											to={`/post/${notification.post._id}`}
											className="mt-3 p-3 bg-slate-800/30 rounded-xl border border-white/5 block hover:bg-slate-800/50 transition-colors"
										>
											<p className="text-sm text-slate-400 line-clamp-2">
												{notification.post.text || "View post"}
											</p>
										</Link>
									)}
								</div>

								{/* Follow Back Button (for follow notifications) */}
								{notification.type === "follow" && (
									<button className="px-4 py-1.5 bg-white text-slate-900 rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors flex-shrink-0">
										Follow
									</button>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default NotificationPage;