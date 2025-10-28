import React, { useContext, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Header from "../components/Header.jsx";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import Footer from "../components/Footer.jsx";


const Home = () => {
  const navigate = useNavigate();
  const { userData, isLoggedIn } = useContext(AppContext);

  useEffect(() => {
    // Only run redirect logic when we actually HAVE userData
    // and we know the login state.
    if (isLoggedIn && userData && !userData.status) {
      // user is logged in but not verified
      navigate("/email-verify");
    }
  }, [isLoggedIn, userData, navigate]);

  return (
    <>
      <Navbar />
      <Header />
      <Footer />
    </>
  );
};

export default Home;
