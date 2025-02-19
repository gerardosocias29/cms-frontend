import { useState } from "react";
import PageLoader from "../pages/loader/PageLoader";
import Login from "../pages/auth/Login";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import Main from "../pages/main/Main";

const AppRouter = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <PageLoader />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login setLoadingState={setIsLoading} />} />
          <Route path="/main" element={<Main setLoadingState={setIsLoading} />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default AppRouter