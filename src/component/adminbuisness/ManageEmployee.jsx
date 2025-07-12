import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit } from "react-icons/fi";
import { MdOutlineVisibility } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";
import Modal from "react-modal";
import EditEmployee from "./EditEmployee";

Modal.setAppElement("#root"); // Set the root element for accessibility

const ManageEmployee = ({ employees = [] }) => {
  const [data, setData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const closeModal = () => {
    setViewModalIsOpen(false);
    setEditModalIsOpen(false);
    setDeleteModalIsOpen(false);
  };

  const handleUpdatedEmployee = (updatedEmployee) => {
    setData((prevEmployees) => {
      return prevEmployees.map((employee) =>
        employee.employeeId === updatedEmployee.employeeId
          ? updatedEmployee
          : employee
      );
    });
    closeModal();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/employee/get`
        );
        setData(
          response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      } catch (error) {
        console.error("Error fetching Employee data", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (employees) {
      setData(
        employees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    }
  }, [employees]);

  const handleView = async (employeeId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/employee/get/${employeeId}`
      );
      setSelectedEmployee(response.data);
      setViewModalIsOpen(true);
    } catch (error) {
      console.error("Error fetching employee details", error);
    }
  };

  const handleEdit = async (employeeId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/employee/get/${employeeId}`
      );
      setSelectedEmployee(response.data);
      setEditModalIsOpen(true);
    } catch (error) {
      console.error("Error fetching employee details", error);
    }
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteModalIsOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/employee/delete/${
          employeeToDelete.employeeId
        }`
      );
      setData((prevData) =>
        prevData.filter(
          (employee) => employee.employeeId !== employeeToDelete.employeeId
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error deleting employee", error);
    }
  };

  const headers = [
    "Name",
    "Mobile Number",
    "Emergency Number",
    "Role",
    "Type",
    "Status",
  ];

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
            <div className="flex-1">{row.employeename}</div>
            <div className="flex-1">{row.mobileNumber}</div>
            <div className="flex-1">{row.emergencyNumber}</div>
            <div className="flex-1">{row.role}</div>
            <div className="flex-1">{row.type}</div>
            <div className="flex-1">{row.status}</div>
            <div className="flex flex-1 flex-row items-center gap-2">
              <button
                className="text-[#00D23B]"
                onClick={() => handleView(row.employeeId)}
              >
                <MdOutlineVisibility />
              </button>
              <button
                className="text-[#5BC0DE]"
                onClick={() => handleEdit(row.employeeId)}
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

      {/* View Modal */}
      <Modal
        isOpen={viewModalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Employee Details"
        className="modal-content-show"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        {selectedEmployee && (
          <div className="flex flex-col gap-2">
            <p>
              <strong>Employee Id:</strong> {selectedEmployee.employeeId}
            </p>
            <p>
              <strong>Name:</strong> {selectedEmployee.employeename}
            </p>
            <p>
              <strong>Guardian Name:</strong> {selectedEmployee.guardianName}
            </p>
            <p>
              <strong>Mobile Number:</strong> {selectedEmployee.mobileNumber}
            </p>
            <p>
              <strong>Emergency Number:</strong>{" "}
              {selectedEmployee.emergencyNumber}
            </p>
            <p>
              <strong>Role:</strong> {selectedEmployee.role}
            </p>
            <p>
              <strong>Type:</strong> {selectedEmployee.type}
            </p>
            <p>
              <strong>Joining Date:</strong> {selectedEmployee.joiningDate}
            </p>
            <p>
              <strong>Govt Id: </strong>
              <a
                href={selectedEmployee.govtId.secure_url}
                target="_blank"
                className="text-blue-500 ml-2"
              >
                View
              </a>
            </p>
            <p>
              <strong>Experience Letter: </strong>
              {selectedEmployee.experienceLetter ? (
                <a
                  href={selectedEmployee.experienceLetter.secure_url}
                  target="_blank"
                  className="text-blue-500 ml-2"
                >
                  View
                </a>
              ) : (
                "Not uploaded"
              )}
            </p>
            <p>
              <strong>Bank Details: </strong>
              <a
                href={selectedEmployee.bankDetails.secure_url}
                target="_blank"
                className="text-blue-500 ml-2"
              >
                View
              </a>
            </p>
            <p>
              <strong>Agreement: </strong>
              {selectedEmployee.agreement ? (
                <a
                  href={selectedEmployee.agreement.secure_url}
                  target="_blank"
                  className="text-blue-500 ml-2"
                >
                  View
                </a>
              ) : (
                "Not uploaded"
              )}
            </p>
            <p>
              <strong>Profile Picture: </strong>
              {selectedEmployee.profile_img ? (
                <a
                  href={selectedEmployee.profile_img.secure_url}
                  target="_blank"
                  className="text-blue-500 ml-2"
                >
                  View
                </a>
              ) : (
                "Not uploaded"
              )}
            </p>
            <p>
              <strong>Status:</strong> {selectedEmployee.status}
            </p>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Employee"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        {selectedEmployee && (
          <EditEmployee
            employeeId={selectedEmployee.employeeId}
            onClose={closeModal}
            onAddEmployees={handleUpdatedEmployee}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteModalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this employee?</p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={closeModal}
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

export default ManageEmployee;
