import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

Modal.setAppElement("#root");

const BdeMarkVisit = ({ show, onClose, business, onUpdate }) => {
  const [status, setStatus] = useState("");
  const [followUpDate, setFollowUpDate] = useState(
    business.followUpDate ? new Date(business.followUpDate) : null
  );
  const [remarks, setRemarks] = useState("");

  const handleUpdate = async () => {
    try {
      // Update business details
      const updatedBusiness = {
        status: "Visited",
        followUpDate: followUpDate ? followUpDate.toISOString() : null,
        visit_result: {
          reason: status,
          follow_up_date: followUpDate ? followUpDate.toISOString() : null,
          visit_time: new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
        },
        remarks,
      };

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/business/update/${
          business.businessId
        }`,
        updatedBusiness
      );

      onUpdate({
        ...business,
        ...updatedBusiness,
      });

      onClose();
    } catch (error) {
      console.error("Error updating business or tagging appointment:", error);
    }
  };

  return (
    <Modal
      isOpen={show}
      onRequestClose={onClose}
      className="bg-white rounded-lg p-6 xl:w-[30%] lg:w-[35%] md:w-[50%] sm:w-[80%] mx-auto mt-20 shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <h2 className="text-2xl font-semibold mb-4">Visit Remarks</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Choose Result</option>
          <option value="Followup">Follow Up</option>
          <option value="Not Interested">Not Interested</option>
          <option value="Deal Closed">Deal Closed</option>
        </select>
      </div>

      {status === "Followup" && (
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

      {status !== "" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks
          </label>
          <input
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-black rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Save
        </button>
      </div>
    </Modal>
  );
};

export default BdeMarkVisit;
