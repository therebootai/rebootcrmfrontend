import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import Modal from "react-modal";
import { MdOutlineVisibility } from "react-icons/md";

const ManageAssignBusiness = ({ shouldRefresh }) => {
  const [data, setData] = useState([]);
  const [viewUser, setViewUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const fetchData = async () => {
    try {
      const [telecallers, digitalMarketers, bdes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/telecaller/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/digitalmarketer/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/bde/get`),
      ]);

      const combinedData = [
        ...telecallers.data
          .filter(
            (item) =>
              item.assignCategories.length > 0 || item.assignCities.length > 0
          )
          .map((item) => ({
            ...item,
            role: "Telecaller",
            name: item.telecallername,
            id: item.telecallerId,
          })),
        ...digitalMarketers.data
          .filter(
            (item) =>
              item.assignCategories.length > 0 || item.assignCities.length > 0
          )
          .map((item) => ({
            ...item,
            role: "Digital Marketer",
            name: item.digitalMarketername,
            id: item.digitalMarketerId,
          })),
        ...bdes.data
          .filter(
            (item) =>
              item.assignCategories.length > 0 || item.assignCities.length > 0
          )
          .map((item) => ({
            ...item,
            role: "BDE",
            name: item.bdename,
            id: item.bdeId,
          })),
      ];

      setData(combinedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [shouldRefresh]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    const urlMap = {
      Telecaller: `/api/telecaller/removeAssignedBusiness/${userToDelete.id}`,
      "Digital Marketer": `/api/digitalmarketer/removeAssignedBusiness/${userToDelete.id}`,
      BDE: `/api/bde/removeAssignedBusiness/${userToDelete.id}`,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}${urlMap[userToDelete.role]}`,
        {
          category: selectedCategory || null,
          city: selectedCity || null,
        }
      );
      alert("Assigned business deleted successfully");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      setSelectedCategory("");
      setSelectedCity("");
      fetchData(); // Refresh the data after deletion
    } catch (error) {
      console.error("Error deleting assigned business:", error);
    }
  };

  const handleView = (user) => {
    setViewUser(user);
    setIsViewModalOpen(true);
  };

  const headers = ["Name", "Categories", "Cities", "Role", "Actions"];

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
            <div className="flex-1">
              {row.assignCategories
                .map((assign) => assign.category)
                .filter(Boolean)
                .join(", ")}
            </div>
            <div className="flex-1">
              {row.assignCities
                .map((assign) => assign.city)
                .filter(Boolean)
                .join(", ")}
            </div>
            <div className="flex-1">{row.role}</div>
            <div className="flex flex-1 flex-row items-center gap-2">
              <button
                className="text-[#00D23B]"
                onClick={() => handleView(row)}
              >
                <MdOutlineVisibility />
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
        isOpen={isViewModalOpen}
        onRequestClose={() => setIsViewModalOpen(false)}
        contentLabel="View Assign Business Modal"
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
          <div>
            <h2>
              {viewUser.name} - {viewUser.role}
            </h2>
            <p>
              Assigned Categories:{" "}
              {viewUser.assignCategories
                .map((assign) => assign.category)
                .filter(Boolean)
                .join(", ")}
            </p>
            <p>
              Assigned Cities:{" "}
              {viewUser.assignCities
                .map((assign) => assign.city)
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Select the category or city you want to delete:</p>
            <div className="flex gap-4">
              <select
                className="w-full p-2 mt-2 border rounded"
                onChange={(e) => setSelectedCategory(e.target.value)}
                value={selectedCategory}
              >
                <option value="">Choose Category...</option>
                {userToDelete &&
                  userToDelete.assignCategories.map((assign, index) => (
                    <option key={index} value={assign.category}>
                      Category: {assign.category}
                    </option>
                  ))}
              </select>
              <select
                className="w-full p-2 mt-2 border rounded"
                onChange={(e) => setSelectedCity(e.target.value)}
                value={selectedCity}
              >
                <option value="">Choose City...</option>
                {userToDelete &&
                  userToDelete.assignCities.map((assign, index) => (
                    <option key={index} value={assign.city}>
                      City: {assign.city}
                    </option>
                  ))}
              </select>
            </div>
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
                disabled={!selectedCategory && !selectedCity} // Disable if nothing is selected
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

export default ManageAssignBusiness;
