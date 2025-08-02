import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddTarget = ({ closeModal, onUpdate }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(""); // Stores the user's _id
  const [targetDate, setTargetDate] = useState(new Date());
  const [targetAmount, setTargetAmount] = useState("");
  const [achievementAmount, setAchievementAmount] = useState(""); // New state for collection/achievement
  const [collectionAmount, setCollectionAmount] = useState("");
  const [errors, setErrors] = useState({});

  // Fetch all relevant employees (users) on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [telecallersRes, digitalMarketersRes, bdesRes] =
          await Promise.all([
            axios.get(
              `${
                import.meta.env.VITE_BASE_URL
              }/api/users/get?designation=Telecaller`
            ),
            axios.get(
              `${
                import.meta.env.VITE_BASE_URL
              }/api/users/get?designation=DigitalMarketer`
            ),
            axios.get(
              `${import.meta.env.VITE_BASE_URL}/api/users/get?designation=BDE`
            ),
          ]);

        // Combine users from all relevant designations
        const combinedUsers = [
          ...telecallersRes.data.users,
          ...digitalMarketersRes.data.users,
          ...bdesRes.data.users,
        ];
        setEmployees(combinedUsers);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        alert("Failed to load employee data.");
      }
    };

    fetchData();
  }, []);

  const handleEmployeeChange = (e) => {
    setSelectedEmployeeId(e.target.value);
    const selected = employees.find((emp) => emp._id === e.target.value);
    if (selected) {
      const currentMonth = targetDate.toLocaleString("default", {
        month: "long",
      });
      const currentYear = targetDate.getFullYear();

      const foundTarget = selected.targets?.find(
        (target) => target.month === currentMonth && target.year === currentYear
      );
      if (foundTarget) {
        setTargetAmount(foundTarget.amount || "");
        setAchievementAmount(foundTarget.achievement || "");
        setCollectionAmount(foundTarget.collection || "");
      } else {
        // If no target exists for the selected month/year, clear the fields
        setTargetAmount("");
        setAchievementAmount("");
        setCollectionAmount("");
      }
    }
    setErrors((prev) => ({ ...prev, employee: "" })); // Clear error
  };

  const handleAmountChange = (e) => {
    setTargetAmount(e.target.value);
    setErrors((prev) => ({ ...prev, targetAmount: "" })); // Clear error
  };

  const handleAchievementChange = (e) => {
    setAchievementAmount(e.target.value);
    setErrors((prev) => ({ ...prev, achievementAmount: "" })); // Clear error
  };

  const handleCollectionAmountChange = (e) => {
    setCollectionAmount(e.target.value);
    setErrors((prev) => ({ ...prev, collectionAmount: "" }));
  };

  const handleDateChange = (date) => {
    setTargetDate(date);
    const selected = employees.find((emp) => emp._id === selectedEmployeeId);
    if (selected) {
      const currentMonth = date.toLocaleString("default", {
        month: "long",
      });
      const currentYear = date.getFullYear();

      const foundTarget = selected.targets?.find(
        (target) => target.month === currentMonth && target.year === currentYear
      );
      if (foundTarget) {
        setTargetAmount(foundTarget.amount || "");
        setAchievementAmount(foundTarget.achievement || "");
        setCollectionAmount(foundTarget.collection || "");
      } else {
        // If no target exists for the selected month/year, clear the fields
        setTargetAmount("");
        setAchievementAmount("");
        setCollectionAmount("");
      }
    }
    setErrors((prev) => ({ ...prev, targetDate: "" })); // Clear error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    let formValid = true;

    if (!selectedEmployeeId) {
      newErrors.employee = "Please select an employee.";
      formValid = false;
    }
    if (
      !targetAmount ||
      isNaN(parseFloat(targetAmount)) ||
      parseFloat(targetAmount) <= 0
    ) {
      newErrors.targetAmount = "Target amount must be a positive number.";
      formValid = false;
    }
    // Achievement amount is optional, but if entered, validate it
    if (
      achievementAmount &&
      (isNaN(parseFloat(achievementAmount)) ||
        parseFloat(achievementAmount) < 0)
    ) {
      newErrors.achievementAmount =
        "Achievement amount must be a non-negative number.";
      formValid = false;
    }
    if (!targetDate) {
      newErrors.targetDate = "Please select a month and year.";
      formValid = false;
    }

    setErrors(newErrors);
    if (!formValid) {
      return;
    }

    const employee = employees.find((emp) => emp._id === selectedEmployeeId);

    if (!employee) {
      alert("Selected employee not found. Please try again.");
      return;
    }

    const targetMonth = targetDate.toLocaleString("default", { month: "long" });
    const targetYear = targetDate.getFullYear();

    // The target object to be sent to the backend
    const newTarget = {
      month: targetMonth,
      year: targetYear,
      amount: parseFloat(targetAmount), // Ensure it's a number
      achievement: parseFloat(achievementAmount) || 0, // Default to 0 if not provided
      collection: parseFloat(collectionAmount) || 0,
    };

    try {
      // Send the new/updated target to the unified user update endpoint
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/users/users/${employee._id}`,
        {
          targets: [newTarget], // Send as an array, backend handles merging
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is sent
          },
        }
      );

      if (response.status === 200) {
        alert("Target and achievement updated successfully!");
        setTargetDate(new Date());
        setTargetAmount("");
        setAchievementAmount("");
        setSelectedEmployeeId("");
        setErrors({}); // Clear errors on success
        onUpdate(); // Trigger parent to refresh data
        closeModal(); // Close the modal
      } else {
        alert(response.data.message || "Failed to add target.");
      }
    } catch (error) {
      console.error(
        "Error adding target:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message ||
          "Error adding target. Please try again."
      );
    }
  };

  return (
    <div className="p-4 flex flex-col w-full gap-6">
      <form
        className="grid sm:grid-cols-1 w-full md:grid-cols-2 sm:gap-4 xl:gap-8"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col">
          <label>Select Employee</label>
          <select
            name="employee"
            value={selectedEmployeeId}
            onChange={handleEmployeeChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          >
            <option value="">Choose Employee</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name} - {employee.designation}
              </option>
            ))}
          </select>
          {errors.employee && (
            <span className="text-red-500">{errors.employee}</span>
          )}
        </div>

        <div className="flex flex-col">
          <label>Enter Monthly Target Amount (in INR)</label>
          <input
            type="number"
            name="targetAmount"
            value={targetAmount}
            onChange={handleAmountChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
            min="0"
          />
          {errors.targetAmount && (
            <span className="text-red-500">{errors.targetAmount}</span>
          )}
        </div>

        <div className="flex flex-col">
          <label>Enter Achieved Amount (in INR) (Optional)</label>
          <input
            type="number"
            name="achievementAmount"
            value={achievementAmount}
            onChange={handleAchievementChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
            min="0"
          />
          {errors.achievementAmount && (
            <span className="text-red-500">{errors.achievementAmount}</span>
          )}
        </div>

        <div className="flex flex-col">
          <label>Select Month and Year</label>
          <DatePicker
            selected={targetDate}
            onChange={handleDateChange}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            className="bg-white rounded-sm p-4 border border-[#cccccc] w-full"
          />
          {errors.targetDate && (
            <span className="text-red-500">{errors.targetDate}</span>
          )}
        </div>
        <div className="flex flex-col">
          <label>Collection Amount (in INR)</label>
          <input
            type="number"
            name="collectionAmount"
            value={collectionAmount}
            onChange={handleCollectionAmountChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
            min="0"
          />
          {errors.collectionAmount && (
            <span className="text-red-500">{errors.collectionAmount}</span>
          )}
        </div>

        <div className="flex flex-col">
          <div className="text-transparent">submit</div>{" "}
          {/* Placeholder for alignment */}
          <button
            type="submit"
            className="w-[50%] bg-[#0a5cff20] p-4 flex justify-center items-center text-[#0A5BFF] text-xl font-medium rounded-sm"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTarget;
