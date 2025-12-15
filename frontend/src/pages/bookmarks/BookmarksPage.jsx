import { useQuery } from "@tanstack/react-query";
import Posts from "../../components/common/Posts";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { FaBookmark } from "react-icons/fa";

const BookmarksPage = () => {
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const { data: bookmarkedPosts, isLoading } = useQuery({
		queryKey: ["bookmarkedPosts"],
		queryFn: async () => {
			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/api/posts/bookmarks/${authUser._id}`,
				{
					credentials: "include",
				}
			);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		enabled: !!authUser,
	});

	return (
		<div className="min-h-screen">
			{/* Header */}
			<div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
				<div className="flex items-center gap-3 px-6 py-4">
					<FaBookmark className="text-yellow-500" size={20} />
					<h1 className="text-xl font-bold text-white">Bookmarks</h1>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex justify-center items-center py-20">
					<LoadingSpinner size="lg" />
				</div>
			)}

			{/* Empty State */}
			{!isLoading && (!bookmarkedPosts || bookmarkedPosts.length === 0) && (
				<div className="text-center py-20">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
						<FaBookmark className="text-yellow-500" size={28} />
					</div>
					<h2 className="text-xl font-bold text-white mb-2">No bookmarks yet</h2>
					<p className="text-slate-400 max-w-sm mx-auto">
						Save posts to read later by clicking the bookmark icon on any post
					</p>
				</div>
			)}

			{/* Bookmarked Posts */}
			{!isLoading && bookmarkedPosts && bookmarkedPosts.length > 0 && (
				<div className="p-4">
					<Posts posts={bookmarkedPosts} feedType="bookmarks" />
				</div>
			)}
		</div>
	);
};

export default BookmarksPage;
