import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [authReady, setAuthReady] = useState(false);
    const navigate = useNavigate()
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        withCredentials: true, 
      });

      if (data.success) {
        setUserData(data.userData);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUserData(null);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setAuthReady(true); 
    }
  };

  useEffect(() => {
    getUserData(); 
  }, []);

  const logout = async () => {
    try {
      const {data} = await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
      if(data?.success){
        toast.success(data.message)
      }
      else{
        toast.error(data.message)
      }
      navigate('/login')
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  // --- CONTEXT VALUE ---
  const value = {
    backendUrl,
    isLoggedIn,
    userData,
    authReady,
    setIsLoggedIn,
    getUserData,
    logout,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
