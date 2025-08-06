import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

const AddAssignBusiness = ({ closeModal, triggerRefresh }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [citys, setCity] = useState([]);
  const [categories, setCategory] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [telecallersResponse, bdesResponse, digitalMarketersResponse] =
        await Promise.all([
          axios.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/api/users/get?designation=Telecaller`
          ),
          axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/users/get?designation=BDE`
          ),
          axios.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/api/users/get?designation=DigitalMarketer`
          ),
        ]);

      setEmployees([
        ...telecallersResponse.data.users,
        ...bdesResponse.data.users,
        ...digitalMarketersResponse.data.users,
      ]);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchAssign = async () => {
      try {
        const [citiesResponse, categoriesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/city/get`),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/category/get`),
        ]);
        setCity(citiesResponse.data);

        setCategory(categoriesResponse.data);
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

    const employee = employees.find((emp) => emp._id === selectedEmployee);

    if (!employee) {
      alert("Please select a valid employee.");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/users/users/${employee._id}`,
        {
          assignCategories: [
            ...employee.assignCategories.map((emp) => emp._id),
            selectedCategory,
          ],
          assignCities: [
            ...employee.assignCities.map((emp) => emp._id),
            selectedCity,
          ],
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
              <option key={employee._id} value={employee._id}>
                {employee.name} - {employee.designation}
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
              <option key={city._id} value={city._id}>
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
              <option key={category._id} value={category._id}>
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
