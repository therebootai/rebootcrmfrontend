import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TagAppointmentPopup = ({ businessId, onClose }) => {
  const [bdeList, setBdeList] = useState([]);
  const [selectedBdeId, setSelectedBdeId] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // State for the selected appointment date

  useEffect(() => {
    const fetchBdeList = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/bde/get`
        );
        setBdeList(response.data);
      } catch (error) {
        console.error("Error fetching BDE list:", error);
      }
    };

    fetchBdeList();
  }, []);

  const handleTagAppointment = async () => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/business/tagappointment/${businessId}`,
        {
          bdeId: selectedBdeId,
          appointmentDate: selectedDate, // Send the selected date to the backend
        }
      );
      onClose(); // Close the popup after successful update
    } catch (error) {
      console.error("Error updating business:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md w-[300px]">
        <h2 className="text-lg font-semibold mb-4">Tag Appointment</h2>
        <select
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          value={selectedBdeId}
          onChange={(e) => setSelectedBdeId(e.target.value)}
        >
          <option value="" disabled>
            Select BDE
          </option>
          {bdeList.map((bde) => (
            <option key={bde.bdeId} value={bde.bdeId}>
              {bde.bdename}
            </option>
          ))}
        </select>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)} // Update state on change
          showTimeSelect
          dateFormat="Pp"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md" // Custom styling
          placeholderText="Select date and time"
        />
      </div>
    </div>
  );
};

export default TagAppointmentPopup;
