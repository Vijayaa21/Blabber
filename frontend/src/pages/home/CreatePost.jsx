import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { useRef, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import { getProfileImageUrl } from "../../utils/avatar";

const IconButton = ({ icon, onClick }) => (
	<div
		onClick={onClick}
		className="p-2 rounded-xl hover:bg-violet-500/10 cursor-pointer transition-colors text-violet-400 hover:scale-110 active:scale-95"
	>
		{icon}
	</div>
);

const CreatePost = () => {
	const [text, setText] = useState("");
	const [img, setImg] = useState(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const imgRef = useRef(null);
	const emojiPickerRef = useRef(null);
	const queryClient = useQueryClient();

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const {
		mutate: createPost,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ text, img }) => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/create`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text, img }),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Something went wrong");
			}
			return data;
		},
		onSuccess: () => {
			setText("");
			setImg(null);
			setShowEmojiPicker(false);
			toast.success("Post created successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (text.trim() === "") return;
		createPost({ text, img });
	};

	const handleImgChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleEmojiClick = (emojiData) => {
		setText((prev) => prev + emojiData.emoji);
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				emojiPickerRef.current &&
				!emojiPickerRef.current.contains(event.target)
			) {
				setShowEmojiPicker(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	return (
		<>
			{/* Emoji Picker - rendered as portal-like fixed overlay */}
			{showEmojiPicker && (
				<div
					ref={emojiPickerRef}
					className="fixed z-[9999] shadow-2xl rounded-xl overflow-hidden"
					style={{ 
						top: '50%', 
						left: '50%', 
						transform: 'translate(-50%, -50%)' 
					}}
				>
					<EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
				</div>
			)}

			{/* Backdrop when emoji picker is open */}
			{showEmojiPicker && (
				<div 
					className="fixed inset-0 bg-black/50 z-[9998]"
					onClick={() => setShowEmojiPicker(false)}
				/>
			)}

			<div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-5 mb-8 shadow-xl">
				<div className="flex gap-4">
					<img
						src={getProfileImageUrl(authUser?.profileImg, authUser?.username)}
						alt="User"
						className="w-12 h-12 rounded-2xl bg-slate-800 flex-shrink-0 object-cover ring-2 ring-violet-500/20"
					/>
				<form className="flex-1 flex flex-col" onSubmit={handleSubmit}>
					<textarea
						placeholder="What is happening?!"
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={handleKeyDown}
						className="w-full bg-transparent text-lg placeholder-slate-500 border-none focus:ring-0 resize-none outline-none min-h-[80px] text-white"
					/>

					{img && (
						<div className="relative mt-3 rounded-2xl overflow-hidden">
							<IoCloseSharp
								className="absolute top-2 right-2 text-white bg-slate-900/80 rounded-full w-7 h-7 p-1 cursor-pointer hover:bg-slate-900 transition-colors z-10"
								onClick={() => {
									setImg(null);
									imgRef.current.value = null;
								}}
							/>
							<img
								src={img}
								className="w-full max-h-80 object-contain rounded-2xl"
								alt="Preview"
							/>
						</div>
					)}

					<div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
						<div className="flex gap-1 text-violet-400">
							<IconButton
								icon={<CiImageOn size={22} />}
								onClick={() => imgRef.current.click()}
							/>
							<IconButton
								icon={<BsEmojiSmileFill size={18} />}
								onClick={() => setShowEmojiPicker((prev) => !prev)}
							/>
							<IconButton icon={<HiOutlineDotsHorizontal size={20} />} />
						</div>

						<input
							type="file"
							accept="image/*"
							hidden
							ref={imgRef}
							onChange={handleImgChange}
						/>

						<button
							type="submit"
							disabled={isPending || text.trim() === ""}
							className={`px-6 py-2 font-bold rounded-xl text-sm transition-all ${
								isPending || text.trim() === ""
									? "bg-slate-700 text-slate-400 cursor-not-allowed"
									: "bg-white text-slate-950 hover:bg-slate-200"
							}`}
						>
							{isPending ? "Posting..." : "Post"}
						</button>
					</div>

					{isError && (
						<div className="text-red-400 text-sm mt-2">{error.message}</div>
					)}
				</form>
			</div>
		</div>
		</>
	);
};

export default CreatePost;
