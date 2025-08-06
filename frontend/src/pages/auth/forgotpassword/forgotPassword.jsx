import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import XSvg from "../../../components/svgs/X";
import axios from "axios";

const ForgotPassword = () => {
	const [step, setStep] = useState(1);
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [isSendingOtp, setIsSendingOtp] = useState(false);

	const navigate = useNavigate();

	const handleSendOtp = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");
		setIsSendingOtp(true);

		try {
			const { data } = await axios.post(
				`${import.meta.env.VITE_API_URL}/api/auth/send-reset-otp`,
				{ email },
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);
			setMessage(data.message);
			setStep(2);
		} catch (err) {
			setError(err.response?.data?.error || "Something went wrong");
		} finally {
			setIsSendingOtp(false);
		}
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");

		try {
			const { data } = await axios.post(
				`${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
				{ email, otp, newPassword },
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);
			setMessage(data.message);
			setStep(3);
			setOtp("");
			setNewPassword("");
			setTimeout(() => navigate("/"), 1500);
		} catch (err) {
			setError(err.response?.data?.error || "Something went wrong");
			console.log("Reset password error:", err);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 bg-[#0F172A]">
			<div className="w-full max-w-md rounded-2xl px-6 py-8 bg-gradient-to-br from-[#7B2FF7]/30 to-[#2C3E50]/30 backdrop-blur-xl border border-white/10 shadow-xl text-white">
				<div className="flex justify-center mb-6">
					<XSvg className="w-14 h-14 fill-white" />
				</div>
				<h1 className="text-3xl font-bold text-center mb-4">Forgot Password</h1>
				{error && <p className="text-red-400 text-center mb-2">{error}</p>}
				{message && <p className="text-green-400 text-center mb-2">{message}</p>}

				<form onSubmit={step === 1 ? handleSendOtp : handleResetPassword} className="space-y-4">
					<div className="flex items-center gap-3 border border-white/20 rounded-lg px-4 py-2 bg-white/5">
						<MdOutlineMail className="text-xl" />
						<input
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full bg-transparent outline-none text-white placeholder-white/60"
							required
						/>
					</div>

					{step === 2 && (
						<>
							<div className="flex items-center gap-3 border border-white/20 rounded-lg px-4 py-2 bg-white/5">
								<input
									type="text"
									placeholder="Enter OTP"
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									className="w-full bg-transparent outline-none text-white placeholder-white/60"
									required
								/>
							</div>
							<div className="flex items-center gap-3 border border-white/20 rounded-lg px-4 py-2 bg-white/5">
								<MdPassword className="text-xl" />
								<input
									type="password"
									placeholder="New Password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className="w-full bg-transparent outline-none text-white placeholder-white/60"
									required
								/>
							</div>
						</>
					)}

					<button
						type="submit"
						className="w-full py-3 rounded-full bg-gradient-to-r from-[#7B2FF7] to-[#2C3E50] font-semibold hover:opacity-90 transition cursor-pointer disabled:opacity-50"
						disabled={isSendingOtp}
					>
						{step === 1 ? (isSendingOtp ? "Sending OTP..." : "Send OTP") : "Reset Password"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default ForgotPassword;
