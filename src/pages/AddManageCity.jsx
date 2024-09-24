import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import ManageCityAndTown from "../component/adminbuisness/ManageCityAndTown";

const AddManageCity = () => {
  const [cityname, setCityName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cities, setCities] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/city/get`
      );
      setCities(response.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/city/create`,
        { cityname }
      );

      if (response.status === 201) {
        setMessage(response.data.message);
        setCityName("");
        // Add the new city to the cities state
        setCities((prevCities) => [...prevCities, response.data.newCity]);
      } else {
        setMessage(response.data.error || "Failed to create city");
      }
    } catch (error) {
      console.error("Error creating city:", error);
      setError(error.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDashboardTemplate>
      <div className="p-4 flex flex-col gap-6 ">
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-2  py-4"
        >
          <label className="text-lg text-black">City/Town Name</label>
          <div className="w-full flex items-center gap-4">
            <input
              type="text"
              value={cityname}
              onChange={(e) => setCityName(e.target.value)}
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
          {message && <p className="text-black">{message}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </form>
        <div>
          <ManageCityAndTown cities={cities} setCities={setCities} />
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default AddManageCity;
