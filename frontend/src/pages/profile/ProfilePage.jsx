import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import UserListModal from "../../components/common/UserListModal";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/profile/${username}`,
          {
            credentials: "include",
          }
        );
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
  const queryClient = useQueryClient();

  const isMyProfile = authUser._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser?.following.includes(user?._id);

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState([]);

  const handleOpenModal = async (type) => {
    setModalTitle(type === "followers" ? "Followers" : "Following");
    setShowModal(true);
    try {
      const res = await fetch(`/api/users/${user._id}/${type}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setModalUsers(data);
    } catch (err) {
      console.error("Failed to fetch user list", err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalUsers([]);
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
      <div className="flex-[4_4_0]  border-r border-gray-700 min-h-screen ">
        {/* HEADER */}
        {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
        {!isLoading && !isRefetching && !user && (
          <p className="text-center text-lg mt-4">User not found</p>
        )}
        <div className="flex flex-col">
          {!isLoading && !isRefetching && user && (
            <>
              <div className="flex gap-10 px-4 py-2 items-center">
                <Link to="/">
                  <FaArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <p className="font-bold text-lg">{user?.fullName}</p>
                  <span className="text-sm text-slate-500">
                    {user?.posts?.length || 0} posts
                  </span>
                </div>
              </div>
              {/* START: Add this new header block */}
              <div className="relative flex flex-col">
                {/* Cover Image */}
                <div className="relative h-52 w-full group">
                  <img
                    src={coverImg || user?.coverImg || "/cover.svg"}
                    className="h-full w-full object-cover"
                    alt="Cover Image"
                  />
                  {isMyProfile && (
                    <div
                      className="absolute top-2 right-2 p-2 bg-gray-900 bg-opacity-60 rounded-full cursor-pointer group-hover:bg-opacity-80 transition-all duration-300"
                      onClick={() => coverImgRef.current.click()}
                    >
                      <MdEdit className="text-white text-lg" />
                    </div>
                  )}
                </div>

                {/* Edit/Follow Buttons */}
                <div className="flex justify-end px-4 pt-4">
                  {isMyProfile && <EditProfileModal authUser={authUser} />}
                  {!isMyProfile && (
                    <button
                      className="font-semibold py-2 px-4 rounded-full border border-gray-600 hover:bg-white/10 transition-colors duration-200"
                      onClick={() => follow(user?._id)}
                    >
                      {isPending && "Loading..."}
                      {!isPending && amIFollowing && "Unfollow"}
                      {!isPending && !amIFollowing && "Follow"}
                    </button>
                  )}
                  {(coverImg || profileImg) && (
                    <button
                      className="font-semibold py-2 px-4 rounded-full bg-blue-500 hover:bg-white/10 text-white transition-colors duration-200 ml-2"
                      onClick={async () => {
                        await updateProfile({ coverImg, profileImg });
                        setProfileImg(null);
                        setCoverImg(null);
                        await Promise.all([
                          queryClient.invalidateQueries({
                            queryKey: ["userProfile"],
                          }),
                          queryClient.invalidateQueries({
                            queryKey: ["authUser"],
                          }),
                        ]);
                      }}
                    >
                      {isUpdatingProfile ? "Updating..." : "Update"}
                    </button>
                  )}
                </div>

                {/* Profile Avatar & User Details */}
                <div className="flex flex-col gap-4 px-4 pt-2 pb-4 border-b border-gray-700">
                  {/* Avatar */}
                  <div className="relative w-32 h-32 -mt-24 self-start">
                    <div className="relative w-full h-full rounded-full border-4 border-black group/avatar">
                      <img
                        src={
                          profileImg ||
                          user?.profileImg ||
                          "/avatar-placeholder.png"
                        }
                        className="w-full h-full object-cover rounded-full"
                        alt="Profile Image"
                      />
                      {isMyProfile && (
                        <div
                          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300"
                          onClick={() => profileImgRef.current.click()}
                        >
                          <MdEdit className="text-white text-3xl" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Text Info with improved typography */}
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-white">
                      {user?.fullName}
                    </h2>
                    <span className="text-md text-gray-500">
                      @{user?.username}
                    </span>
                    <p className="mt-2 text-md text-gray-200">{user?.bio}</p>
                  </div>

                  {/* Link & Join Date with improved typography */}
                  <div className="flex gap-6 flex-wrap text-md text-gray-500">
                    {user?.link && (
                      <a
                        href={user.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 hover:underline text-blue-400"
                      >
                        <FaLink size={16} /> {user.link}
                      </a>
                    )}
                    <div className="flex items-center gap-2">
                      <IoCalendarOutline size={16} /> Joined {memberSinceDate}
                    </div>
                  </div>

                  {/* Follower/Following Count with improved typography */}
                  <div className="flex gap-6 text-md">
                    <div className="cursor-pointer hover:underline">
                      <span className="font-bold text-white">
                        {user?.following.length}
                      </span>{" "}
                      <span className="text-gray-500">Following</span>
                    </div>
                    <div className="cursor-pointer hover:underline">
                      <span className="font-bold text-white">
                        {user?.followers.length}
                      </span>{" "}
                      <span className="text-gray-500">Followers</span>
                    </div>
                  </div>
                </div>
              </div>
              <input
                type="file"
                hidden
                ref={coverImgRef}
                onChange={(e) => handleImgChange(e, "coverImg")}
              />
              <input
                type="file"
                hidden
                ref={profileImgRef}
                onChange={(e) => handleImgChange(e, "profileImg")}
              />
              {/* END: New header block */}
              {/* Feed Tabs */}
              <div className="flex justify-around border-b border-gray-700">
                {["posts", "likes"].map((type) => (
                  <div
                    key={type}
                    className="flex-1 text-center"
                    onClick={() => setFeedType(type)}
                  >
                    <div
                      className={`py-3 font-semibold text-lg cursor-pointer transition-all duration-300
                    ${
                      feedType === type
                        ? "text-white border-b-2 border-blue-500"
                        : "text-gray-500 hover:text-white"
                    }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <Posts
            posts={
              feedType === "posts" ? user?.posts || [] : user?.likedPosts || []
            }
            isLoading={isLoading}
          />
        </div>

        <UserListModal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={modalTitle}
          users={modalUsers}
        />
      </div>
    </>
  );
};
export default ProfilePage;
