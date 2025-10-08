import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import XSvg from "../../../components/svgs/X";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Firebase imports
import { auth, googleProvider } from "../../../utils/config/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const minPasswordLength = 6;

  // React Query login mutation (for your API login)
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

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleLogout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setGoogleUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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

        {/* Normal Login Form */}
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

        {/* Google Login */}
        <div className="mt-6">
          {googleUser ? (
            <div className="text-center">
              <p className="mb-2">Welcome {googleUser.displayName}</p>
              <img
                src={googleUser.photoURL}
                alt="profile"
                className="w-12 h-12 rounded-full mx-auto"
              />
              <button
                onClick={handleGoogleLogout}
                className="mt-3 w-full py-2 rounded-full bg-red-500 hover:bg-red-600 font-semibold"
              >
                Logout from Google
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="mt-3 w-full py-3 rounded-full font-semibold bg-white text-black hover:opacity-90"
            >
              Continue with Google
            </button>
          )}
        </div>

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
