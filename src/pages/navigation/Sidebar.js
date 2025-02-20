import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ profile }) => {
  const location = useLocation();
  const getLinkClass = (page) =>
    location.search.includes(`page=${page}`)
      ? "bg-gray-200 dark:bg-gray-700"
      : "hover:bg-gray-100 dark:hover:bg-gray-700";

  return (
    <aside
      id="default-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-gray-50 dark:bg-gray-800"
    >
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          <li>
            <Link
              to="/main?page=dashboard"
              className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white ${getLinkClass(
                "dashboard"
              )}`}
            >
              <span className="ms-3">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/main?page=profile"
              className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white ${getLinkClass(
                "profile"
              )}`}
            >
              <span className="ms-3">Profile</span>
            </Link>
          </li>
          <li>
            <Link
              to="/main?page=settings"
              className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white ${getLinkClass(
                "settings"
              )}`}
            >
              <span className="ms-3">Settings</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
