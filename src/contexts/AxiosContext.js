import axios from "axios";
import { useContext, useEffect } from "react";
import AuthContext from "./AuthContext";

const axiosInstance = axios.create({
  baseURL: "https://your-api-url.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const useAxios = () => {
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
  }, [token]);

  return axiosInstance;
};
