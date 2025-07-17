import React, { useState } from "react";
import Modal from "react-modal";
import AddTarget from "../adminbuisness/AddTarget";
const EmployeeSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const headers = [
    "Employee Name",
    "Role",
    "Appointment",
    "Visit",
    "Deal Close",
    "Target",
    "Sales",
    "Collection",
    "Achievement",
  ];
  return (
    <div className=" flex flex-col gap-4">
      <div className=" flex flex-row gap-6 items-center">
        <h1 className="text-[#777777] text-lg font-semibold">Filter</h1>
        <button
          onClick={openModal}
          className=" h-[2rem] px-6 flex justify-center items-center bg-[#0A5BFF] rounded-md text-sm font-medium text-white"
        >
          Add Target
        </button>
      </div>
      <div className=" flex flex-col gap-2">
        <div className="flex gap-2">
          {headers.map((header, index) => (
            <div key={index} className="flex-1 text-center text-sm font-medium">
              {header}
            </div>
          ))}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Target Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        <AddTarget closeModal={closeModal} />
      </Modal>
    </div>
  );
};

export default EmployeeSection;
