import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { TbRefresh } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";
import OTPLogin from "./OTPLogin";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const AdminLogin = () => {
  const [emailorphone, setEmailorphone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCaptcha, setGeneratedCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [emailorphoneError, setEmailorphoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpLogin, setShowOtpLogin] = useState(false);

  const { login, hasRole } = useContext(AuthContext);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const chars =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars[Math.floor(Math.random() * chars.length)];
    }
    setGeneratedCaptcha(captcha);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailorphoneError("");
    setPasswordError("");
    setCaptchaError("");

    let isValid = true;
    if (captchaInput !== generatedCaptcha) {
      setCaptchaError("Captcha is incorrect. Please try again.");
      isValid = false;
    }

    if (!emailorphone) {
      setEmailorphoneError("Email or phone is required.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    }

    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/login`,
        {
          mobileNumber: emailorphone,
          password,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      login(token, user);
      hasRole(user.designation);
      navigate("/admin/dashboard");
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("Invalid credentials")) {
          setEmailorphoneError("Invalid email or phone number.");
          setPasswordError("Invalid password.");
        } else {
          setEmailorphoneError(errorMessage);
          setPasswordError(errorMessage);
        }
      } else {
        console.error("Login failed", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = () => {
    setShowOtpLogin(true);
  };

  return (
    <div>
      <form
        className="flex flex-col sm:gap-5 lg:gap-2 xl:gap-8"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-2 font-semibold text-[#FF2722]">
          <label className="text-sm text-[#777777]">
            Mobile Number/ Email ID:
          </label>
          <input
            type="text"
            value={emailorphone}
            onChange={(e) => setEmailorphone(e.target.value)}
            className="bg-[white] text-[black] rounded-sm sm:h-[2.5rem] xl:h-[3.5rem] border border-[#cccccc] p-2 text-lg focus:outline-[#5BC0DE] focus:outline-none"
          />
          {emailorphoneError && (
            <div className="text-[#777777] text-sm mt-1">
              {emailorphoneError}
            </div>
          )}
        </div>
        <div className="flex flex-col font-semibold text-[#FF2722] gap-2">
          <label className="text-sm text-[#777777]">Password:</label>
          <div className="flex sm:h-[2.5rem] xl:h-[3.5rem] w-full items-center justify-between rounded-sm bg-[white] border border-[#cccccc]">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[white] border border-[#cccccc] rounded-sm sm:h-[2.5rem]  border-r-0 xl:h-[3.5rem] p-2 w-full text-black text-lg focus:outline-[#5BC0DE] focus:outline-none"
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="mr-4 h-5 w-5 text-black cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
          {passwordError && (
            <div className="text-[#777777] text-sm mt-1">{passwordError}</div>
          )}
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-[#777777]">Captcha</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="bg-[white] rounded-sm sm:h-[2.5rem] border border-[#cccccc] xl:h-[3.5rem] p-2 w-full text-black text-lg focus:outline-[#5BC0DE] focus:outline-none"
              />
              {captchaError && (
                <div className="text-[#777777] text-sm mt-1">
                  {captchaError}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full buttonshine rounded-sm sm:h-[2.5rem] xl:h-[3.5rem] flex justify-center items-center text-[#FF2722] text-lg font-medium bg-[#FF27221A]"
            >
              {loading ? "Wait..." : "Login"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <span className="flex justify-center text-sm items-center text-[#FF2722] p-2 rounded-md font-semibold">
                {generatedCaptcha}
              </span>
              <button
                type="button"
                onClick={generateCaptcha}
                className="text-[#777777] text-xl font-semibold underline"
              >
                <TbRefresh />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="" id="" />
              <span className="text-[#777777]">Keep me signed in.</span>
            </div>
          </div>
        </div>
      </form>
      <div className="flex flex-col text-[#777777] gap-1 items-start font-medium">
        {/* <button
          className="text-[#777777] hover:text-[#FF2722]"
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot my password
        </button> */}
        <button
          className="text-[#777777] hover:text-[#FF2722]"
          type="button"
          onClick={handleOtpLogin}
        >
          Login With OTP
        </button>
      </div>
      {/* {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )} */}
      {showOtpLogin && <OTPLogin onClose={() => setShowOtpLogin(false)} />}
    </div>
  );
};

export default AdminLogin;
