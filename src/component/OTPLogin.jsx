import axios from "axios";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const OTPLogin = ({ onClose }) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  const handleCheckNumber = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/users/checknumber`,
        {
          params: { phone: mobileNumber },
        }
      );

      if (response.data.exists) {
        sendOtp();
      } else {
        alert("Phone number not found. Please enter a valid number.");
      }
    } catch (error) {
      setError("Error checking mobile number.");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      setError("");

      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users/send-otp`, {
        phone: mobileNumber,
      });

      setStep(2);
    } catch (error) {
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpBackspace = (index, e) => {
    if (e.key === "Backspace" && index > 0) {
      let newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      otpRefs.current[index - 1].focus();
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");

    const otpCode = otp.join("");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/verify-with-otp`,
        { phone: mobileNumber, otp: otpCode }
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("name", response.data.user.name);
        localStorage.setItem("role", "admin");

        navigate("/admin/dashboard");

        onClose(); // Close the OTP modal
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      setError("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">OTP Login</h2>

        {/* Step 1: Mobile Number Input */}
        {step === 1 && (
          <>
            <label className="block text-sm mb-2">Enter Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              maxLength={10}
              minLength={10}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full p-2 border rounded focus:outline outline-green-800"
              placeholder="Enter your mobile number"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <button
              onClick={handleCheckNumber}
              className="w-full bg-[#FF2722] buttonshinehover transition-colors duration-300 hover:bg-blue-500 text-white p-2 mt-3 rounded"
            >
              {loading ? "Checking..." : "Send OTP"}
            </button>
          </>
        )}

        {/* Step 2: OTP Input */}
        {step === 2 && (
          <>
            <label className="block text-sm mb-2">Enter OTP</label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  value={digit}
                  maxLength="1"
                  className="w-10 h-10 border rounded text-center text-lg"
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpBackspace(index, e)}
                  ref={(el) => (otpRefs.current[index] = el)}
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <button
              onClick={verifyOtp}
              className="w-full bg-blue-500 buttonshinehover transition-colors duration-300 hover:bg-green-500 text-white p-2 mt-3 rounded"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        <button onClick={onClose} className="text-red-500 mt-3 w-full">
          Close
        </button>
      </div>
    </div>
  );
};

export default OTPLogin;
