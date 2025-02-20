import { useEffect, useRef, useState } from "react";
import { useAxios } from "../../contexts/AxiosContext"
import Layout from "../layout/Layout";
import { useLocation } from "react-router-dom";
import NotFound from "../404/NotFound";
import Dashboard from "../dashboard/Dashboard";

const useQueryParams = () => {
  const { search } = useLocation();
  return new URLSearchParams(search);
};

const Main = ( {setLoadingState} ) => {
  const location = useLocation();
  const axiosInstance = useAxios();
  const [profile, setProfile] = useState();
  const [page, setPage] = useState("dashboard");
  const queryParams = useQueryParams();

  const renderPage = (page) => {
    let p;
    switch(page) {
      case 'dashboard':
        p = <Dashboard />
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
      });
  }, []);

  useEffect(() => {
    const pageParam = queryParams.get("page");
    if (pageParam) {
      setPage(pageParam);
    }
  }, [location.search]);

  return (
    <Layout profile={profile}>
      {renderPage(page)}
    </Layout>
  )
}

export default Main