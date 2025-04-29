import { useContext, useEffect, useState } from "react";
import { useAxios } from "../../contexts/AxiosContext"
import Layout from "../layout/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import NotFound from "../404/NotFound";
import Dashboard from "../dashboard/Dashboard";
import AuthContext from "../../contexts/AuthContext";
import Queue from "../queue/Queue";
import Departments from "../departments/Departments";
import Users from "../user/Users";
import PatientTriage from "../triage/PatientTriage";
import Settings from "../settings/Settings"; // Import the new Settings component

const useQueryParams = () => {
  const { search } = useLocation();
  return new URLSearchParams(search);
};

const Main = ( {setLoadingState} ) => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosInstance = useAxios();
  const [profile, setProfile] = useState();
  const [page, setPage] = useState("dashboard");
  const queryParams = useQueryParams();
  const { logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebar, setSidebar] = useState(false);

  const renderPage = (page) => {
    if(profile) {
      const findPage = profile.role.modules.find((m) => m.page == page)
      if(!findPage){
        console.log(findPage);
        return <NotFound />
      }
    }

    let p;
    switch(page) {
      case 'dashboard': 
        p = <Dashboard axiosInstance={axiosInstance}/>
      break;
      case 'queue':
        p = <Queue profile={profile}/>
      break;
      case 'departments':
        p = <Departments />
      break;
      case 'patient-triage':
        p = <PatientTriage />
      break;
      case 'users':
        p = <Users axiosInstance={axiosInstance} />
      break;
      case 'settings': // Add case for settings page
        p = <Settings />
      break;
      default:
        p = <NotFound />
      break;
    }
    return p;
  } 

  useEffect(() => {
    setLoadingState(true)
    axiosInstance
      .get('/profile')
      .then((response) => {
        setLoadingState(false)
        setProfile(response.data);
      }).catch((error) => {
        console.log(error)
        setLoadingState(false)
        logout();  
        navigate('/')  
      });
  }, []);

  useEffect(() => {
    const pageParam = queryParams.get("page");
    if (pageParam) {
      setPage(pageParam);
      setSidebarOpen(false);
    }
  }, [location.search]);
  
  useEffect(() => {
    console.log("sidebarOpen", sidebarOpen);
    setSidebar(sidebarOpen);
  }, [sidebarOpen]);

  return (
    <Layout profile={profile} setLoadingState={setLoadingState} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {renderPage(page)}
    </Layout>
  )
}

export default Main