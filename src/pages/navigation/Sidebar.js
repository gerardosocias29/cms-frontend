import { Link, useLocation } from "react-router-dom";
import { FaBuilding } from "react-icons/fa6";
import { FaCogs, FaUsers, FaPrint } from "react-icons/fa"; // Added FaPrint just in case, using FaCogs for now
import { RiFirstAidKitFill, RiStackFill } from "react-icons/ri";
import { BsBuildingsFill } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { MdOutlineAddToQueue } from "react-icons/md";

const Sidebar = ({ profile, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const sidebarRef = useRef(null);

  const getLinkClass = (page = "") => {
    if(location.search.includes(`page=${page}`)){
      // console.log("page", page);
    }
    
    // Use primary color for active link, ensure text contrast
    return location.search.includes(`page=${page}`)
      ? "bg-primary text-white dark:bg-primary-dark" // Active state
      : "hover:bg-gray-200 dark:hover:bg-gray-700" // Hover state
  };

  const getIcon = (page) => {
    let icon = null;
    switch(page) {
      case 'dashboard': icon = <FaBuilding />; break;
      case 'patient-triage': icon = <RiFirstAidKitFill />; break;
      case 'queue': icon = <RiStackFill />; break;
      case 'departments': icon = <BsBuildingsFill />; break;
      case 'users': icon = <FaUsers />; break;
      case 'settings': icon = <FaCogs />; break; // Keep FaCogs for general settings
      default: icon = null; break; // Explicitly return null for default
    }
    return icon;
  }

  const [modules, setModules] = useState();

  const toTitleCase = (str) => {
    return str
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  useEffect(() => {
    if(profile){
      setModules(profile?.role?.modules.map((m) => ({
        name: toTitleCase(m.page),
        page: m.page,
        icon: getIcon(m.page)
      })));
    }
  }, [profile]);

  return (
    <aside
      ref={sidebarRef}
      id="default-sidebar"
      className={`${sidebarOpen} fixed top-0 left-0 z-20 w-64 h-screen transition-transform ${!sidebarOpen ? '-translate-x-full' : 'translate-x-0'} lg:translate-x-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
    >
      <div className="h-full pt-20 px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          <li>
            <Link
              to={`/queue-display-v2`}
              target="_blank"
              className={`flex items-center p-2 text-gray-700 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group`}
            >
              {/* Add margin to icon */}
              <MdOutlineAddToQueue className="mr-3 flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span>Queue Display</span> {/* Removed ms-3 */}
            </Link>
          </li>
          {
            modules && modules.map((module, i) => 
              <li key={i}>
                <Link
                  to={`/main?page=${module.page}`}
                  className={`flex items-center p-2 text-gray-700 rounded-lg dark:text-white group ${getLinkClass(
                    module.page
                  )}`}
                >
                  {/* Add margin to icon, ensure consistent sizing */}
                  <span className="mr-3 flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                    {module.icon}
                  </span>
                  <span>{module.name}</span> {/* Removed ms-3 */}
                </Link>
              </li>
            )
          }
          
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
