import { Link, useLocation } from "react-router-dom";
import { FaBuilding } from "react-icons/fa6";
import { FaCogs, FaUsers } from "react-icons/fa";
import { RiFirstAidKitFill, RiStackFill } from "react-icons/ri";
import { BsBuildingsFill } from "react-icons/bs";

const Sidebar = ({ profile }) => {
  const location = useLocation();

  const getLinkClass = (page = "") => {
    if(location.search.includes(`page=${page}`)){
      console.log("page", page);
    }
    
    return location.search.includes(`page=${page}`)
      ? "bg-gray-200 dark:bg-gray-700"
      : "hover:bg-gray-100 dark:hover:bg-gray-700"
  };

  const modules = [
    { name: "Dashboard", page: "dashboard", icon: <FaBuilding />},
    { name: "Patient Triage", page: "triage", icon: <RiFirstAidKitFill />},
    { name: "Queue", page: "queue", icon: <RiStackFill />},
    { name: "Departments", page: "departments", icon: <BsBuildingsFill />},
    { name: "Users", page: "users", icon: <FaUsers />},
    { name: "Settings", page: "settings", icon: <FaCogs />},
  ]

  return (
    <aside
      id="default-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-gray-50 dark:bg-gray-800"
    >
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          {
            modules.map((module, i) => 
              <li key={i}>
                <Link
                  to={`/main?page=${module.page}`}
                  className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white ${getLinkClass(
                    module.page
                  )}`}
                >
                  {module.icon}
                  <span className="ms-3">{module.name}</span>
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
