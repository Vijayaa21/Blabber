import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser, FaBookmark } from "react-icons/fa";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import BookmarksPage from "./pages/bookmarks/BookmarksPage";

import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import LoadingSpinner from "./components/common/LoadingSpinner";

import "./style.css";

// Mobile Navigation Item Component
const MobileNavItem = ({ to, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={`p-3 rounded-xl transition-all ${isActive ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-slate-300'}`}
    >
      {icon}
    </Link>
  );
};

function App() {
  const location = useLocation();

  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

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
          {/* Forgot password and OTP verification removed */}
        </Routes>
      ) : (
        // Render the full layout for logged-in routes
        <div className="min-h-screen bg-[#0B0C15] text-slate-100 selection:bg-violet-500/30">
          {/* Background decoration */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-900/10 rounded-full blur-[100px]"></div>
          </div>

          <div className="max-w-[1600px] mx-auto flex justify-center xl:justify-between w-full relative z-10">
            {/* Left Sidebar - Now on the left */}
            {authUser && (
              <aside className="hidden lg:flex w-80 flex-col gap-6 sticky top-4 h-[calc(100vh-2rem)] ml-4 mb-4">
                <RightPanel />
              </aside>
            )}

            {/* Main Content */}
            <main className="flex-1 w-full min-h-screen pb-20 px-4 sm:px-8 py-6 max-w-4xl">
              <Routes>
                <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
                <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
                <Route path="/bookmarks" element={authUser ? <BookmarksPage /> : <Navigate to="/login" />} />
                <Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>

            {/* Right Sidebar - Navigation */}
            {authUser && <Sidebar />}
          </div>

          {/* Mobile Bottom Nav */}
          <div className="sm:hidden fixed bottom-0 left-0 w-full bg-[#0B0C15]/90 backdrop-blur-lg border-t border-white/5 flex justify-around px-2 py-4 z-50">
            <MobileNavItem to="/" icon={<MdHomeFilled size={24} />} />
            <MobileNavItem to="/notifications" icon={<IoNotifications size={24} />} />
            <MobileNavItem to="/bookmarks" icon={<FaBookmark size={20} />} />
            <MobileNavItem to={`/profile/${authUser?.username}`} icon={<FaUser size={20} />} />
          </div>
        </div>
      )}
      <Toaster position="top-right" />
    </>
  );
}

export default App;
