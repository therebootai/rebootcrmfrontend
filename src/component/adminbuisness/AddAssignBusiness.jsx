import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddAssignBusiness = ({ closeModal, triggerRefresh }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [targetDate, setTargetDate] = useState(new Date());
  const [targetAmount, setTargetAmount] = useState("");
  const [citys, setCity] = useState([]);
  const [categories, setCategory] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [telecallers, digitalMarketers, bdes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/telecaller/get`),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/digitalmarketer/get`),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/bde/get`),
        ]);

        const combinedData = [
          ...telecallers.data.map((item) => ({
            ...item,
            role: "Telecaller",
            name: item.telecallername,
            id: item.telecallerId,
          })),
          ...digitalMarketers.data.map((item) => ({
            ...item,
            role: "Digital Marketer",
            name: item.digitalMarketername,
            id: item.digitalMarketerId,
          })),
          ...bdes.data.map((item) => ({
            ...item,
            role: "BDE",
            name: item.bdename,
            id: item.bdeId,
          })),
        ];

        setEmployees(combinedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAssign = async () => {
      try {
        const cityResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/city/get?sorting=true`
        );
        setCity(cityResponse.data);

        const categoryResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/category/get?sorting=true`
        );
        setCategory(categoryResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAssign();
  }, []);

  // Handler functions
  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const employee = employees.find((emp) => emp.name === selectedEmployee);

    if (!employee) {
      alert("Please select a valid employee.");
      return;
    }

    const urlMap = {
      Telecaller: `/api/telecaller/assignBusiness/${employee.id}`,
      "Digital Marketer": `/api/digitalmarketer/assignBusiness/${employee.id}`,
      BDE: `/api/bde/assignBusiness/${employee.id}`,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}${urlMap[employee.role]}`,
        {
          category: selectedCategory,
          city: selectedCity,
        }
      );

      setSelectedEmployee("");
      setSelectedCity("");
      setSelectedCategory("");

      // Close the modal and trigger a refresh of the table data
      triggerRefresh();
      closeModal();
    } catch (error) {
      console.error("Error assigning business:", error);
      alert("Error assigning business");
    }
  };

  return (
    <div className="p-4 flex flex-col w-full gap-6">
      <form
        className="grid sm:grid-cols-1 w-full md:grid-cols-2 sm:gap-4 xl:gap-8"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col">
          <label>Name</label>
          <select
            name="employeename"
            value={selectedEmployee}
            onChange={handleEmployeeChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          >
            <option value="">Choose</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.name}>
                {employee.name} - {employee.role}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label>City/Town</label>
          <select
            name="city"
            value={selectedCity}
            onChange={handleCityChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          >
            <option value="">Choose</option>
            {citys.map((city) => (
              <option key={city.cityId} value={city.cityname}>
                {city.cityname}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label>Business Category</label>
          <select
            name="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          >
            <option value="">Choose</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryname}>
                {category.categoryname}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <div className="text-transparent">submit</div>
          <button
            type="submit"
            className="w-[50%] bg-[#FF27221A] p-4 flex justify-center items-center text-[#FF2722] text-base rounded-sm"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAssignBusiness;
