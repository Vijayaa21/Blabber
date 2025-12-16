import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import UserListModal from "../../components/common/UserListModal";

import { FaArrowLeft, FaLink, FaCalendarAlt } from "react-icons/fa";
import { MdEdit, MdVerified } from "react-icons/md";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { formatMemberSinceDate } from "../../utils/date";

import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import { getProfileImageUrl } from "../../utils/avatar";

const ProfilePage = () => {
	const [coverImg, setCoverImg] = useState(null);
	const [profileImg, setProfileImg] = useState(null);
	const [feedType, setFeedType] = useState("posts");
	const [showFollowers, setShowFollowers] = useState(false);
	const [showFollowing, setShowFollowing] = useState(false);
	const [followers, setFollowers] = useState([]);
	const [following, setFollowing] = useState([]);
	const [loadingFollowers, setLoadingFollowers] = useState(false);
	const [loadingFollowing, setLoadingFollowing] = useState(false);
	
	const coverImgRef = useRef(null);
	const profileImgRef = useRef(null);

	const { username } = useParams();
	const { follow, isPending } = useFollow();
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const {
		data: user,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["userProfile"],
		queryFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${username}`, {
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
	});

	const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

	const isMyProfile = authUser?._id === user?._id;
	const memberSinceDate = formatMemberSinceDate(user?.createdAt);
	const amIFollowing = authUser?.following?.includes(user?._id);

	const fetchFollowers = async () => {
		if (!user?._id) return;
		setLoadingFollowers(true);
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user._id}/followers`, {
				credentials: "include",
			});
			const data = await res.json();
			if (res.ok) setFollowers(data);
		} catch (error) {
			console.error("Error fetching followers:", error);
		} finally {
			setLoadingFollowers(false);
		}
	};

	const fetchFollowing = async () => {
		if (!user?._id) return;
		setLoadingFollowing(true);
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user._id}/following`, {
				credentials: "include",
			});
			const data = await res.json();
			if (res.ok) setFollowing(data);
		} catch (error) {
			console.error("Error fetching following:", error);
		} finally {
			setLoadingFollowing(false);
		}
	};

	const handleShowFollowers = () => {
		setShowFollowers(true);
		fetchFollowers();
	};

	const handleShowFollowing = () => {
		setShowFollowing(true);
		fetchFollowing();
	};

	const handleImgChange = (e, state) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				state === "coverImg" && setCoverImg(reader.result);
				state === "profileImg" && setProfileImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	useEffect(() => {
		refetch();
	}, [username, refetch]);

	return (
		<>
			<div className="min-h-screen">
				{/* Loading State */}
				{(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
				
				{/* User Not Found */}
				{!isLoading && !isRefetching && !user && (
					<div className="flex flex-col items-center justify-center py-20">
						<div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
							<span className="text-4xl">🔍</span>
						</div>
						<h2 className="text-xl font-bold text-white mb-2">User not found</h2>
						<p className="text-slate-400">The user you're looking for doesn't exist</p>
						<Link to="/" className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors">
							Go Home
						</Link>
					</div>
				)}

				{/* Profile Content */}
				{!isLoading && !isRefetching && user && (
					<div className="flex flex-col">
						{/* Back Header */}
						<div className="sticky top-0 z-20 bg-[#0B0C15]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
							<div className="flex items-center gap-6">
								<Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
									<FaArrowLeft className="w-4 h-4 text-white" />
								</Link>
								<div>
									<div className="flex items-center gap-2">
										<h1 className="font-bold text-lg text-white">{user?.fullName}</h1>
										{user?.isVerified && <MdVerified className="text-violet-500" />}
									</div>
									<p className="text-xs text-slate-500">{user?.followers?.length || 0} followers</p>
								</div>
							</div>
						</div>

						{/* Cover Image */}
						<div className="relative group">
							<div className="h-48 sm:h-56 w-full overflow-hidden">
								<img
									src={coverImg || user?.coverImg || "/cover.png"}
									className="h-full w-full object-cover"
									alt="cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-[#0B0C15] via-transparent to-transparent"></div>
							</div>
							{isMyProfile && (
								<button
									className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-800 border border-white/10"
									onClick={() => coverImgRef.current.click()}
								>
									<MdEdit className="text-white text-lg" />
								</button>
							)}
							<input type="file" hidden accept="image/*" ref={coverImgRef} onChange={(e) => handleImgChange(e, "coverImg")} />
							<input type="file" hidden accept="image/*" ref={profileImgRef} onChange={(e) => handleImgChange(e, "profileImg")} />
						</div>

						{/* Profile Info Section */}
						<div className="px-4 sm:px-6 pb-4">
							{/* Avatar & Actions Row */}
							<div className="flex justify-between items-end -mt-16 mb-4">
								<div className="relative group/avatar">
									<div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#0B0C15] overflow-hidden bg-slate-800 shadow-xl">
										<img
											src={profileImg || getProfileImageUrl(user?.profileImg, user?.username)}
											alt="Profile"
											className="w-full h-full object-cover"
										/>
									</div>
									{isMyProfile && (
										<button
											className="absolute bottom-1 right-1 bg-violet-600 p-2 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-all hover:bg-violet-700 shadow-lg"
											onClick={() => profileImgRef.current.click()}
										>
											<MdEdit className="text-white text-sm" />
										</button>
									)}
								</div>

								<div className="flex gap-2">
									{isMyProfile && <EditProfileModal authUser={authUser} />}
									{!isMyProfile && (
										<button
											onClick={() => follow(user?._id)}
											className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
												amIFollowing
													? 'bg-transparent border border-slate-600 text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
													: 'bg-white text-slate-900 hover:bg-slate-200'
											}`}
										>
											{isPending ? "..." : amIFollowing ? "Following" : "Follow"}
										</button>
									)}
									{(coverImg || profileImg) && (
										<button
											onClick={async () => {
												await updateProfile({ coverImg, profileImg });
												setProfileImg(null);
												setCoverImg(null);
											}}
											className="px-6 py-2 bg-violet-600 text-white rounded-full font-semibold text-sm hover:bg-violet-700 transition-colors"
										>
											{isUpdatingProfile ? "Saving..." : "Save"}
										</button>
									)}
								</div>
							</div>

							{/* User Details */}
							<div className="space-y-3">
								<div>
									<div className="flex items-center gap-2">
										<h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
										{user?.isVerified && <MdVerified className="text-violet-500" size={20} />}
									</div>
									<p className="text-slate-500">@{user?.username}</p>
								</div>

								{user?.bio && (
									<p className="text-slate-300 leading-relaxed">{user?.bio}</p>
								)}

								{/* Meta Info */}
								<div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
									{user?.location && (
										<span className="flex items-center gap-1.5">
											<HiOutlineLocationMarker className="text-slate-600" />
											{user?.location}
										</span>
									)}
									{user?.link && (
										<a
											href={user?.link}
											target="_blank"
											rel="noreferrer"
											className="flex items-center gap-1.5 text-violet-400 hover:underline"
										>
											<FaLink className="text-slate-600" size={12} />
											{user?.link.replace(/^https?:\/\//, '').slice(0, 25)}
										</a>
									)}
									<span className="flex items-center gap-1.5">
										<FaCalendarAlt className="text-slate-600" size={12} />
										Joined {memberSinceDate}
									</span>
								</div>

								{/* Followers/Following Stats */}
								<div className="flex gap-5 pt-2">
									<button 
										onClick={handleShowFollowing}
										className="group flex items-center gap-1.5 hover:underline"
									>
										<span className="font-bold text-white">{user?.following?.length || 0}</span>
										<span className="text-slate-500 group-hover:text-slate-400">Following</span>
									</button>
									<button 
										onClick={handleShowFollowers}
										className="group flex items-center gap-1.5 hover:underline"
									>
										<span className="font-bold text-white">{user?.followers?.length || 0}</span>
										<span className="text-slate-500 group-hover:text-slate-400">Followers</span>
									</button>
								</div>
							</div>
						</div>

						{/* Tabs */}
						<div className="border-b border-white/5">
							<div className="flex">
								{["posts", "likes"].map((type) => (
									<button
										key={type}
										onClick={() => setFeedType(type)}
										className={`flex-1 py-4 text-sm font-medium transition-all relative ${
											feedType === type 
												? "text-white" 
												: "text-slate-500 hover:text-slate-300 hover:bg-white/5"
										}`}
									>
										{type.charAt(0).toUpperCase() + type.slice(1)}
										{feedType === type && (
											<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-violet-500 rounded-full" />
										)}
									</button>
								))}
							</div>
						</div>

						{/* Posts */}
						<div className="p-4">
							<Posts feedType={feedType} username={username} userId={user?._id} />
						</div>
					</div>
				)}
			</div>

			{/* Followers Modal */}
			<UserListModal
				isOpen={showFollowers}
				onClose={() => setShowFollowers(false)}
				title="Followers"
				users={followers}
				isLoading={loadingFollowers}
			/>

			{/* Following Modal */}
			<UserListModal
				isOpen={showFollowing}
				onClose={() => setShowFollowing(false)}
				title="Following"
				users={following}
				isLoading={loadingFollowing}
			/>
		</>
	);
};

export default ProfilePage;