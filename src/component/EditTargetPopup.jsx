import React, { useState } from "react";
import Modal from "react-modal";
import axios from "axios";

Modal.setAppElement("#root");

const EditTargetPopup = ({
  show,
  onClose,
  target,
  onUpdate,
  userId,
  userType,
}) => {
  const [month, setMonth] = useState(target.month || "");
  const [year, setYear] = useState(target.year || "");
  const [amount, setAmount] = useState(target.amount || "");
  const [achievement, setAchievement] = useState(target.achievement || "0");

  const handleUpdate = async () => {
    try {
      const updatedTarget = {
        _id: target._id, // Include the target ID in the updated target data
        month,
        year,
        amount,
        achievement,
      };

      // Dynamically set the URL based on user type
      const url = `${
        import.meta.env.VITE_BASE_URL
      }/api/${userType}/updatetarget/${userId}`;

      await axios.put(url, {
        targetId: target._id,
        ...updatedTarget,
      });

      onUpdate(updatedTarget); // Pass the full updated target back
      onClose();
    } catch (error) {
      console.error("Error updating target:", error);
    }
  };

  return (
    <Modal
      isOpen={show}
      onRequestClose={onClose}
      className="bg-white rounded-lg p-6 xl:w-[35%] lg:w-[40%] md:w-[55%] sm:w-[90%] mx-auto mt-20 shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Month
          </label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Achievement
          </label>
          <input
            type="text"
            value={achievement}
            onChange={(e) => setAchievement(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
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
      </div>
    </Modal>
  );
};

export default EditTargetPopup;
