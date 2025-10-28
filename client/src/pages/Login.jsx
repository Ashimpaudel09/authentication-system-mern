import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();
  const { backendUrl,isLoggedIn,authReady, setIsLoggedIn, getUserData } = useContext(AppContext);
  
  // separate form data for each mode
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  useEffect(()=>{
    if(isLoggedIn){
      navigate('/')
    }
  },[])

  const inputWrap =
    "mb-4 flex items-center outline-none gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]";
  const input =
    "bg-transparent outline-none w-full placeholder:text-indigo-200/70 text-indigo-100";

  const formRef = useRef(null);
  const [height, setHeight] = useState("auto");

  // Dynamically animate height based on content
  useEffect(() => {
    if (formRef.current) {
      const newHeight = formRef.current.scrollHeight;
      setHeight(`${newHeight}px`);
    }
  }, [mode, loginData, signupData]);

  const handleModeChange = (newMode) => {
    if (newMode === "login") {
      setSignupData({ fullName: "", email: "", password: "", confirmPassword: "" });
    } else {
      setLoginData({ email: "", password: "" });
    }
    setMode(newMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;
      if (mode === "login") {
        const { email, password } = loginData;
        if (!email || !password) {
          toast.error("Please enter email and password");
          return;
        }
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password,
        });
        if (data?.success) {
          setIsLoggedIn(true);
          await getUserData()
          toast.success("Logged in!");
            navigate("/");
          
        } else {
          toast.error(data?.message || "Login failed");
        }
      } else {
        const { fullName, email, password, confirmPassword } = signupData;
        if (!fullName || !email || !password) {
          toast.error("Please fill all fields");
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name: fullName,
          email,
          password,
          confirmPassword,
        });
        if (data?.success) {
          setIsLoggedIn(true);
          await getUserData()
          toast.success("Account created!");
          navigate("/");
        } else {
          toast.error(data?.message || "Signup failed");
        }
      }
    } catch (err) {
      // surface API/network errors
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-400 pt-14 md:pt-16 flex items-center justify-center px-4 sm:px-6">
      {/* Logo */}
      <img
        src={assets.logo}
        alt="Logo"
        className="fixed left-4 sm:left-20 top-4 w-24 sm:w-32 cursor-pointer"
        onClick={() => navigate("/")}
      />

      <div className="w-full max-w-md bg-slate-900/95 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8 text-indigo-300">
        {/* Toggle with sliding pill */}
        <div className="relative rounded-full bg-[#2c3250] p-1 mb-6">
          <span
            className={`absolute top-1 bottom-1 left-1 w-1/2 rounded-full bg-slate-800 transition-transform duration-300 will-change-transform ${
              mode === "signup" ? "translate-x-full" : "translate-x-0"
            }`}
          />
          <div className="grid grid-cols-2 relative z-10">
            <button
              type="button"
              onClick={() => handleModeChange("login")}
              className={`py-2 rounded-full  text-sm font-semibold transition cursor-pointer active:scale-[0.98] ${
                mode === "login" ? "text-white bg-gradient-to-r from-green-900 " : "text-indigo-200 hover:text-white/90 "
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("signup")}
              className={`py-2 rounded-full text-sm font-semibold transition cursor-pointer active:scale-[0.98] ${
                mode === "signup" ? "text-white bg-gradient-to-l from-blue-500" : "text-indigo-200 hover:text-white/90 "
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center mb-1 transition-opacity duration-300">
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-center text-sm mb-6 transition-opacity duration-300">
          {mode === "signup" ? "Create your account" : "Login to your account"}
        </p>

        {/* Animated container */}
        <div
          className="relative overflow-hidden transition-[height] duration-300 ease-in-out"
          style={{ height }}
        >
          <div ref={formRef} className="relative w-full">
            {/* LOGIN FORM */}
            {mode === "login" && (
              <form onSubmit={handleSubmit} className="transition-all duration-300 ease-out">
                <div className={inputWrap}>
                  <img src={assets.mail_icon} alt="" />
                  <input
                    className={input}
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>

                <div className={inputWrap}>
                  <img src={assets.lock_icon} alt="" />
                  <input
                    className={input}
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((s) => ({ ...s, password: e.target.value }))
                    }
                  />
                </div>

                <p
                  className="mb-2 text-right text-indigo-300 hover:underline cursor-pointer"
                  onClick={() => navigate("/reset-password")}
                >
                  Forgot password?
                </p>

                <button
                  type="submit"
                  className="w-full mt-3 border-none rounded-full px-4 py-2.5 font-semibold text-lg text-white hover:bg-[#262c4a] transition-all cursor-pointer active:scale-[0.99] bg-gradient-to-r from-indigo-500 to-indigo-900"
                >
                  Login
                </button>

                <p className="mt-3 text-right">
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange("signup")}
                    className="text-indigo-300 hover:underline font-medium cursor-pointer"
                  >
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* SIGNUP FORM */}
            {mode === "signup" && (
              <form onSubmit={handleSubmit} className="transition-all duration-300 ease-out">
                <div className={inputWrap}>
                  <img src={assets.person_icon} alt="" />
                  <input
                    className={input}
                    type="text"
                    placeholder="Full Name"
                    value={signupData.fullName}
                    onChange={(e) =>
                      setSignupData((s) => ({ ...s, fullName: e.target.value }))
                    }
                  />
                </div>

                <div className={inputWrap}>
                  <img src={assets.mail_icon} alt="" />
                  <input
                    className={input}
                    type="email"
                    placeholder="Email"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>

                <div className={inputWrap}>
                  <img src={assets.lock_icon} alt="" />
                  <input
                    className={input}
                    type="password"
                    placeholder="Password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData((s) => ({ ...s, password: e.target.value }))
                    }
                  />
                </div>

                <div className={inputWrap}>
                  <img src={assets.lock_icon} alt="" />
                  <input
                    className={input}
                    type="password"
                    placeholder="Confirm Password"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData((s) => ({
                        ...s,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-3 border border-none rounded-full px-4 py-2.5 font-semibold text-lg text-white hover:bg-[#262c4a] transition-all cursor-pointer active:scale-[0.99] bg-gradient-to-r from-indigo-500 to-indigo-900"
                >
                  Sign Up
                </button>

                <p className="mt-3 text-right">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange("login")}
                    className="text-indigo-300 hover:underline font-medium cursor-pointer "
                  >
                    Login now
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
