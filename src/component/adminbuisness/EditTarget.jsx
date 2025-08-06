import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditTarget = ({ user, onClose, onUpdate, updateDate }) => {
  // Initialize targetDate with updateDate if provided, otherwise current date
  const initialTargetDate = updateDate ? new Date(updateDate) : new Date();

  const [targetDate, setTargetDate] = useState(initialTargetDate);
  const [targetAmount, setTargetAmount] = useState(""); // For targets.amount
  const [salesAchievement, setSalesAchievement] = useState(""); // For targets.achievement
  const [collectionAmount, setCollectionAmount] = useState(""); // For targets.collection
  const [errors, setErrors] = useState({});

  // Function to find and set target/achievement/collection for the currently selected month/year
  const loadTargetForSelectedDate = useCallback(() => {
    if (!user || !targetDate) {
      setTargetAmount("");
      setSalesAchievement("");
      setCollectionAmount("");
      return;
    }

    const currentMonth = targetDate.toLocaleString("default", {
      month: "long",
    });
    const currentYear = targetDate.getFullYear();

    const foundTarget = user.targets?.find(
      (target) => target.month === currentMonth && target.year === currentYear
    );

    if (foundTarget) {
      setTargetAmount(foundTarget.amount || "");
      setSalesAchievement(foundTarget.achievement || "");
      setCollectionAmount(foundTarget.collection || "");
    } else {
      // If no target exists for the selected month/year, clear the fields
      setTargetAmount("");
      setSalesAchievement("");
      setCollectionAmount("");
    }
  }, [user, targetDate]);

  // Effect to load target data when user or initialTargetDate changes
  useEffect(() => {
    loadTargetForSelectedDate();
  }, [user, loadTargetForSelectedDate]);

  const handleTargetAmountChange = (e) => {
    setTargetAmount(e.target.value);
    setErrors((prev) => ({ ...prev, targetAmount: "" }));
  };

  const handleSalesAchievementChange = (e) => {
    setSalesAchievement(e.target.value);
    setErrors((prev) => ({ ...prev, salesAchievement: "" }));
  };

  const handleCollectionAmountChange = (e) => {
    setCollectionAmount(e.target.value);
    setErrors((prev) => ({ ...prev, collectionAmount: "" }));
  };

  const handleDateChange = (date) => {
    setTargetDate(date);
    setErrors((prev) => ({ ...prev, targetDate: "" }));
    // The `loadTargetForSelectedDate` useCallback will be triggered by `targetDate` dependency
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    let formValid = true;

    if (
      !targetAmount ||
      isNaN(parseFloat(targetAmount)) ||
      parseFloat(targetAmount) < 0
    ) {
      newErrors.targetAmount = "Target amount must be a non-negative number.";
      formValid = false;
    }
    if (
      salesAchievement &&
      (isNaN(parseFloat(salesAchievement)) || parseFloat(salesAchievement) < 0)
    ) {
      newErrors.salesAchievement =
        "Sales achievement must be a non-negative number.";
      formValid = false;
    }
    if (
      collectionAmount &&
      (isNaN(parseFloat(collectionAmount)) || parseFloat(collectionAmount) < 0)
    ) {
      newErrors.collectionAmount =
        "Collection amount must be a non-negative number.";
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

    const targetMonth = targetDate.toLocaleString("default", { month: "long" });
    const targetYear = targetDate.getFullYear();

    const updatedTarget = {
      month: targetMonth,
      year: targetYear,
      amount: parseFloat(targetAmount),
      achievement: parseFloat(salesAchievement) || 0,
      collection: parseFloat(collectionAmount) || 0,
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/users/users/${user._id}`,
        {
          targets: [updatedTarget], // Backend's updateUser handles merging/adding this target
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        alert(
          "Target, sales achievement, and collection updated successfully!"
        );
        onClose();
        onUpdate();
      } else {
        alert(response.data.message || "Failed to update target.");
      }
    } catch (error) {
      console.error(
        "Error updating target:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message ||
          "Error updating target. Please try again."
      );
    }
  };

  return (
    <div className="p-4 flex flex-col w-full gap-6">
      <h2 className="text-xl font-semibold mb-4">
        Edit Target for {user?.name}
      </h2>
      <form
        className="grid sm:grid-cols-1 w-full md:grid-cols-2 sm:gap-4 xl:gap-8"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col">
          <label>Employee Name</label>
          <input
            name="employeename"
            value={user?.name || ""}
            readOnly
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
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
          <label>Monthly Target Amount (in INR)</label>
          <input
            type="number"
            name="targetAmount"
            value={targetAmount}
            onChange={handleTargetAmountChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
            min="0"
          />
          {errors.targetAmount && (
            <span className="text-red-500">{errors.targetAmount}</span>
          )}
        </div>

        <div className="flex flex-col">
          <label>Sales Achievement (in INR)</label>
          <input
            type="number"
            name="salesAchievement"
            value={salesAchievement}
            onChange={handleSalesAchievementChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
            min="0"
          />
          {errors.salesAchievement && (
            <span className="text-red-500">{errors.salesAchievement}</span>
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
          <div className="text-transparent">submit</div>
          <button
            type="submit"
            className="w-[50%] bg-[#0a5cff20] p-4 flex justify-center items-center text-[#0A5BFF] text-xl font-medium rounded-sm"
          >
            Update Target
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTarget;
