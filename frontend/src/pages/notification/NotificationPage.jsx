import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

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
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<a onClick={deleteNotifications}>Delete all notifications</a>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				{notifications?.map((notification) => (
					<div className='border-b border-gray-700' key={notification._id}>
						<div className='flex items-center gap-3 p-4'>
						{/* Notification icon */}
						{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary flex-shrink-0' />}
						{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500 flex-shrink-0' />}

						{/* Profile picture and text */}
						<Link to={`/profile/${notification.from.username}`} className='flex items-center gap-2 no-underline text-inherit'>
							<div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0'>
							<img
								src={notification.from.profileImg || "/avatar-placeholder.png"}
								alt="Profile"
								className='w-full h-full object-cover block'
							/>
							</div>
							<div className='font-semibold'>
							<span>@{notification.from.username}</span>{" "}
							<span className='font-normal'>
								{notification.type === "follow" ? "followed you" : "liked your post"}
							</span>
							</div>
						</Link>
						</div>

					</div>
				))}
			</div>
		</>
	);
};
export default NotificationPage;