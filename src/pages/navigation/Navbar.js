import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { useContext, useRef } from "react";
import { useAxios } from "../../contexts/AxiosContext";
import AuthContext from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ( {profile, setLoadingState} ) => {
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

  return (
    <nav className="border-b border-gray-200 shadow-sm px-6 h-16 fixed w-full top-0 z-30 bg-white flex justify-between items-center">
      <div className="lg:ml-64 font-semibold text-lg text-gray-800">Clinic Management System</div>
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