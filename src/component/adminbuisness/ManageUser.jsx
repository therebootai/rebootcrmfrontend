import axios from "axios";
import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import Modal from "react-modal";
import EditUser from "./EditUser";

const ManageUser = ({ shouldRefresh, setShouldRefresh }) => {
  const [data, setData] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [users] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/get`),
      ]);

      setData(users.data.users);
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

  const handleEdit = (user) => {
    setEditUser(user);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    // Determine the new status
    const newStatus = !currentStatus;

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/users/users/${id}`,
        {
          status: newStatus,
        }
      );

      // Check if the update was successful (backend sends 200 OK)
      if (response.status === 200) {
        console.log(`User status updated to ${newStatus} for ID: ${id}`);
        // Assuming fetchData() is a prop or a function available in the parent component
        // that re-fetches the list of users to reflect the change.
        fetchData();
      } else {
        // Handle cases where the request was successful but the backend logic indicates an issue
        console.error("Failed to update user status:", response.data.message);
        alert(response.data.message || "Failed to update user status.");
      }
    } catch (error) {
      console.error(
        "Error updating user status:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message ||
          "Error updating user status. Please try again."
      );
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
            <div className="flex-1">{row.phone}</div>
            <div className="flex-1">{row.designation}</div>
            <div className="flex-1">{row.status ? "active" : "inactive"}</div>

            <div className="flex flex-1 flex-row items-center gap-2">
              <button
                className={`text-sm  px-2 rounded-md  ${
                  row.status
                    ? "text-green-600 bg-[#22ff4a1a] border border-green-600"
                    : "text-[#FF2722] bg-[#FF27221A] border border-[#FF2722]"
                }`}
                onClick={() => handleToggleStatus(row._id, row.status)}
              >
                {row.status ? "Deactivate" : "Activate"}
              </button>
              <button
                className="text-[#5BC0DE]"
                onClick={() => handleEdit(row)}
              >
                <FiEdit />
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
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUpdate={fetchData}
          />
        )}
      </Modal>
    </div>
  );
};

export default ManageUser;
