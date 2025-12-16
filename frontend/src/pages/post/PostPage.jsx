import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaRegHeart, FaHeart, FaRegBookmark, FaBookmark, FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { HiOutlineShare, HiOutlineTrash, HiOutlineLink, HiOutlineClipboard } from "react-icons/hi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import { getProfileImageUrl } from "../../utils/avatar";

const PostPage = () => {
	const { postId } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [comment, setComment] = useState("");
	const [showShareMenu, setShowShareMenu] = useState(false);

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const { data: post, isLoading, isError } = useQuery({
		queryKey: ["post", postId],
		queryFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}`, {
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to fetch post");
			return data;
		},
		enabled: !!postId,
	});

	const { mutate: likePost, isPending: isLiking } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/like/${postId}`, {
				method: "POST",
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: (updatedLikes) => {
			queryClient.setQueryData(["post", postId], (oldData) => ({
				...oldData,
				likes: updatedLikes,
			}));
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (error) => toast.error(error.message),
	});

	const { mutate: bookmarkPost, isPending: isBookmarking } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/bookmark/${postId}`, {
				method: "POST",
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(["post", postId], (oldData) => ({
				...oldData,
				bookmarks: data.bookmarks,
			}));
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["bookmarkedPosts"] });
			toast.success(data.message);
		},
		onError: (error) => toast.error(error.message),
	});

	const { mutate: repostPost, isPending: isReposting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/repost/${postId}`, {
				method: "POST",
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(["post", postId], (oldData) => ({
				...oldData,
				reposts: data.reposts,
			}));
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast.success(data.message);
		},
		onError: (error) => toast.error(error.message),
	});

	const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/comment/${postId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ text: comment }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: (updatedComments) => {
			queryClient.setQueryData(["post", postId], (oldData) => ({
				...oldData,
				comments: updatedComments,
			}));
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			setComment("");
			toast.success("Comment posted!");
		},
		onError: (error) => toast.error(error.message),
	});

	const { mutate: deletePost, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}`, {
				method: "DELETE",
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: () => {
			toast.success("Post deleted");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			navigate("/");
		},
		onError: (error) => toast.error(error.message),
	});

	const handleSubmitComment = (e) => {
		e.preventDefault();
		if (comment.trim()) {
			commentPost();
		}
	};

	const handleCopyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		toast.success("Link copied!");
		setShowShareMenu(false);
	};

	const handleCopyText = () => {
		if (post?.text) {
			navigator.clipboard.writeText(post.text);
			toast.success("Text copied!");
		}
		setShowShareMenu(false);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (isError || !post) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4">
				<p className="text-slate-400">Post not found</p>
				<button
					onClick={() => navigate("/")}
					className="px-4 py-2 bg-violet-600 rounded-xl text-white hover:bg-violet-500 transition-colors"
				>
					Go Home
				</button>
			</div>
		);
	}

	const isLiked = post.likes?.includes(authUser?._id);
	const isBookmarked = post.bookmarks?.includes(authUser?._id);
	const isReposted = post.reposts?.includes(authUser?._id);
	const isMyPost = authUser?._id === post.user?._id;

	return (
		<div className="min-h-screen">
			{/* Header */}
			<div className="sticky top-0 z-20 bg-[#0B0C15]/80 backdrop-blur-xl border-b border-white/5">
				<div className="flex items-center gap-4 px-4 py-4">
					<button
						onClick={() => navigate(-1)}
						className="p-2 hover:bg-white/10 rounded-full transition-colors"
					>
						<FaArrowLeft className="w-4 h-4 text-white" />
					</button>
					<h1 className="text-xl font-bold text-white">Post</h1>
				</div>
			</div>

			{/* Main Post */}
			<div className="border-b border-white/5">
				{/* Author Info */}
				<div className="p-4 pb-3">
					<div className="flex items-start gap-3">
						<Link to={`/profile/${post.user?.username}`}>
							<img
								src={getProfileImageUrl(post.user?.profileImg, post.user?.username)}
								alt={post.user?.fullName}
								className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 hover:ring-violet-500/50 transition-all"
							/>
						</Link>
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<div>
									<Link
										to={`/profile/${post.user?.username}`}
										className="font-bold text-white hover:text-violet-400 transition-colors"
									>
										{post.user?.fullName}
									</Link>
									<p className="text-slate-500 text-sm">@{post.user?.username}</p>
								</div>
								{isMyPost && (
									<button
										onClick={() => deletePost()}
										disabled={isDeleting}
										className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
									>
										{isDeleting ? <LoadingSpinner size="sm" /> : <HiOutlineTrash size={18} />}
									</button>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Post Content */}
				<div className="px-4 pb-4">
					{post.text && (
						<p className="text-white text-lg leading-relaxed whitespace-pre-wrap mb-4">
							{post.text}
						</p>
					)}
					{post.img && (
						<div className="rounded-2xl overflow-hidden border border-white/10">
							<img
								src={post.img}
								alt="Post content"
								className="w-full object-cover max-h-[500px]"
							/>
						</div>
					)}
				</div>

				{/* Timestamp */}
				<div className="px-4 py-3 border-t border-white/5">
					<p className="text-slate-500 text-sm">{formatPostDate(post.createdAt)}</p>
				</div>

				{/* Stats */}
				<div className="px-4 py-3 border-t border-white/5 flex gap-6">
					<div className="flex items-center gap-1.5">
						<span className="font-bold text-white">{post.comments?.length || 0}</span>
						<span className="text-slate-500">Comments</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="font-bold text-white">{post.reposts?.length || 0}</span>
						<span className="text-slate-500">Reposts</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="font-bold text-white">{post.likes?.length || 0}</span>
						<span className="text-slate-500">Likes</span>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="px-4 py-3 border-t border-white/5 flex justify-around">
					<button
						className="flex items-center gap-2 p-3 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all"
					>
						<FaRegComment size={20} />
					</button>
					<button
						onClick={() => repostPost()}
						disabled={isReposting}
						className={`flex items-center gap-2 p-3 rounded-full transition-all ${
							isReposted
								? "text-green-500 bg-green-500/10"
								: "text-slate-500 hover:text-green-400 hover:bg-green-500/10"
						}`}
					>
						{isReposting ? <LoadingSpinner size="sm" /> : <BiRepost size={24} />}
					</button>
					<button
						onClick={() => likePost()}
						disabled={isLiking}
						className={`flex items-center gap-2 p-3 rounded-full transition-all ${
							isLiked
								? "text-pink-500 bg-pink-500/10"
								: "text-slate-500 hover:text-pink-500 hover:bg-pink-500/10"
						}`}
					>
						{isLiking ? (
							<LoadingSpinner size="sm" />
						) : isLiked ? (
							<FaHeart size={20} />
						) : (
							<FaRegHeart size={20} />
						)}
					</button>
					<button
						onClick={() => bookmarkPost()}
						disabled={isBookmarking}
						className={`flex items-center gap-2 p-3 rounded-full transition-all ${
							isBookmarked
								? "text-yellow-500 bg-yellow-500/10"
								: "text-slate-500 hover:text-yellow-400 hover:bg-yellow-500/10"
						}`}
					>
						{isBookmarking ? (
							<LoadingSpinner size="sm" />
						) : isBookmarked ? (
							<FaBookmark size={18} />
						) : (
							<FaRegBookmark size={18} />
						)}
					</button>
					<div className="relative">
						<button
							onClick={() => setShowShareMenu(!showShareMenu)}
							className="flex items-center gap-2 p-3 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-full transition-all"
						>
							<HiOutlineShare size={20} />
						</button>
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
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Comment Input */}
			<div className="p-4 border-b border-white/5">
				<form onSubmit={handleSubmitComment} className="flex gap-3">
					<img
						src={getProfileImageUrl(authUser?.profileImg, authUser?.username)}
						alt="Your profile"
						className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
					/>
					<div className="flex-1">
						<textarea
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							placeholder="Post your reply..."
							className="w-full bg-transparent text-white placeholder-slate-500 resize-none outline-none text-lg py-2"
							rows={2}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey && comment.trim()) {
									e.preventDefault();
									handleSubmitComment(e);
								}
							}}
						/>
						<div className="flex justify-end mt-2">
							<button
								type="submit"
								disabled={!comment.trim() || isCommenting}
								className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
									!comment.trim() || isCommenting
										? "bg-violet-600/50 text-white/50 cursor-not-allowed"
										: "bg-violet-600 text-white hover:bg-violet-500"
								}`}
							>
								{isCommenting ? <LoadingSpinner size="sm" /> : "Reply"}
							</button>
						</div>
					</div>
				</form>
			</div>

			{/* Comments Section */}
			<div className="divide-y divide-white/5">
				{post.comments?.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
							<FaRegComment className="text-slate-600" size={32} />
						</div>
						<p className="text-slate-400 font-medium">No comments yet</p>
						<p className="text-slate-600 text-sm mt-1">Be the first to reply!</p>
					</div>
				) : (
					post.comments?.map((cmt) => (
						<div key={cmt._id} className="p-4 hover:bg-white/[0.02] transition-colors">
							<div className="flex gap-3">
								<Link to={`/profile/${cmt.user?.username}`} className="flex-shrink-0">
									<img
										src={getProfileImageUrl(cmt.user?.profileImg, cmt.user?.username)}
										alt={cmt.user?.fullName}
										className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 hover:ring-violet-500/30 transition-all"
									/>
								</Link>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<Link
											to={`/profile/${cmt.user?.username}`}
											className="font-bold text-white hover:text-violet-400 transition-colors"
										>
											{cmt.user?.fullName}
										</Link>
										<span className="text-slate-500 text-sm">@{cmt.user?.username}</span>
										{cmt.createdAt && (
											<span className="text-slate-600 text-sm">· {formatPostDate(cmt.createdAt)}</span>
										)}
									</div>
									<p className="text-slate-200 mt-1 leading-relaxed break-words">
										{cmt.text}
									</p>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default PostPage;
