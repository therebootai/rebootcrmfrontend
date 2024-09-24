import React, { useState } from "react";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import Modal from "react-modal";
import AddTarget from "../component/adminbuisness/AddTarget";
import ManageTarget from "../component/adminbuisness/ManageTarget";

const AddAndManageTarget = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const triggerRefresh = () => {
    setShouldRefresh(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    triggerRefresh(); // Trigger a refresh when the modal is closed after adding a target
  };

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4 p-4">
        <div className="py-6 flex border-b border-[#cccccc] items-center flex-wrap gap-6">
          <div
            className="px-2 p-1 bg-[#FF2722] text-white rounded-md text-sm font-medium cursor-pointer"
            onClick={openModal}
          >
            ADD
          </div>
        </div>
        <div>
          <ManageTarget
            shouldRefresh={shouldRefresh}
            setShouldRefresh={setShouldRefresh}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        contentLabel="Add Target Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={handleModalClose} className="close-button">
          &times;
        </button>
        <AddTarget closeModal={handleModalClose} />
      </Modal>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageTarget;
