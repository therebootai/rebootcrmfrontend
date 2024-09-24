import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditTarget = ({ user, onClose, onUpdate }) => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [targetDate, setTargetDate] = useState(new Date()); // Initialize with the current date
  const [targetAmount, setTargetAmount] = useState("");

  useEffect(() => {
    // When the component is mounted, pre-populate the form with existing data
    if (user) {
      setSelectedEmployee(user.name); // Set the selected employee name
      if (user.lastTarget) {
        const { month, year, amount } = user.lastTarget;
        const existingDate = new Date(`${month} 1, ${year}`); // Construct the date from month and year
        setTargetDate(existingDate);
        setTargetAmount(amount);
      }
    }
  }, [user]);

  const handleAmountChange = (e) => {
    setTargetAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetMonth = targetDate.toLocaleString("default", { month: "long" });
    const targetYear = targetDate.getFullYear();

    const urlMap = {
      Telecaller: `/api/telecaller/addTarget/${user.id}`,
      "Digital Marketer": `/api/digitalmarketer/addTarget/${user.id}`,
      BDE: `/api/bde/addTarget/${user.id}`,
    };

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}${urlMap[user.role]}`, {
        month: targetMonth,
        year: targetYear,
        amount: targetAmount,
      });
      alert("Target updated successfully");
      onClose(); // Close the modal after successful update
      onUpdate(); // Trigger a refresh of the data in the parent component
    } catch (error) {
      console.error("Error updating target:", error);
      alert("Error updating target");
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
          <input
            name="employeename"
            value={selectedEmployee}
            readOnly
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
        </div>
        <div className="flex flex-col">
          <label>Select Month and Year</label>
          <DatePicker
            selected={targetDate}
            onChange={(date) => setTargetDate(date)}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
        </div>
        <div className="flex flex-col">
          <label>Enter Monthly Target Amount (in INR)</label>
          <input
            type="number"
            name="targetamount"
            value={targetAmount}
            onChange={handleAmountChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
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

export default EditTarget;
