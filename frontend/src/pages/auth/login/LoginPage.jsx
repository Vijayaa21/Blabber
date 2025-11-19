import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import XSvg from "../../../components/svgs/X";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  const minPasswordLength = 6;

  const {
    mutate: loginMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ username, password }) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrUsername: username, password }),
        }
      );
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

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      alert("Google login is currently unavailable due to a configuration error. Please contact support.");
      return;
    }
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  // Validation
  const isFormValid = useMemo(() => {
    const { username, password } = formData;
    return username.trim() !== "" && password.length >= minPasswordLength;
  }, [formData]);

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

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 
          bg-white text-gray-800 rounded-lg font-semibold 
          hover:bg-gray-100 transition duration-200 
          border border-gray-300 mb-6"
        >
          <FcGoogle className="text-xl" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="px-3 text-white/60 text-sm">or</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

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
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-transparent outline-none text-white placeholder-white/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/60 hover:text-white"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isPending}
            className={`w-full py-3 rounded-full font-semibold transition ${
              isFormValid && !isPending
                ? "bg-gradient-to-r from-[#7B2FF7] to-[#2C3E50] hover:opacity-90"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            {isPending ? "Logging in..." : "Login"}
          </button>

          {isError && (
            <p className="text-red-400 text-sm text-center">{error.message}</p>
          )}
        </form>

        {/* Forgot Password flow removed */}

        <div className="text-center mt-6 text-white/80">
          <p>Don't have an account?</p>
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