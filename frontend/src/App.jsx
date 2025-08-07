import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ForgotPassword from "./pages/auth/forgotpassword/forgotPassword";
import VerifyOtpPage from "./pages/auth/verifyOtp/VerifyOTP";

import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import LoadingSpinner from "./components/common/LoadingSpinner";

import "./style.css";

function App() {
  const location = useLocation();

  const isAuthPage = ["/login", "/signup", "/forgot-password", "/verify-otp"].includes(location.pathname);

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          credentials: "include",
          method: "GET",
        });

        const text = await res.text();
        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON: " + text);
        }

        if (data.error) return null;

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        console.log("authUser is here:", data);
        return data;
      } catch (error) {
        console.error("Auth fetch error:", error.message);
        return null;
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {isAuthPage ? (
        // Render only the auth page without layout
        <Routes>
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
        </Routes>
      ) : (
        // Render the full layout for logged-in routes
        <div className="flex min-h-screen bg-gradient-to-br from-primary to-secondary text-base-content">
          {authUser && <Sidebar />}
          <main className="flex-1 p-4 overflow-y-auto">
            <Routes>
              <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
              <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
              <Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          {authUser && (
            <aside className="w-76 hidden lg:block p-2">
              <RightPanel />
            </aside>
          )}
        </div>
      )}
      <Toaster position="top-right" />
    </>
  );
}

export default App;
