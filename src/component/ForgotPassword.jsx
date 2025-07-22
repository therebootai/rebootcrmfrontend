import axios from "axios";
import React, { useRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ForgotPassword = ({ onClose }) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const otpRefs = useRef([]);

  // Check if mobile number exists in the backend
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
      console.error("Error checking number:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const sendOtp = async () => {
    try {
      setLoading(true);
      setError("");

      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users/send-otp`, {
        phone: mobileNumber,
      });

      setStep(2); // Move to OTP input step
    } catch (error) {
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Allow only digits

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if filled
    if (value !== "" && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace
  const handleOtpBackspace = (index, e) => {
    if (e.key === "Backspace" && index > 0) {
      let newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      otpRefs.current[index - 1].focus();
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    try {
      setLoading(true);
      setError("");

      const otpCode = otp.join(""); // Convert array to string
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/verify-otp`,
        { phone: mobileNumber, otp: otpCode }
      );

      if (response.data.success) {
        setStep(3); // Move to Reset Password step
      } else {
        setError("Invalid OTP. Try again.");
      }
    } catch (error) {
      setError("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/auth/reset-password`,
        {
          mobileNumber,
          newPassword,
        }
      );

      alert("Password reset successfully!");
      onClose(); // Close modal
    } catch (error) {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="max-w-md mx-auto relative overflow-hidden z-10 bg-white p-8 rounded-lg shadow-md before:w-24 before:h-24 before:absolute before:bg-[#FF2722] before:rounded-full before:-z-10 before:blur-2xl after:w-32 after:h-32 after:absolute after:bg-sky-400 after:rounded-full after:-z-10 after:blur-xl after:top-24 after:-right-12">
        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
        {step === 1 && (
          <>
            <label className="block text-sm mb-2">Enter Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              maxLength={10}
              minLength={10}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full p-2 border rounded focus:outline outline-green-800 border-none"
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
                  className="w-10 h-10 border rounded text-center text-lg focus:outline outline-green-800 border-none"
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
        {step === 3 && (
          <>
            <label className="block text-sm mb-2">New Password</label>
            <div className="flex items-center border p-2 rounded bg-white">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full outline-none"
                placeholder="Enter new password"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <label className="block text-sm mt-3 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded outline-none"
              placeholder="Re-enter password"
            />

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <button
              onClick={resetPassword}
              className="w-full bg-green-500 buttonshinehover transition-colors duration-300 hover:bg-green-800 text-white p-2 mt-3 rounded"
            >
              {loading ? "Updating..." : "Reset Password"}
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

export default ForgotPassword;
