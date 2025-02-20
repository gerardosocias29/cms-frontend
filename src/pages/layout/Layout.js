import Navbar from "../navigation/Navbar";
import Sidebar from "../navigation/Sidebar";

const Layout = ({ profile, children }) => {

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar profile={profile} />
      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar profile={profile} /> 
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto pt-20 p-4 rounded-lg mt-15 bg-gray-100 lg:ml-64">
          <div className="rounded-lg overflow-hidden flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;