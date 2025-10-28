import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const OTP_LENGTH = 6;
const OTP_WINDOW_SECONDS = 60; // 1 minute

const ResetPassword = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  // countdown (seconds left for OTP)
  const [secondsLeft, setSecondsLeft] = useState(0);

  const inputsRef = useRef([]);

  const inputWrap =
    "mb-4 flex items-center outline-none gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]";
  const input =
    "bg-transparent outline-none w-full placeholder:text-indigo-200/70 text-indigo-100";

  // Format mm:ss
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // Start/stop countdown when we are on Step 2 (OTP)
  useEffect(() => {
    if (step !== 2) return;
    if (secondsLeft <= 0) return;

    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [step, secondsLeft]);

  // ---------- STEP 1: SEND EMAIL ----------
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address");

    axios.defaults.withCredentials = true;
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      if (data?.success) {
        toast.success("Verification code sent to your email");
        setStep(2);
        setOtp(Array(OTP_LENGTH).fill(""));
        setSecondsLeft(OTP_WINDOW_SECONDS);
        setTimeout(() => inputsRef.current[0]?.focus(), 200);
      } else {
        toast.error(data?.message || "Failed to send code");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      if (data?.success) {
        toast.success("New code sent");
        setOtp(Array(OTP_LENGTH).fill(""));
        setSecondsLeft(OTP_WINDOW_SECONDS);
        setTimeout(() => inputsRef.current[0]?.focus(), 200);
      } else {
        toast.error(data?.message || "Could not resend");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  // ---------- STEP 2: OTP ----------
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
    for (let i = 0; i < Math.min(OTP_LENGTH, text.length); i++) next[i] = text[i];
    setOtp(next);
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) return toast.error(`Enter the ${OTP_LENGTH}-digit code`);

    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-reset-otp`, {
        email,
        otp: code,
      });
      if (data?.success) {
        toast.success("OTP verified successfully");
        setResetToken(data.resetToken); // backend must return this
        setStep(3);
      } else {
        toast.error(data?.message || "Invalid or expired code");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  // ---------- STEP 3: NEW PASSWORD ----------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword)
      return toast.error("Please fill all fields");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        resetToken,
        newPassword,
        confirmPassword,
      });
      if (data?.success) {
        toast.success("Password reset successfully!");
        navigate("/login");
      } else toast.error(data?.message || "Reset failed");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  // ---------- RENDER ----------
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
        <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center mb-5">
          Reset Your Password
        </h2>

        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <div className={inputWrap}>
              <input
                type="email"
                className={input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              className="py-2 rounded-full text-sm font-semibold transition cursor-pointer active:scale-[0.98] text-white bg-gradient-to-r from-blue-600 to-purple-900 hover:opacity-90 w-full"
            >
              Send Code
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <div>
            <p className="text-sm text-indigo-200/90 mb-3">
              Enter the 6-digit code sent to{" "}
              <span className="text-white font-medium">{email}</span>
            </p>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-4 text-indigo-300 hover:underline text-sm"
            >
              Edit email address
            </button>

            {/* Stylish OTP Inputs */}
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

            {/* Countdown + actions */}
            {secondsLeft > 0 ? (
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs sm:text-sm text-indigo-200/90">
                  Code expires in <span className="text-white font-semibold">{mm}:{ss}</span>
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
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <p className="text-sm text-indigo-200/90 mb-3">
              Enter and confirm your new password
            </p>

            <div className={inputWrap}>
              <input
                type="password"
                className={input}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className={inputWrap}>
              <input
                type="password"
                className={input}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="py-2.5 rounded-full text-sm font-semibold transition cursor-pointer active:scale-[0.98] text-white bg-gradient-to-r from-purple-600 to-indigo-800 hover:opacity-90 w-full"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
