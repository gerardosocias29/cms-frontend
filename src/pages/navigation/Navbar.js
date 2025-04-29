import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { useContext, useRef } from "react";
import { useAxios } from "../../contexts/AxiosContext";
import AuthContext from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ( {profile, setLoadingState, sidebarOpen, setSidebarOpen} ) => {
  const menuRef = useRef(null);
  const axiosInstance = useAxios();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const menuItems = [
    { label: "Profile", icon: "pi pi-user", command: () => console.log("Profile Clicked") },
    { label: "Settings", icon: "pi pi-cog", command: () => console.log("Settings Clicked") },
    { separator: true },
    { label: "Logout", icon: "pi pi-sign-out", command: () => {
      setLoadingState(true);
      axiosInstance.post('/logout').then((response) => {
        setLoadingState(false)
        logout();
        navigate('/')
      }).catch((error) => {
        setLoadingState(false)
        console.log(error);
      })
    }},
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <nav className="border-b border-gray-200 shadow-sm px-6 h-16 fixed w-full top-0 z-30 bg-white flex justify-between items-center">
      <div className="flex gap-4">
        <button onClick={toggleSidebar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 30 30"
            width="20"
            height="20"
            className={`transition-all duration-300 ${sidebarOpen ? '' : ''}`}
          >
            <path
              className={`line top transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-0 translate-x-[12px]' : ''}`}
              stroke="currentColor"
              strokeLinecap="round"
              strokeMiterlimit="10"
              strokeWidth="2"
              d="M3 7h24"
            />
            <path
              className={`line middle transition-opacity duration-300 ${sidebarOpen ? 'opacity-0' : ''}`}
              stroke="currentColor"
              strokeLinecap="round"
              strokeMiterlimit="10"
              strokeWidth="2"
              d="M3 15h24"
            />
            <path
              className={`line bottom transition-all duration-300 ${sidebarOpen ? '-rotate-45 translate-y-[10px] -translate-x-[10px]' : ''}`}
              stroke="currentColor"
              strokeLinecap="round"
              strokeMiterlimit="10"
              strokeWidth="2"
              d="M3 23h24"
            />
          </svg>
        </button>
        <img src="/cms_logo.png" width={100} alt="CMS Logo"/>
      </div>
      <div className="flex gap-3 items-center">
        {/* Refine greeting style */}
        <p className="text-sm text-gray-600 mr-3">{profile?.name || "User"}</p>
        <Menu model={menuItems} popup ref={menuRef} />
        <Avatar
          image={profile?.avatar || "https://via.placeholder.com/40"}
          shape="circle"
          className="cursor-pointer"
          onClick={(event) => menuRef.current.toggle(event)}
        />
      </div>
    </nav>
  )

}

export default Navbar;