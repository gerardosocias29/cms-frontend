import Navbar from "../navigation/Navbar";
import Sidebar from "../navigation/Sidebar";
import Footer from "./Footer";

const Layout = ({ profile, setLoadingState, sidebarOpen, setSidebarOpen, children }) => {

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar profile={profile} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setLoadingState={setLoadingState}/>
      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar profile={profile} setLoadingState={setLoadingState} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/> 
        {/* Scrollable Main Content */}
        {/* Adjusted padding, removed margin-top and rounding from main */}
        <main className="flex-1 overflow-y-auto pt-20 p-4 bg-gray-100 lg:ml-64"> {/* Assuming lg:ml-64 matches Sidebar width */}
          {/* Added bg-white, removed flex-1 from inner container */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;