import React, { useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

Modal.setAppElement("#root");

const EditBusinessPopup = ({ show, onClose, business, onUpdate }) => {
  const [status, setStatus] = useState(business.status || "");
  const [followUpDate, setFollowUpDate] = useState(
    business.followUpDate ? new Date(business.followUpDate) : null
  );

  const handleUpdate = async () => {
    try {
      const updatedBusiness = {
        status,
        followUpDate: followUpDate ? followUpDate.toISOString() : null,
      };

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/business/update/${
          business.businessId
        }`,
        updatedBusiness
      );

      onUpdate(updatedBusiness);
      onClose();
    } catch (error) {
      console.error("Error updating business:", error);
    }
  };

  return (
    <Modal
      isOpen={show}
      onRequestClose={onClose}
      className="bg-white rounded-lg p-6 xl:w-[30%] lg:w-[35%] md:w-[50%] sm:w-[80%] mx-auto mt-20 shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <h2 className="text-2xl font-semibold mb-4">Edit Business</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="Fresh Data">Fresh Data</option>
          <option value="Appointment Generated">Appointment Generated</option>
          <option value="Followup">Follow Up</option>
          <option value="Not Interested">Not Interested</option>
          <option value="Invalid Data">Invalid Data</option>
          <option value="Deal Closed">Deal Closed</option>
          <option value="Not Responding">Not Responding</option>
          <option value="Appointment Pending">Appointment Pending</option>
        </select>
      </div>
      {(status === "Followup" || status === "Appointment Generated") && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Follow Up Date
          </label>
          <DatePicker
            selected={followUpDate}
            onChange={(date) => setFollowUpDate(date)}
            dateFormat="dd/MM/yyyy"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#777777] text-white rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-[#FF27221A] text-[#FF2722] border border-[#FF2722] rounded-md"
        >
          Update
        </button>
      </div>
    </Modal>
  );
};

export default EditBusinessPopup;
