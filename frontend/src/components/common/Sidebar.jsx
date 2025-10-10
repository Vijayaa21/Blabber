import XSvg from "../svgs/X";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const Sidebar = () => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
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
    <div className='md:flex-[2_2_0] w-18 max-w-52 '>
      <div
        className='sticky top-4 left-0 h-[95vh] flex flex-col 
          bg-gradient-to-br from-[#7B2FF7]/30 to-[#2C3E50]/30 
          backdrop-blur-xl border border-white/10 
          shadow-xl rounded-2xl px-4 py-6 text-white'
      >
        <Link to='/' className='flex justify-center md:justify-start mb-4'>
          <XSvg className='w-12 h-12 mt-2 hover:scale-105 transition-all duration-200' />
        </Link>

        <ul className='flex flex-col gap-3'>
          <li>
            <Link
              to='/'
              className='flex gap-3 items-center hover:bg-white/10 transition-all rounded-xl duration-300 py-2 pl-3 pr-4'
            >
              <MdHomeFilled className='w-6 h-6 text-purple-300' />
              <span className='text-base font-medium hidden md:block'>Home</span>
            </Link>
          </li>
          <li>
            <Link
              to='/notifications'
              className='flex gap-3 items-center hover:bg-white/10 transition-all rounded-xl duration-300 py-2 pl-3 pr-4'
            >
              <IoNotifications className='w-6 h-6 text-blue-300' />
              <span className='text-base font-medium hidden md:block'>Notifications</span>
            </Link>
          </li>
          <li>
            <Link
              to={`/profile/${authUser?.username}`}
              className='flex gap-3 items-center hover:bg-white/10 transition-all rounded-xl duration-300 py-2 pl-3 pr-4'
            >
              <FaUser className='w-6 h-6 text-pink-300' />
              <span className='text-base font-medium hidden md:block'>Profile</span>
            </Link>
          </li>
        </ul>

        {authUser && (
					<Link
						to={`/profile/${authUser.username}`}
            className='mt-auto flex gap-3 items-center py-2 px-3 rounded-xl transition-all hover:bg-white/10 duration-300'>
						<div className='w-9 h-9 rounded-full overflow-hidden'>
								<img src={authUser?.profileImg || "/avatar-placeholder.png"} 
                  className='w-full h-full object-cover block'
/>
						</div>
						<div className='flex justify-between flex-1'>
							<div className='hidden md:block'>
                <p className='font-semibold text-sm truncate'>{authUser?.fullName}</p>
                <p className='text-xs text-white/60 truncate'>@{authUser?.username}</p>
              </div>
							<BiLogOut
								className='w-5 h-5 cursor-pointer'
								onClick={(e) => {
									e.preventDefault();
									logout();
								}}
							/>
						</div>
					</Link>
				)}


      </div>
    </div>
  );
};

export default Sidebar;
