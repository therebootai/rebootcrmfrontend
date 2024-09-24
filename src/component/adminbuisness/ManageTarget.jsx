import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import Modal from "react-modal";
import EditTarget from "./EditTarget"; // Import the EditTarget component
import ViewTarget from "./ViewTarget"; // Import the ViewTarget component
import { MdOutlineVisibility } from "react-icons/md";

const ManageTarget = ({ shouldRefresh, setShouldRefresh }) => {
  const [data, setData] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchData = async () => {
    try {
      const [telecallers, digitalMarketers, bdes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/telecaller/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/digitalmarketer/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/bde/get`),
      ]);

      const combinedData = [
        ...telecallers.data
          .filter((item) => item.targets.length > 0)
          .map((item) => ({
            ...item,
            role: "Telecaller",
            name: item.telecallername,
            id: item.telecallerId,
            lastTarget: item.targets[item.targets.length - 1],
          })),
        ...digitalMarketers.data
          .filter((item) => item.targets.length > 0)
          .map((item) => ({
            ...item,
            role: "Digital Marketer",
            name: item.digitalMarketername,
            id: item.digitalMarketerId,
            lastTarget: item.targets[item.targets.length - 1],
          })),
        ...bdes.data
          .filter((item) => item.targets.length > 0)
          .map((item) => ({
            ...item,
            role: "BDE",
            name: item.bdename,
            id: item.bdeId,
            lastTarget: item.targets[item.targets.length - 1],
          })),
      ];

      setData(combinedData);
      if (setShouldRefresh) setShouldRefresh(false); // Reset refresh state
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (shouldRefresh) {
      fetchData();
    }
  }, [shouldRefresh]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    const urlMap = {
      Telecaller: `/api/telecaller/clearTargets/${userToDelete.id}`,
      "Digital Marketer": `/api/digitalmarketer/clearTargets/${userToDelete.id}`,
      BDE: `/api/bde/clearTargets/${userToDelete.id}`,
    };

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}${urlMap[userToDelete.role]}`
      );
      alert("All targets deleted successfully");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchData(); // Refresh the data after deletion
    } catch (error) {
      console.error("Error deleting targets:", error);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setIsEditModalOpen(true);
  };

  const handleView = (user) => {
    setViewUser(user);
    setIsViewModalOpen(true);
  };

  const headers = ["Name", "Month", "Year", "Target", "Role", "Actions"];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {headers.map((header, index) => (
          <div key={index} className="flex-1 text-base font-medium">
            {header}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-row gap-2 text-[#777777] text-sm font-medium"
          >
            <div className="flex-1">{row.name}</div>
            <div className="flex-1">{row.lastTarget.month}</div>
            <div className="flex-1">{row.lastTarget.year}</div>
            <div className="flex-1">{row.lastTarget.amount}</div>
            <div className="flex-1">{row.role}</div>
            <div className="flex flex-1 flex-row items-center gap-2">
              <button
                className="text-[#00D23B]"
                onClick={() => handleView(row)}
              >
                <MdOutlineVisibility />
              </button>
              <button
                className="text-[#5BC0DE]"
                onClick={() => handleEdit(row)}
              >
                <FiEdit />
              </button>
              <button
                className="text-[#D53F3A]"
                onClick={() => handleDeleteClick(row)}
              >
                <RiDeleteBin5Line />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        contentLabel="Edit Target Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button
          onClick={() => setIsEditModalOpen(false)}
          className="close-button"
        >
          &times;
        </button>
        {editUser && (
          <EditTarget
            user={editUser}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={fetchData}
          />
        )}
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onRequestClose={() => setIsViewModalOpen(false)}
        contentLabel="View Target Modal"
        className="modal-content-show"
        overlayClassName="modal-overlay"
      >
        <button
          onClick={() => setIsViewModalOpen(false)}
          className="close-button"
        >
          &times;
        </button>
        {viewUser && (
          <ViewTarget
            user={viewUser}
            onClose={() => setIsViewModalOpen(false)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete all targets for this user?</p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                onClick={confirmDelete}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTarget;
