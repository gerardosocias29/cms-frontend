import { useState } from "react";
import PageLoader from "../pages/loader/PageLoader";
import Login from "../pages/auth/Login";
import TvDisplay from "../pages/queue/TvDisplay";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "../pages/main/Main";
import TvDisplayV2 from "../pages/queue/TvDisplayV2";

const AppRouter = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <PageLoader />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login setLoadingState={setIsLoading} />} />
          <Route path="/queue-display" element={<TvDisplay setLoadingState={setIsLoading} />} />
          <Route path="/queue-display-v2" element={<TvDisplayV2 setLoadingState={setIsLoading} />} />
          <Route path="/" element={<Login setLoadingState={setIsLoading} />} />
          <Route path="/main" element={<Main setLoadingState={setIsLoading} />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default AppRouter