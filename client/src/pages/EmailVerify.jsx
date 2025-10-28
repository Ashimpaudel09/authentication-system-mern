import React, { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const OTP_LENGTH = 6;
const OTP_WINDOW_SECONDS = 120;

const EmailVerify = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userData, backendUrl, getUserData } = useContext(AppContext);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(0);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const inputsRef = useRef([]);

  useEffect(()=>{
      navigation()
    },[])

    const navigation = ()=>{
      if(!isLoggedIn){
        navigate('/login')
      }
      else if(isLoggedIn & userData?.status){
        navigate('/')
      }
    }

  useEffect(() => {
    if (userData?.email) setEmail(userData.email);
  },[]);
  useEffect(() => {
    const sentAt = sessionStorage.getItem("otpSentAt");
    if (!sentAt) return;
    const elapsedMs = Date.now() - Number(sentAt);
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const remaining = OTP_WINDOW_SECONDS - elapsedSec;
    setSecondsLeft(remaining > 0 ? remaining : 0);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const startTimerNow = () => {
    const now = Date.now();
    sessionStorage.setItem("otpSentAt", now.toString());
    setSecondsLeft(OTP_WINDOW_SECONDS);
  };

  const handleSendCode = async () => {
console.log(1)

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
        { email },
        { withCredentials: true }
      );
      if (data?.success) {
        toast.success("Verification code sent to your email");
        setOtp(Array(OTP_LENGTH).fill(""));
        startTimerNow();
        setTimeout(() => inputsRef.current[0]?.focus(), 150);
      } else {
        toast.error(data?.message || "Failed to send code");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    const alreadyVisited = sessionStorage.getItem("visitedEmailVerify");
    if (!alreadyVisited) {
      handleSendCode();
      sessionStorage.setItem("visitedEmailVerify", "true");
    }
  }, []);

  const handleResendOtp = async () => {
    if (!email) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
        { email },
        { withCredentials: true }
      );
      if (data?.success) {
        toast.success("New code sent");
        setOtp(Array(OTP_LENGTH).fill(""));
        startTimerNow();
        setTimeout(() => inputsRef.current[0]?.focus(), 150);
      } else {
        toast.error(data?.message || "Could not resend");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  const handleChangeOtp = (index, value) => {
    const val = value.replace(/\D/g, "");
    setOtp((prev) => {
      const next = [...prev];
      next[index] = val.slice(-1);
      return next;
    });
    if (val && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleBackspace = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < Math.min(OTP_LENGTH, text.length); i++) {
      next[i] = text[i];
    }
    setOtp(next);
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH)
      return toast.error(`Enter the ${OTP_LENGTH}-digit code`);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-otp`,
        { email, otp: code },
        { withCredentials: true }
      );
      if (data?.success) {
        toast.success("OTP verified successfully");
        await getUserData()
        navigate('/')
        sessionStorage.removeItem("visitedEmailVerify");
        sessionStorage.removeItem("otpSentAt");
      } else {
        toast.error(data?.message || "Invalid or expired code");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-400 pt-14 md:pt-16 flex items-center justify-center px-4 sm:px-6 relative">
     <Navbar/>

      <div className="w-full max-w-md bg-slate-900/95 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8 text-indigo-300">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center mb-5">
          Verify Your Account
        </h2>

        <p className="text-sm text-indigo-200/90 mb-3 text-center">
          We've sent a 6-digit code to:
          <br />
          <span className="text-white font-medium">{email}</span>
        </p>

        <div
          onPaste={handlePaste}
          className="flex justify-between gap-2 sm:gap-3 mb-3"
        >
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChangeOtp(idx, e.target.value)}
              onKeyDown={(e) => handleBackspace(idx, e)}
              className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold rounded-xl bg-[#2b3050] text-white outline-none focus:ring-2 focus:ring-indigo-400/70 focus:bg-[#272c48] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),0_6px_18px_rgba(0,0,0,0.25)] transition-all duration-150"
            />
          ))}
        </div>

        {secondsLeft > 0 ? (
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs sm:text-sm text-indigo-200/90">
              Code expires in{" "}
              <span className="text-white font-semibold">
                {mm}:{ss}
              </span>
            </span>
            <button
              type="button"
              disabled
              className="text-xs sm:text-sm opacity-60 cursor-not-allowed"
              title="You can resend when the timer ends"
            >
              Resend OTP
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs sm:text-sm text-rose-200/90">
              Code expired
            </span>
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-xs sm:text-sm text-indigo-300 hover:underline"
            >
              Resend OTP
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleVerifyOtp}
          className="py-2.5 rounded-full text-sm font-semibold transition cursor-pointer active:scale-[0.98] text-white bg-gradient-to-r from-green-600 to-emerald-700 hover:opacity-90 w-full"
        >
          Verify Code
        </button>
      </div>
    </div>
  );
};

export default EmailVerify;
