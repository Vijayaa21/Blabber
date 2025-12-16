import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Posts from "../../components/common/Posts";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { FaBookmark, FaArrowLeft } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";

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
			<div className="sticky top-0 z-20 bg-[#0B0C15]/80 backdrop-blur-xl border-b border-white/5">
				<div className="flex items-center justify-between px-4 sm:px-6 py-4">
					<div className="flex items-center gap-4">
						<Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors sm:hidden">
							<FaArrowLeft className="w-4 h-4 text-white" />
						</Link>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
								<FaBookmark className="text-white" size={16} />
							</div>
							<div>
								<h1 className="text-xl font-bold text-white">Bookmarks</h1>
								<p className="text-xs text-slate-500">@{authUser?.username}</p>
							</div>
						</div>
					</div>
					
					{bookmarkedPosts?.length > 0 && (
						<div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
							<HiOutlineSparkles className="text-amber-500" />
							<span>{bookmarkedPosts.length} saved</span>
						</div>
					)}
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
				<div className="text-center py-20 px-4">
					<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
						<FaBookmark className="text-amber-400" size={36} />
					</div>
					<h2 className="text-2xl font-bold text-white mb-3">Save posts for later</h2>
					<p className="text-slate-400 max-w-md mx-auto mb-6">
						Bookmark posts to easily find them later. Your bookmarks are private and only visible to you.
					</p>
					<Link 
						to="/"
						className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
					>
						<HiOutlineSparkles />
						Explore Posts
					</Link>
				</div>
			)}

			{/* Stats Bar */}
			{!isLoading && bookmarkedPosts && bookmarkedPosts.length > 0 && (
				<div className="px-4 sm:px-6 py-3 border-b border-white/5">
					<div className="flex items-center gap-2">
						<div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
						<span className="text-xs text-slate-500 font-medium uppercase tracking-wider flex items-center gap-2">
							<FaBookmark className="text-amber-500" size={10} />
							{bookmarkedPosts.length} bookmarked post{bookmarkedPosts.length !== 1 ? 's' : ''}
						</span>
						<div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
					</div>
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
