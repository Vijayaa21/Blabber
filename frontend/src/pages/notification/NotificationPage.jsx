import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getProfileImageUrl } from "../../utils/avatar";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser, FaComment } from "react-icons/fa";
import { FaHeart, FaRetweet } from "react-icons/fa6";

const getNotificationText = (type) => {
	switch (type) {
		case "follow":
			return "followed you";
		case "like":
			return "liked your post";
		case "repost":
			return "reposted your post";
		case "comment":
			return "commented on your post";
		default:
			return "interacted with you";
	}
};

const getNotificationIcon = (type) => {
	switch (type) {
		case "follow":
			return <FaUser className='w-5 h-5 text-violet-500' />;
		case "like":
			return <FaHeart className='w-5 h-5 text-pink-500' />;
		case "repost":
			return <FaRetweet className='w-5 h-5 text-green-500' />;
		case "comment":
			return <FaComment className='w-5 h-5 text-blue-500' />;
		default:
			return <FaUser className='w-5 h-5 text-slate-400' />;
	}
};

const NotificationPage = () => {
	const queryClient = useQueryClient();
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          		credentials: "include",
        		});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
					method: "DELETE",
					credentials: "include",
				});
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<div className='min-h-screen'>
			{/* Header */}
			<div className='sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5'>
				<div className='flex justify-between items-center px-6 py-4'>
					<h1 className='text-xl font-bold text-white'>Notifications</h1>
					<div className='dropdown dropdown-end'>
						<div tabIndex={0} role='button' className='p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer'>
							<IoSettingsOutline className='w-5 h-5 text-slate-400' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow-xl bg-slate-800 border border-white/10 rounded-xl w-52 mt-2'
						>
							<li>
								<a 
									onClick={deleteNotifications}
									className='text-red-400 hover:bg-red-500/10 rounded-lg'
								>
									Delete all notifications
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className='flex justify-center items-center py-20'>
					<LoadingSpinner size='lg' />
				</div>
			)}

			{/* Empty State */}
			{!isLoading && notifications?.length === 0 && (
				<div className='text-center py-20'>
					<div className='text-5xl mb-4'>🔔</div>
					<p className='text-slate-400 text-lg'>No notifications yet</p>
					<p className='text-slate-600 text-sm mt-2'>When someone interacts with you, you'll see it here</p>
				</div>
			)}

			{/* Notifications List */}
			<div className='divide-y divide-white/5'>
				{notifications?.map((notification) => (
					<div 
						key={notification._id}
						className='flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors'
					>
						{/* Notification Icon */}
						<div className='w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center flex-shrink-0'>
							{getNotificationIcon(notification.type)}
						</div>

						{/* Profile Picture & Text */}
						<Link 
							to={`/profile/${notification.from.username}`} 
							className='flex items-center gap-3 flex-1 min-w-0'
						>
							<img
								src={getProfileImageUrl(notification.from.profileImg, notification.from.username)}
								alt="Profile"
								className='w-10 h-10 rounded-full object-cover ring-2 ring-white/5'
							/>
							<div className='min-w-0'>
								<p className='text-slate-200'>
									<span className='font-semibold'>@{notification.from.username}</span>{" "}
									<span className='text-slate-400'>{getNotificationText(notification.type)}</span>
								</p>
							</div>
						</Link>
					</div>
				))}
			</div>
		</div>
	);
};
export default NotificationPage;