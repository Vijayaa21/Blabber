import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";

import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import LoadingSpinner from "./components/common/LoadingSpinner";

import "./style.css";
function App() {
  
	return (
		<div className='flex max-w-6xl mx-auto'>
      <Sidebar />
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/signup' element={<SignUpPage />} />
				<Route path='/login' element={<LoginPage />} />
        /** <Route path='/notifications' element={<NotificationPage />} /> */
				<Route path='/profile/:username' element={<ProfilePage /> } />
			</Routes>
      <RightPanel />
		</div>
	);
}

export default App;

