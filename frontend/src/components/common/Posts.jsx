import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { FaUser } from "react-icons/fa";

const Posts = ({ feedType, username, userId }) => {
	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return `${import.meta.env.VITE_API_URL}/api/posts/all`;
			case "following":
				return `${import.meta.env.VITE_API_URL}/api/posts/following`;
			case "posts":
				return `${import.meta.env.VITE_API_URL}/api/posts/user/${username}`;
			case "likes":
				return `${import.meta.env.VITE_API_URL}/api/posts/likes/${userId}`;
			default:
				return `${import.meta.env.VITE_API_URL}/api/posts/all`;
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const {
		data: posts,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			const res = await fetch(POST_ENDPOINT, {
				credentials: "include",
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Something went wrong");
			}

			return data;
		},
	});

	useEffect(() => {
		refetch();
	}, [feedType, refetch, username]);

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className="columns-1 xl:columns-2 gap-5">
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}

			{!isLoading && !isRefetching && posts?.length === 0 && (
				<div className="p-20 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-white/5">
					<FaUser size={48} className="mx-auto mb-4 opacity-50" />
					<p className="text-xl font-bold mb-2 text-white">
						{feedType === "following" ? "Your Circle is Quiet" : "No Posts Yet"}
					</p>
					<p>
						{feedType === "following"
							? "Follow more creators to see their posts here."
							: "Be the first to share something!"}
					</p>
				</div>
			)}

			{!isLoading && !isRefetching && posts && posts.length > 0 && (
				<div className="columns-1 xl:columns-2 gap-5 space-y-5">
					{posts.map((post) => (
						<div key={post._id} className="break-inside-avoid">
							<Post post={post} feedType={feedType} />
						</div>
					))}
				</div>
			)}
		</>
	);
};

export default Posts;