import { FaRegComment, FaRegHeart, FaHeart, FaRegBookmark, FaBookmark } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { HiOutlineShare, HiOutlineTrash, HiOutlineClipboard, HiOutlineLink } from "react-icons/hi";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import { getProfileImageUrl } from "../../utils/avatar";

const ActionIcon = ({ icon, count, color, active, groupName, onClick, disabled }) => {
  let bgClass = "";
  if (groupName === "blue") bgClass = "group-hover:bg-blue-500/10";
  else if (groupName === "green") bgClass = "group-hover:bg-green-500/10";
  else if (groupName === "pink") bgClass = "group-hover:bg-pink-500/10";
  else if (groupName === "violet") bgClass = "group-hover:bg-violet-500/10";
  else if (groupName === "yellow") bgClass = "group-hover:bg-yellow-500/10";

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`flex items-center gap-1.5 group cursor-pointer transition-colors ${
        active ? color : "text-slate-500"
      } ${!active && color} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div
        className={`p-2 rounded-full transition-all duration-200 ${bgClass} ${
          active && groupName === "pink" ? "bg-pink-500/10" : ""
        } ${active && groupName === "green" ? "bg-green-500/10" : ""} ${
          active && groupName === "yellow" ? "bg-yellow-500/10" : ""
        }`}
      >
        {icon}
      </div>
      {count !== undefined && count > 0 && (
        <span
          className={`text-xs font-medium ${
            active && groupName === "pink" ? "text-pink-500" : ""
          } ${active && groupName === "green" ? "text-green-500" : ""}`}
        >
          {count}
        </span>
      )}
    </div>
  );
};

const Post = ({ post, feedType }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  if (!authUser) {
    return null;
  }

  const postOwner = post.user;
  const isLiked = post.likes.includes(authUser._id);
  const isBookmarked = post.bookmarks?.includes(authUser._id) || false;
  const isReposted = post.reposts?.includes(authUser._id) || false;
  const isMyPost = post.user && authUser._id === post.user._id;
  const formattedDate = formatPostDate(post.createdAt);

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/posts/${post._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/posts/like/${post._id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: bookmarkPost, isPending: isBookmarking } = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/posts/bookmark/${post._id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: repostPost, isPending: isReposting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/posts/repost/${post._id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["posts", feedType] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeletePost = () => deletePost();

  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
  };

  const handleBookmarkPost = () => {
    if (isBookmarking) return;
    bookmarkPost();
  };

  const handleRepostPost = () => {
    if (isReposting) return;
    repostPost();
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    toast.success("Link copied to clipboard!");
    setShowShareMenu(false);
  };

  const handleCopyText = () => {
    if (post.text) {
      navigator.clipboard.writeText(post.text);
      toast.success("Post text copied!");
    }
    setShowShareMenu(false);
  };

  const handleNativeShare = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${postOwner.fullName}`,
          text: post.text || "Check out this post!",
          url: postUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      handleCopyLink();
    }
    setShowShareMenu(false);
  };

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setIsCommentDialogOpen(false);
        setShowShareMenu(false);
      }
    };
    const onClickOutside = (e) => {
      if (showShareMenu && !e.target.closest('.share-menu')) {
        setShowShareMenu(false);
      }
    };
    window.addEventListener("keydown", onEsc);
    window.addEventListener("click", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("click", onClickOutside);
    };
  }, [showShareMenu]);

  // Check if post has image for layout decisions
  const hasImage = !!post.img;

  return (
    <div className={`group relative bg-slate-900/40 backdrop-blur-sm border border-white/5 hover:border-violet-500/30 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/10 hover:-translate-y-1 flex flex-col ${hasImage ? 'h-full' : 'h-auto'}`}>
      {/* Card Header */}
      <div className="p-4 pb-2 flex items-center gap-3">
        <Link to={`/profile/${postOwner.username}`}>
          <img
            src={getProfileImageUrl(postOwner.profileImg, postOwner.username)}
            alt={postOwner.fullName}
            className="w-10 h-10 rounded-full bg-slate-800 object-cover ring-2 ring-transparent group-hover:ring-violet-500/20 transition-all"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <Link to={`/profile/${postOwner.username}`}>
                <h4 className="font-bold text-slate-100 text-[15px] leading-tight hover:text-violet-400 transition-colors cursor-pointer">
                  {postOwner.fullName}
                </h4>
              </Link>
              <p className="text-slate-500 text-xs">
                @{postOwner.username} · {formattedDate}
              </p>
            </div>
            {isMyPost && (
              <button
                onClick={handleDeletePost}
                className="text-slate-600 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                {isDeleting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <HiOutlineTrash size={18} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className={`px-4 ${hasImage ? 'py-2 flex-1' : 'py-1'}`}>
        {post.text && (
          <p className="text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap">
            {post.text}
          </p>
        )}
      </div>

      {/* Image */}
      {post.img && (
        <div className="mt-2 mx-3 mb-1 rounded-2xl overflow-hidden relative aspect-video group/image cursor-pointer">
          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors z-10"></div>
          <img
            src={post.img}
            alt="Post content"
            className="w-full h-full object-cover transform group-hover/image:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Footer Actions */}
      <div className={`px-4 py-3 ${hasImage ? 'mt-2' : 'mt-1'} border-t border-white/5 bg-white/[0.02]`}>
        <div className="flex justify-between items-center px-2">
          <ActionIcon
            icon={<FaRegComment size={18} />}
            count={post.comments.length}
            color="hover:text-blue-400"
            groupName="blue"
            onClick={() => navigate(`/post/${post._id}`)}
          />
          <ActionIcon
            icon={
              isReposting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <BiRepost size={22} />
              )
            }
            count={post.reposts?.length || 0}
            color={isReposted ? "text-green-500" : "hover:text-green-400"}
            active={isReposted}
            groupName="green"
            onClick={handleRepostPost}
            disabled={isReposting}
          />
          <ActionIcon
            icon={
              isLiking ? (
                <LoadingSpinner size="sm" />
              ) : isLiked ? (
                <FaHeart size={18} />
              ) : (
                <FaRegHeart size={18} />
              )
            }
            count={post.likes.length}
            color={isLiked ? "text-pink-500" : "hover:text-pink-500"}
            active={isLiked}
            groupName="pink"
            onClick={handleLikePost}
            disabled={isLiking}
          />
          <ActionIcon
            icon={
              isBookmarking ? (
                <LoadingSpinner size="sm" />
              ) : isBookmarked ? (
                <FaBookmark size={16} />
              ) : (
                <FaRegBookmark size={16} />
              )
            }
            color={isBookmarked ? "text-yellow-500" : "hover:text-yellow-400"}
            active={isBookmarked}
            groupName="yellow"
            onClick={handleBookmarkPost}
            disabled={isBookmarking}
          />
          <div className="relative share-menu">
            <ActionIcon
              icon={<HiOutlineShare size={18} />}
              color="hover:text-violet-400"
              groupName="violet"
              onClick={handleShare}
            />
            {showShareMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl py-2 min-w-[160px] z-50">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
                >
                  <HiOutlineLink size={16} />
                  Copy link
                </button>
                {post.text && (
                  <button
                    onClick={handleCopyText}
                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <HiOutlineClipboard size={16} />
                    Copy text
                  </button>
                )}
                <button
                  onClick={handleNativeShare}
                  className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
                >
                  <HiOutlineShare size={16} />
                  Share via...
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
