import React, { useState, useEffect } from "react";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import Modal from "react-modal";

import AddAssignBusiness from "../component/adminbuisness/AddAssignBusiness";
import ManageAssignBusiness from "../component/adminbuisness/ManageAssignBusiness";

const AddAndManageAssignBusiness = () => {
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

  useEffect(() => {
    if (shouldRefresh) {
      // Reset the refresh state after triggering
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

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
          <ManageAssignBusiness shouldRefresh={shouldRefresh} />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Business Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        <AddAssignBusiness
          closeModal={closeModal}
          triggerRefresh={triggerRefresh}
        />
      </Modal>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageAssignBusiness;
