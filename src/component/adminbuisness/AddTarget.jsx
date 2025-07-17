import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddTarget = ({ closeModal }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [targetDate, setTargetDate] = useState(new Date());
  const [targetAmount, setTargetAmount] = useState("");

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

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handleAmountChange = (e) => {
    setTargetAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const employee = employees.find((emp) => emp.name === selectedEmployee);

    if (!employee) {
      alert("Please select a valid employee.");
      return;
    }

    const targetMonth = targetDate.toLocaleString("default", { month: "long" });
    const targetYear = targetDate.getFullYear();

    const urlMap = {
      Telecaller: `/api/telecaller/addTarget/${employee.id}`,
      "Digital Marketer": `/api/digitalmarketer/addTarget/${employee.id}`,
      BDE: `/api/bde/addTarget/${employee.id}`,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}${urlMap[employee.role]}`,
        {
          month: targetMonth,
          year: targetYear,
          amount: targetAmount,
        }
      );
      setTargetDate(new Date());
      setTargetAmount("");
      setSelectedEmployee("");
      closeModal(); // Close the modal after successful submission
    } catch (error) {
      console.error("Error adding target:", error);
      alert("Error adding target");
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
          <div className="text-transparent">submit</div>
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
