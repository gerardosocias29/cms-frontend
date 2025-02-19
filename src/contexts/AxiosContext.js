import axios from "axios";
import { useContext, useEffect } from "react";
import AuthContext from "./AuthContext";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9876/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const useAxios = () => {
  const { token } = useContext(AuthContext);
  useEffect(() => {
    axiosInstance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => console.log(error)
    );
  }, [token]);

  return axiosInstance;
};
