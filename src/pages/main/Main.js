import { useContext, useEffect, useState } from "react";
import { useAxios } from "../../contexts/AxiosContext"
import Layout from "../layout/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import NotFound from "../404/NotFound";
import Dashboard from "../dashboard/Dashboard";
import AuthContext from "../../contexts/AuthContext";
import Queue from "../queue/Queue";

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

  const renderPage = (page) => {
    let p;
    switch(page) {
      case 'dashboard':
        p = <Dashboard />
      break;
      case 'queue':
        p = <Queue />
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
    }
  }, [location.search]);

  return (
    <Layout profile={profile} setLoadingState={setLoadingState}>
      {renderPage(page)}
    </Layout>
  )
}

export default Main