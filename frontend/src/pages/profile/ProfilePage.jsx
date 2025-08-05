import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { POSTS } from "../../utils/db/dummy";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";

import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";

const ProfilePage = () => {
	const [coverImg, setCoverImg] = useState(null);
	const [profileImg, setProfileImg] = useState(null);
	const [feedType, setFeedType] = useState("posts");
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
			try {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${username}`, {
          		credentials: "include",
        		});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

	const isMyProfile = authUser._id === user?._id;
	const memberSinceDate = formatMemberSinceDate(user?.createdAt);
	const amIFollowing = authUser?.following.includes(user?._id);

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
			<div className='flex-[4_4_0]  border-r border-gray-700 min-h-screen '>
				{/* HEADER */}
				{(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
				{!isLoading && !isRefetching && !user && <p className='text-center text-lg mt-4'>User not found</p>}
				<div className='flex flex-col'>
					{!isLoading && !isRefetching && user && (
						<>
							<div className='flex gap-10 px-4 py-2 items-center'>
								<Link to='/'>
									<FaArrowLeft className='w-4 h-4' />
								</Link>
								<div className='flex flex-col'>
									<p className='font-bold text-lg'>{user?.fullName}</p>
									<span className='text-sm text-slate-500'>{POSTS?.length} posts</span>
								</div>
							</div>
							{/* COVER IMG */}
							<div className='relative'>
							{/* Cover Image */}
							<div className='h-56 w-full relative group'>
								<img
									src={coverImg || user?.coverImg || "/cover.svg"}
									className='h-full w-full object-cover rounded-b-xl shadow-sm'
									alt='cover'
								/>
								{isMyProfile && (
									<div
									className='absolute bottom-2 right-2 bg-primary p-1 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300'
									onClick={() => coverImgRef.current.click()}
									>
									<MdEdit className='text-white text-lg' />
									</div>
								)}

								<input
									type='file'
									hidden
									accept='image/*'
									ref={coverImgRef}
									onChange={(e) => handleImgChange(e, "coverImg")}
								/>
								<input
									type='file'
									hidden
									accept='image/*'
									ref={profileImgRef}
									onChange={(e) => handleImgChange(e, "profileImg")}
								/>
								</div>
							{/* Profile Avatar */}
							<div className='absolute -bottom-14 left-6 z-10'>
								<div className='relative w-[110px] h-[110px] rounded-full border-[4px] border-black overflow-hidden group/avatar shadow-lg'>
									<img
									src={profileImg || user?.profileImg || "/avatar-placeholder.png"}
									alt="Profile"
									className='w-full h-full object-cover'
									/>
									{isMyProfile && (
									<div
										className='absolute bottom-2 right-2 bg-primary p-1 rounded-full cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300'
										onClick={() => profileImgRef.current.click()}
										title="Edit Profile Picture"
									>
										<MdEdit className='text-white text-lg' />
									</div>
									)}
								</div>
								</div>

							</div>

							<div className='flex justify-end '>
								{isMyProfile && <EditProfileModal authUser={authUser} />}
								{!isMyProfile && (
									<button
										className='btn btn-outline rounded-full btn-sm'
										onClick={() => follow(user?._id)}
									>
										{isPending && "Loading..."}
										{!isPending && amIFollowing && "Unfollow"}
										{!isPending && !amIFollowing && "Follow"}
									</button>
								)}
								{(coverImg || profileImg) && (
									<button
										className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
										onClick={async () => {
											await updateProfile({ coverImg, profileImg });
											setProfileImg(null);
											setCoverImg(null);
										}}
									>
										{isUpdatingProfile ? "Updating..." : "Update"}
									</button>
								)}
							</div>

							<div className='mt-20 px-6 pb-4 border-b border-gray-700'>
							<div className='flex flex-col gap-1'>
								<h2 className='font-bold text-xl'>{user?.fullName}</h2>
								<span className='text-sm text-gray-400'>@{user?.username}</span>
								<p className='mt-2 text-sm text-white'>{user?.bio}</p>

								<div className='flex gap-4 mt-2 flex-wrap text-sm text-gray-400'>
								{user?.link && (
									<a href={user?.link} target='_blank' rel='noreferrer' className='flex items-center gap-1 hover:underline text-blue-400'>
									<FaLink /> {user?.link}
									</a>
								)}
								<span className='flex items-center gap-1'>
									<IoCalendarOutline /> Joined {memberSinceDate}
								</span>
								</div>

								<div className='flex gap-5 mt-2 text-sm'>
								<span>
									<span className='font-semibold'>{user?.following.length}</span> <span className='text-gray-400'>Following</span>
								</span>
								<span>
									<span className='font-semibold'>{user?.followers.length}</span> <span className='text-gray-400'>Followers</span>
								</span>
								</div>
							</div>
							</div>
							<div className='flex w-full border-b border-gray-800 text-sm font-medium mt-4 px-6'>
								{["posts", "likes"].map((type) => (
									<div
									key={type}
									onClick={() => setFeedType(type)}
									className={`flex-1 text-center p-3 cursor-pointer relative transition-all ${
										feedType === type ? "text-primary font-bold" : "text-gray-500 hover:text-white"
									}`}
									>
									{type.charAt(0).toUpperCase() + type.slice(1)}
									{feedType === type && (
										<div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-full' />
									)}
									</div>
								))}
								</div>

						</>
					)}

					<Posts feedType={feedType} username={username} userId={user?._id} />
				</div>
			</div>
		</>
	);
};
export default ProfilePage;