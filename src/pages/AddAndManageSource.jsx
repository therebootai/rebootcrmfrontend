import React, { useState } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import ManageSource from "../component/adminbuisness/ManageSource";

const AddAndManageSource = () => {
  const [sourcename, setsourcename] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/source/create`,
        { sourcename }
      );

      if (response.status === 201) {
        setMessage(response.data.message);
        setsourcename(""); // Clear the input field after successful submission
        window.location.reload();
      } else {
        setMessage(response.data.error || "Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      setError(error.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDashboardTemplate>
      <div className="p-4 flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
          <label className="text-lg text-black">Enter Source Name</label>
          <div className="w-full flex items-center gap-4">
            <input
              type="text"
              value={sourcename}
              onChange={(e) => setsourcename(e.target.value)}
              className="xl:w-[40%] lg:w-[50%] sm:w-[60%] h-[3.5rem] p-2 focus:outline-none outline-[#191919] bg-[white] text-black rounded-sm border border-[#CCCCCC]"
            />
            <button
              type="submit"
              disabled={loading}
              className="xl:w-[15%] lg:w-[25%] sm:w-[30%] h-[3.5rem] bg-[#FF27221A] rounded-sm text-lg text-[#FF2722] font-medium flex justify-center items-center"
            >
              {loading ? "Uploading..." : "Submit"}
            </button>
          </div>
          {message && <p className="text-white">{message}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </form>
      </div>
      <ManageSource />
    </AdminDashboardTemplate>
  );
};

export default AddAndManageSource;
