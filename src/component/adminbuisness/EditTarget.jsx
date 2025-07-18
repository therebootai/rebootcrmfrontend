import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditTarget = ({ user, onClose, onUpdate, updateDate }) => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [targetDate, setTargetDate] = useState(new Date()); // Initialize with the current date
  const [targetAmount, setTargetAmount] = useState("");
  const [achievements, setAchievements] = useState("");

  useEffect(() => {
    // Only proceed if user data is available
    if (user) {
      setSelectedEmployee(user.name);

      let targetToLoad = null;

      // 1. Prioritize finding a target based on updateDate if it's provided
      if (updateDate) {
        const dateObj = new Date(updateDate);
        // Ensure dateObj is a valid date before proceeding
        if (!isNaN(dateObj.getTime())) {
          const updateMonth = dateObj.toLocaleString("en-IN", {
            month: "long",
          });
          const updateYear = dateObj.getFullYear();

          // Assuming user.targets is an array of target objects
          if (user.targets && Array.isArray(user.targets)) {
            targetToLoad = user.targets.find(
              (target) =>
                target.month === updateMonth && target.year === updateYear
            );
            // If a target is found for updateDate, set the targetDate state to updateDate
            if (targetToLoad) {
              setTargetDate(dateObj);
            }
          }
        }
      }

      // 2. If no specific target was found via updateDate,
      //    fall back to user.lastTarget if it exists
      if (!targetToLoad && user.lastTarget) {
        targetToLoad = user.lastTarget;
        // Construct the date for lastTarget to set targetDate state
        const { month, year } = user.lastTarget;
        setTargetDate(new Date(`${month} 1, ${year}`));
      }

      // 3. Apply the found target data (or default empty if none)
      if (targetToLoad) {
        setTargetAmount(targetToLoad.amount);
        setAchievements(targetToLoad.achievement);
      } else {
        // If no target was found at all (neither by updateDate nor lastTarget),
        // reset the form fields to empty/initial state
        setTargetAmount("");
        setAchievements("");
        if (!updateDate) {
          // Only clear targetDate if we weren't trying to set it from updateDate
          setTargetDate(null);
        }
      }
    }
  }, [user, updateDate]);

  const handleAmountChange = (e) => {
    setTargetAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetMonth = targetDate.toLocaleString("default", { month: "long" });
    const targetYear = targetDate.getFullYear();

    const urlMap = {
      Telecaller: `/api/telecaller/updatetarget/${user.telecallerId}`,
      "Digital Marketer": `/api/digitalmarketer/updatetarget/${user.digitalMarketerId}`,
      BDE: `/api/bde/updatetarget/${user.bdeId}`,
    };

    const targetId = user.targets.find(
      (target) => target.month === targetMonth && target.year === targetYear
    )?._id;

    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}${urlMap[user.role]}`, {
        targetId,
        month: targetMonth,
        year: targetYear,
        amount: targetAmount,
        achievement: achievements,
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
            onChange={(date) => {
              setTargetDate(date);
              if (user) {
                setSelectedEmployee(user.name);

                let targetToLoad = null;

                // 1. Prioritize finding a target based on updateDate if it's provided
                if (date) {
                  const dateObj = new Date(date);
                  // Ensure dateObj is a valid date before proceeding
                  if (!isNaN(dateObj.getTime())) {
                    const updateMonth = dateObj.toLocaleString("en-IN", {
                      month: "long",
                    });
                    const updateYear = dateObj.getFullYear();

                    // Assuming user.targets is an array of target objects
                    if (user.targets && Array.isArray(user.targets)) {
                      targetToLoad = user.targets.find(
                        (target) =>
                          target.month === updateMonth &&
                          target.year === updateYear
                      );
                    }
                  }
                }

                if (targetToLoad) {
                  setTargetAmount(targetToLoad.amount);
                  setAchievements(targetToLoad.achievement);
                } else {
                  setTargetAmount("");
                  setAchievements("");
                }
              }
            }}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            className="bg-white rounded-sm p-4 border border-[#cccccc] w-full"
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
          <label>Enter Monthly Target Achievements (in INR)</label>
          <input
            type="number"
            name="achievements"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
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
