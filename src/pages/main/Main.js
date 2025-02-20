import { useEffect, useRef, useState } from "react";
import { useAxios } from "../../contexts/AxiosContext"
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu"; 
import Layout from "../layout/Layout";

const Main = ( {setLoadingState} ) => {
  const axiosInstance = useAxios();
  const [profile, setProfile] = useState();
  const menuRef = useRef(null);

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
  
  const menuItems = [
    { label: "Profile", icon: "pi pi-user", command: () => console.log("Profile Clicked") },
    { label: "Settings", icon: "pi pi-cog", command: () => console.log("Settings Clicked") },
    { separator: true },
    { label: "Logout", icon: "pi pi-sign-out", command: () => console.log("Logout Clicked") },
  ];

  return (
    <Layout profile={profile}>
      <h2 className="text-xl font-bold">Main Content</h2>
      <p>Welcome, {profile?.name || "User"}!</p>
    </Layout>
  )
}

export default Main