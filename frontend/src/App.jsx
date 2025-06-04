import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";

import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";


import "./style.css";
function App() {
  const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/auth/me");
				const data = await res.json();
				if (data.error) return null;
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				console.log("authUser is here:", data);
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		retry: false,
	});

	if (isLoading) {
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-gradient-to-br from-primary to-secondary text-base-content">
  {/* Sidebar */}
  {authUser && (
    
      <Sidebar />
    
  )}

  {/* Main Content */}
  <main className="flex-1 p-4 overflow-y-auto">
    <Routes>
      <Route
        path="/"
        element={authUser ? <HomePage /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={!authUser ? <LoginPage /> : <Navigate to="/" />}
      />
      <Route
        path="/signup"
        element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
      />
      <Route
        path="/notifications"
        element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile/:username"
        element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
      />
    </Routes>
  </main>

  {/* Right Panel */}
  {authUser && (
    <aside className="w-72 hidden lg:block p-4">
      <RightPanel />
    </aside>
  )}

  <Toaster position="top-right" />
</div>

	);
}

export default App;

