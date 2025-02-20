import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      localStorage.clear();
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      localStorage.clear();
    }
  }, [token]);

  const login = (authToken) => {
    localStorage.clear();
    setToken(authToken);
    localStorage.setItem("token", authToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
