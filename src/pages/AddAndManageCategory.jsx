import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import ManageCategory from "../component/adminbuisness/ManageCategory";

const AddAndManageCategory = () => {
  const [categoryname, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/category/get`
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/category/create`,
        { categoryname }
      );

      if (response.status === 201) {
        setMessage(response.data.message);
        setCategoryName("");

        setCategories((prevCategories) => [
          ...prevCategories,
          response.data.newCategory,
        ]);
      } else {
        setMessage(response.data.error || "Failed to create Category");
      }
    } catch (error) {
      console.error("Error creating Category:", error);
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
          <label className="text-lg text-black">Category Name</label>
          <div className="w-full flex items-center gap-4">
            <input
              type="text"
              value={categoryname}
              onChange={(e) => setCategoryName(e.target.value)}
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
          {error && <p className="text-red-600">{error}</p>}{" "}
          {/* Display error */}
          {message && <p className="text-black">{message}</p>}
        </form>
        <div>
          <ManageCategory
            categories={categories}
            setCategories={setCategories}
          />
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageCategory;
