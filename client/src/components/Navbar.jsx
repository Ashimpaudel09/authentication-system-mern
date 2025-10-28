import React, { useContext, useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userData, authReady,logout } = useContext(AppContext);

  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

  const firstLetter = userData?.name
    ? userData.name.slice(0, 1).toUpperCase()
    : "";

  const handleButtonClick = () => {
    if (authReady && isLoggedIn) {
      setShowDropdown((prev) => !prev);
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute h-14 md:h-16 top-0 z-50">
      <img
        src={assets.logo}
        alt="Logo"
        className="w-28 sm:w-32 cursor-pointer"
        onClick={() => navigate("/")}
      />

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleButtonClick}
          className={
            
            authReady && isLoggedIn
              ? // logged in avatar button
                " cursor-pointer flex items-center justify-center bg-indigo-900 h-10 w-10 rounded-full text-white font-semibold shadow-xl hover:bg-indigo-800 hover:shadow-[0_0_10px_#6366f1] transition-all select-none"
              : // logged out login button
                " cursor-pointer flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 bg-white/80 hover:bg-gray-100 hover:shadow-md transition-all select-none"
          }
        >
          {authReady && isLoggedIn ? (
            <span >{firstLetter}</span>
          ) : (
            <>
              <span>Login</span>
              <img src={assets.arrow_icon} alt="" className="w-4 h-4" />
            </>
          )}
        </button>

        {authReady && isLoggedIn && showDropdown && (
          <div
            className="
              absolute 
              left-1/2 
              top-[115%] 
              -translate-x-1/2 
              bg-white 
              rounded-lg 
              shadow-xl 
              border 
              border-gray-200 
              text-sm 
              w-44
              overflow-hidden
              z-50
              animate-[fadeIn_0.15s_ease-out_forwards]
              origin-top
            "
          >
            <div className="px-4 py-3 border-b border-gray-200 text-left">
              <p className="font-medium text-gray-800 leading-tight">
                {userData?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userData?.email || ""}
              </p>
            </div>

            

            <button
              className="w-full cursor-pointer text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              onClick={() => {
                navigate("/setting");
                setShowDropdown(false);
              }}
            >
              Setting
            </button>

            <button
              className="w-full cursor-pointer text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              onClick={() => {
                setShowDropdown(false);
                sessionStorage.clear()
                logout();
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
