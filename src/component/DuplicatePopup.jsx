import React from "react";

const DuplicatePopup = ({ isOpen, onClose, duplicates }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white h-[80vh] overflow-scroll no-scrollbar rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Duplicate Numbers Found</h2>
        <p className="mb-4">
          The following mobile numbers are already saved in the database:
        </p>
        <ul className="list-disc list-inside mb-4">
          {duplicates.map((number, index) => (
            <li key={index}>{number}</li>
          ))}
        </ul>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicatePopup;
