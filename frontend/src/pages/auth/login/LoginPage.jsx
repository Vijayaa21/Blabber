import { useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import XSvg from "../../../components/svgs/X";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const LoginPage = () => {
	const [formData, setFormData] = useState({ username: "", password: "" });
	const queryClient = useQueryClient();

	const {
		mutate: loginMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ username, password }) => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ emailOrUsername: username, password })

			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Login failed");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		loginMutation(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 bg-[#0F172A]">
			<div
				className="w-full max-w-md rounded-2xl px-6 py-8 
        bg-gradient-to-br from-[#7B2FF7]/30 to-[#2C3E50]/30 
        backdrop-blur-xl border border-white/10 
        shadow-xl text-white"
			>
				{/* Logo */}
				<div className="flex justify-center mb-6">
					<XSvg className="w-14 h-14 fill-white" />
				</div>

				<h1 className="text-3xl font-bold text-center mb-4">Log in</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex items-center gap-3 border border-white/20 rounded-lg px-4 py-2 bg-white/5">
						<MdOutlineMail className="text-xl" />
						<input
							type="text"
							name="username"
							placeholder="Username or Email"
							value={formData.username}
							onChange={handleInputChange}
							className="w-full bg-transparent outline-none text-white placeholder-white/60"
						/>
					</div>

					<div className="flex items-center gap-3 border border-white/20 rounded-lg px-4 py-2 bg-white/5">
						<MdPassword className="text-xl" />
						<input
							type="password"
							name="password"
							placeholder="Password"
							value={formData.password}
							onChange={handleInputChange}
							className="w-full bg-transparent outline-none text-white placeholder-white/60"
						/>
					</div>

					<button
						type="submit"
						className="w-full py-3 rounded-full bg-gradient-to-r from-[#7B2FF7] to-[#2C3E50] font-semibold hover:opacity-90 transition"
					>
						{isPending ? "Logging in..." : "Login"}
					</button>

					{isError && (
						<p className="text-red-400 text-sm text-center">{error.message}</p>
					)}
				</form>
				<div className="text-center">
					<Link
						to="/forgot-password"
						className="inline-block mt-2 text-[#b99aff] hover:underline mt-4"
						>
							Forgot Password
					</Link>
				</div>
				
				<div className="text-center mt-6 text-white/80">
					<p>Don’t have an account?</p>
					<Link
						to="/signup"
						className="inline-block mt-2 text-[#b99aff] hover:underline"
					>
						Sign up
					</Link>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
