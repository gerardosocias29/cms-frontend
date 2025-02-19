import { useEffect } from "react";
import { useAxios } from "../../contexts/AxiosContext"

const Main = ( {setLoadingState} ) => {
  const axiosInstance = useAxios();

  useEffect(() => {
    setLoadingState(true)
    axiosInstance
      .get('/profile')
      .then((response) => {
        console.log("response", response.data)
        setLoadingState(false)
      }).catch((error) => {
        console.log(error)
        setLoadingState(false)
      });
  }, []);

  return (
    <>

    </>
  )
}

export default Main