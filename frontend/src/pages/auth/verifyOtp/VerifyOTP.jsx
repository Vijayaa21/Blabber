import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success("Account verified");
      navigate("/");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0F172A]">
      <div className="w-full max-w-4xl bg-gradient-to-br from-[#7B2FF7]/30 to-[#2C3E50]/30 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 text-white">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-6">Verify Your Email</h1>

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 text-white">
            <label className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg border border-white/20">
              <span className="text-purple-300 font-semibold">OTP</span>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="bg-transparent w-full outline-none text-white placeholder:text-white/60"
              />
            </label>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 transition rounded-full shadow-lg font-semibold"
            >
              {isPending ? "Verifying..." : "Verify"}
            </button>

            {isError && (
              <p className="text-red-400 text-sm text-center">
                {error.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
