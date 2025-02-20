import axios from "axios";
import { useContext, useEffect } from "react";
import AuthContext from "./AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:9876/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const useAxios = () => {
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          delete config.headers.Authorization;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
    };
  }, [token]);

  return axiosInstance;
};
