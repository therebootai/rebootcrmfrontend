import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import Modal from "react-modal";
import EditUser from "./EditUser";

const ManageUser = ({ shouldRefresh, setShouldRefresh }) => {
  const [data, setData] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
    setDeleteModalIsOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    const urlMap = {
      Telecaller: `/api/telecaller/delete/${userToDelete.id}`,
      "Digital Marketer": `/api/digitalmarketer/delete/${userToDelete.id}`,
      BDE: `/api/bde/delete/${userToDelete.id}`,
    };

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}${urlMap[userToDelete.role]}`
      );
      alert("User deleted successfully");
      setDeleteModalIsOpen(false);
      setUserToDelete(null);
      fetchData(); // Refresh the data after deletion
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id, role, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const urlMap = {
      Telecaller: `/api/telecaller/update/${id}`,
      "Digital Marketer": `/api/digitalmarketer/update/${id}`,
      BDE: `/api/bde/update/${id}`,
    };

    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}${urlMap[role]}`, {
        status: newStatus,
      });

      fetchData(); // Refresh the data after status update
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const headers = ["Name", "Mobile Number", "Organization Role", "Status"];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {headers.map((header, index) => (
          <div key={index} className="flex-1 text-base font-medium">
            {header}
          </div>
        ))}
        <div className="flex-1 text-sm font-medium">Actions</div>
      </div>
      <div className="flex flex-col gap-4">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-row gap-2 text-[#777777] text-sm font-medium"
          >
            <div className="flex-1">{row.name}</div>
            <div className="flex-1">{row.mobileNumber}</div>
            <div className="flex-1">{row.role}</div>
            <div className="flex-1">{row.status}</div>

            <div className="flex flex-1 flex-row items-center gap-2">
              <button
                className={`text-sm  px-2 rounded-md  ${
                  row.status === "active"
                    ? "text-green-600 bg-[#22ff4a1a] border border-green-600"
                    : "text-[#FF2722] bg-[#FF27221A] border border-[#FF2722]"
                }`}
                onClick={() => handleToggleStatus(row.id, row.role, row.status)}
              >
                {row.status === "active" ? "Deactivate" : "Activate"}
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
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Edit User Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={() => setIsModalOpen(false)} className="close-button">
          &times;
        </button>
        {editUser && (
          <EditUser
            user={editUser}
            onClose={() => setIsModalOpen(false)}
            onUpdate={fetchData}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteModalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this user?</p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setDeleteModalIsOpen(false)}
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

export default ManageUser;
