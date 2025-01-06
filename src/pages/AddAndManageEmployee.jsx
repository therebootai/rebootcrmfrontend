import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import Modal from "react-modal";
import AddEmployee from "../component/adminbuisness/AddEmployee";
import ManageEmployee from "../component/adminbuisness/ManageEmployee";

const AddAndManageEmployee = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [date, setDate] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [uniqueRoles, setUniqueRoles] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNewEmployee = (newEmployee) => {
    setAllEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
    closeModal();
  };

  // Fetch all employees once at the start
  const fetchAllEmployees = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/employee/get`
      );
      const data = response.data;
      setAllEmployees(data);
      setFilteredEmployees(data); // Initially show all employees
      setUniqueFilters(data); // Set unique filter options
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const setUniqueFilters = (data) => {
    const roles = [...new Set(data.map((item) => item.role))];
    const statuses = [...new Set(data.map((item) => item.status))];
    setUniqueRoles(roles);
    setUniqueStatuses(statuses);
  };

  const applyFilters = () => {
    let filteredData = allEmployees;

    if (date) {
      filteredData = filteredData.filter((employee) => {
        const employeeDate = new Date(employee.joiningDate)
          .toISOString()
          .split("T")[0];
        return employeeDate === date;
      });
    }
    if (role) {
      filteredData = filteredData.filter((employee) => employee.role === role);
    }
    if (status) {
      filteredData = filteredData.filter(
        (employee) => employee.status === status
      );
    }

    setFilteredEmployees(filteredData);
  };

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [date, role, status]);

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4 p-4">
        <div className="py-6 flex border-b border-[#cccccc] items-center flex-wrap gap-6">
          <span className="text-lg font-semibold text-[#777777]">Filter</span>
          <div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md text-[#FF2722]"
            />
          </div>
          <div>
            <select
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((rl, index) => (
                <option key={index} value={rl}>
                  {rl}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map((sts, index) => (
                <option key={index} value={sts}>
                  {sts}
                </option>
              ))}
            </select>
          </div>
          <div
            className="px-2 p-1 bg-[#FF2722] text-white rounded-md text-sm font-medium cursor-pointer"
            onClick={openModal}
          >
            ADD
          </div>
        </div>
        <div>
          <ManageEmployee employees={filteredEmployees} />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Employee Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        <AddEmployee
          onAddEmployees={handleNewEmployee}
          fetchAllEmployees={fetchAllEmployees}
        />
      </Modal>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageEmployee;
