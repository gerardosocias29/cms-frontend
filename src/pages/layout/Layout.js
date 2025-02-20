import { useRef } from "react";
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";

const Layout = ({ profile, children }) => {
  const menuRef = useRef(null);

  const menuItems = [
    { label: "Profile", icon: "pi pi-user", command: () => console.log("Profile Clicked") },
    { label: "Settings", icon: "pi pi-cog", command: () => console.log("Settings Clicked") },
    { separator: true },
    { label: "Logout", icon: "pi pi-sign-out", command: () => console.log("Logout Clicked") },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside id="default-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-gray-50 dark:bg-gray-800">
        <div className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            <li>
              <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
                </svg>
                <span className="ms-3">Dashboard</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Profile</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <nav className="border-b shadow-sm p-4 fixed w-full top-0 z-10 bg-white flex justify-between items-center">
          <div className="lg:ml-[16.5rem] font-bold text-xl">Clinic Management System</div>
          <div className="flex gap-3 items-center">
            <p>Howdy, {profile?.name || "User"}!</p>
            <Menu model={menuItems} popup ref={menuRef} />
            <Avatar
              image={profile?.avatar || "https://via.placeholder.com/40"}
              shape="circle"
              className="cursor-pointer"
              onClick={(event) => menuRef.current.toggle(event)}
            />
          </div>
        </nav>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto pt-20 p-6 mt-15 bg-gray-100 lg:ml-64">{children}</main>
      </div>
    </div>
  );
};

export default Layout;