import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
	const queryClient = useQueryClient();

	const { mutate: follow, isPending } = useMutation({
		mutationFn: async (userId) => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/follow/${userId}`, {
				method: "POST",
				credentials: "include",
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Something went wrong!");
			}
			return { userId, message: data.message };
		},
		onMutate: async (userId) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["authUser"] });
			await queryClient.cancelQueries({ queryKey: ["suggestedUsers"] });

			// Snapshot the previous values
			const previousAuthUser = queryClient.getQueryData(["authUser"]);
			const previousSuggestedUsers = queryClient.getQueryData(["suggestedUsers"]);

			// Optimistically update authUser following list
			queryClient.setQueryData(["authUser"], (old) => {
				if (!old) return old;
				const isFollowing = old.following?.includes(userId);
				return {
					...old,
					following: isFollowing
						? old.following.filter((id) => id !== userId)
						: [...(old.following || []), userId],
				};
			});

			// Optimistically update suggested users
			queryClient.setQueryData(["suggestedUsers"], (old) => {
				if (!old) return old;
				return old.map((user) => {
					if (user._id === userId) {
						const authUser = queryClient.getQueryData(["authUser"]);
						const isFollowing = authUser?.following?.includes(userId);
						return {
							...user,
							followers: isFollowing
								? user.followers.filter((id) => id !== authUser?._id)
								: [...(user.followers || []), authUser?._id],
						};
					}
					return user;
				});
			});

			return { previousAuthUser, previousSuggestedUsers };
		},
		onError: (error, _, context) => {
			// Rollback on error
			queryClient.setQueryData(["authUser"], context?.previousAuthUser);
			queryClient.setQueryData(["suggestedUsers"], context?.previousSuggestedUsers);
			toast.error(error.message);
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

	return { follow, isPending };
};

export default useFollow;