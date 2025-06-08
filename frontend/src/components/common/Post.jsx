
import { BiRepost } from "react-icons/bi";
import { FaRegBookmark } from "react-icons/fa6";
import { GiTalk, GiBookmark, GiTrashCan } from "react-icons/gi";
import { MdFavorite } from "react-icons/md";
import { IoRepeatSharp } from "react-icons/io5";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";


const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const [isCommenting, setIsCommenting] = useState(false);
	const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
	const queryClient = useQueryClient();
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const postOwner = post.user;
	const isLiked = post.likes.includes(authUser._id);
	const isMyPost = post.user && authUser._id === post.user._id;
	const formattedDate = formatPostDate(post.createdAt);

	const { mutate: deletePost, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}`, {
					method: "DELETE",
					credentials: "include"
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
		onSuccess: () => {
			toast.success("Post deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	const { mutate: likePost, isPending: isLiking } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/like/${post._id}`, {
					method: "POST",
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
		onSuccess: (updatedLikes) => {
			queryClient.setQueryData(["posts"], (oldData) => {
				return oldData.map((p) => {
					if (p._id === post._id) {
						return { ...p, likes: updatedLikes };
					}
					return p;
				});
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	// COMMENT on post with optimistic update
	const { mutate: postComment } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/comment/${post._id}`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: comment }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onMutate: async () => {
			setIsCommenting(true);
			await queryClient.cancelQueries({ queryKey: ["posts"] });

			const previousPosts = queryClient.getQueryData(["posts"]);

			queryClient.setQueryData(["posts"], (oldData) => {
				if (!oldData || !Array.isArray(oldData)) return oldData;
				return oldData.map((p) => {
					if (p._id === post._id) {
						return {
							...p,
							comments: [
								...p.comments,
								{
									_id: `temp-${Date.now()}`,
									text: comment,
									user: authUser,
								},
							],
						};
					}
					return p;
				});
			});

			return { previousPosts };
		},
		onError: (err, variables, context) => {
			toast.error(err.message);
			if (context?.previousPosts) {
				queryClient.setQueryData(["posts"], context.previousPosts);
			}
		},
		onSettled: () => {
			setIsCommenting(false);
			setComment("");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	const handleDeletePost = () => deletePost();

	const handlePostComment = (e) => {
		e.preventDefault();
		if (comment.trim().length === 0) return;
		postComment();
	};

	const handleLikePost = () => {
		if (isLiking) return;
		likePost();
	};

	// Close dialog on Escape key
	useEffect(() => {
		const onEsc = (e) => {
			if (e.key === "Escape") setIsCommentDialogOpen(false);
		};
		window.addEventListener("keydown", onEsc);
		return () => window.removeEventListener("keydown", onEsc);
	}, []);

	return (
		<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
			<div className="avatar flex-shrink-0">
				<Link to={`/profile/${postOwner.username}`} className="block w-8 h-8 rounded-full overflow-hidden border border-gray-600 shadow-sm">
					<img
						src={postOwner.profileImg || "/avatar-placeholder.png"}
						alt={`${postOwner.fullName} profile`}
						className="w-full h-full object-cover"
					/>
				</Link>
			</div>

			<div className='flex flex-col flex-1'>
				<div className='flex gap-2 items-center'>
					<Link to={`/profile/${postOwner.username}`} className='font-bold'>
						{postOwner.fullName}
					</Link>
					<span className='text-gray-700 flex gap-1 text-sm'>
						<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
						<span>·</span>
						<span>{formattedDate}</span>
					</span>
					{isMyPost && (
						<span className='flex justify-end flex-1'>
							{isDeleting ? (
								<LoadingSpinner size='sm' />
							) : (
								<GiTrashCan className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />
							)}
						</span>
					)}
				</div>

				<div className='flex flex-col gap-3 overflow-hidden'>
					<span>{post.text}</span>
					{post.img && (
						<img
							src={post.img}
							className='h-80 object-contain rounded-lg border border-gray-700'
							alt=''
						/>
					)}
				</div>

				<div className='flex justify-between mt-3'>
					<div className='flex gap-4 items-center w-2/3 justify-between'>
						{/* Comment Button */}
						<div
							className='flex gap-1 items-center cursor-pointer group'
							onClick={() => setIsCommentDialogOpen(true)}
						>
							<GiTalk className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
							<span className='text-sm text-slate-500 group-hover:text-sky-400'>
								{post.comments.length}
							</span>
						</div>

						{/* Custom Comment Dialog */}
						{isCommentDialogOpen && (
							<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
								<div className='bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-5 text-white'>
									<div className='flex justify-between items-center mb-4'>
										<h3 className='text-lg font-semibold'>Comments</h3>
										<button
											className='text-gray-400 hover:text-white'
											onClick={() => setIsCommentDialogOpen(false)}
											aria-label='Close comments dialog'
										>
											✕
										</button>
									</div>
									<div className='max-h-72 overflow-y-auto mb-4'>
										{post.comments.length === 0 ? (
											<p className='text-sm text-gray-400'>
												No comments yet 🤔 Be the first one 😉
											</p>
										) : (
											post.comments.map((comment) => (
												<div key={comment._id} className='flex gap-3 mb-3 items-start'>
													<img
														src={comment.user.profileImg || "/avatar-placeholder.png"}
														alt={`${comment.user.fullName} profile`}
														className='w-8 h-8 rounded-full object-cover flex-shrink-0'
													/>
													<div>
														<div className='flex gap-1 items-center'>
															<span className='font-bold'>{comment.user.fullName}</span>
															<span className='text-gray-400 text-sm'>
																@{comment.user.username}
															</span>
														</div>
														<p className='text-sm mt-1'>{comment.text}</p>
													</div>
												</div>
											))
										)}
									</div>
									<form onSubmit={handlePostComment} className='flex gap-2'>
								<textarea
									className='flex-grow p-2 rounded bg-gray-800 text-white resize-none border border-gray-700 focus:outline-none focus:border-sky-500'
									placeholder='Add a comment...'
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									rows={2}
									onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										if (comment.trim().length > 0) {
										handlePostComment(e);
										}
									}
									}}
								/>
								<button
									type='submit'
									className='btn btn-primary rounded px-4 flex items-center justify-center'
									disabled={isCommenting}
								>
									{isCommenting ? <LoadingSpinner size='sm' /> : "Post"}
								</button>
								</form>

								</div>
							</div>
						)}

						{/* Repost */}
						<div className='flex gap-1 items-center group cursor-pointer'>
							<IoRepeatSharp className='w-6 h-6 text-slate-500 group-hover:text-green-500' />
							<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
						</div>

						{/* Like */}
						<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
							{isLiking ? (
								<LoadingSpinner size='sm' />
							) : (
								<MdFavorite
									className={`w-4 h-4 ${
										isLiked ? "text-pink-500" : "text-slate-500 group-hover:text-pink-500"
									}`}
								/>
							)}
							<span
								className={`text-sm ${
									isLiked ? "text-pink-500" : "text-slate-500 group-hover:text-pink-500"
								}`}
							>
								{post.likes.length}
							</span>
						</div>
					</div>

					{/* Bookmark */}
					<div className='flex w-1/3 justify-end gap-2 items-center'>
						<GiBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Post;
