import XSvg from "../svgs/X";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { BiLogOut, BiBookmark } from "react-icons/bi";
import { HiOutlineSearch } from "react-icons/hi";
import { MdOutlineMail } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getProfileImageUrl } from "../../utils/avatar";

const NavItem = ({ icon, text, to, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 group w-full ${
        isActive 
          ? 'bg-white/10 text-white font-bold' 
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
    >
      <div className="relative">
        <div className={`${isActive ? 'text-violet-400' : 'text-inherit group-hover:text-violet-400 transition-colors'}`}>
          {icon}
        </div>
        {badge && (
          <span className="absolute -top-1.5 -right-1.5 bg-violet-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-[#0B0C15] font-bold shadow-sm">
            {badge}
          </span>
        )}
      </div>
      <span className="hidden xl:block text-base tracking-wide">{text}</span>
    </Link>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged out successfully");
      navigate("/");
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  return (
    <header className="hidden sm:flex w-20 xl:w-72 flex-col justify-between h-[calc(100vh-2rem)] sticky top-4 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-white/5 mr-4 mb-4">
      <div className="space-y-6 py-6 px-4">
        {/* Logo */}
        <div className="px-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <XSvg width="40" height="40" />
            </div>
            <span className="hidden xl:block text-lg font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors">Blabber</span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="space-y-2 mt-8">
          <NavItem icon={<MdHomeFilled size={24} />} text="Home" to="/" />
          <NavItem icon={<IoNotifications size={24} />} text="Notifications" to="/notifications" />
          <NavItem icon={<BiBookmark size={24} />} text="Bookmarks" to="/bookmarks" />
          <NavItem icon={<FaUser size={22} />} text="Profile" to={`/profile/${authUser?.username}`} />
        </nav>

        {/* New Post Button */}
        <button 
          onClick={() => navigate("/")}
          className="hidden xl:block w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-violet-500/25 transform hover:translate-y-[-2px]"
        >
          New Post
        </button>
      </div>

      {/* User Profile Snippet */}
      {authUser && (
        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-white/5">
            <Link to={`/profile/${authUser.username}`} className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-violet-500/30">
              <img
                src={getProfileImageUrl(authUser?.profileImg, authUser?.username)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </Link>
            <div className="hidden xl:block overflow-hidden flex-1">
              <p className="font-bold text-sm truncate text-white">{authUser?.fullName}</p>
              <p className="text-slate-500 text-xs truncate">@{authUser?.username}</p>
            </div>
            <BiLogOut
              size={20}
              className="hidden xl:block text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Sidebar;
