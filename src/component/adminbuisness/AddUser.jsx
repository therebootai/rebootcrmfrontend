import axios from "axios";
import React, { useEffect, useState } from "react";

const AddUserFromEmployeeForm = ({ closeModal }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(""); // Stores employee's _id
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState(""); // Added email field
  const [organizationRole, setOrganizationRole] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Employee's name
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all employees from your /api/employee/get endpoint
        const employeeResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/employee/get`
        );
        setEmployees(employeeResponse.data);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        alert("Failed to load employee data.");
      }
    };
    fetchData();
  }, []);

  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value; // This is the _id of the employee
    setSelectedEmployeeId(employeeId);
    const employee = employees.find((emp) => emp._id === employeeId); // Find by _id
    if (employee) {
      setName(employee.employeename); // Set the name
      setMobileNumber(employee.mobileNumber);
      setEmail(employee.email || ""); // Assume employee data might have email, or default to empty
    } else {
      setName("");
      setMobileNumber("");
      setEmail("");
    }
    setErrors({}); // Clear errors on change
  };

  const handleRoleChange = (e) => {
    setOrganizationRole(e.target.value);
    setErrors({}); // Clear errors on change
  };

  const generatePassword = () => {
    if (name && mobileNumber) {
      const namePart = name.split(" ")[0].substring(0, 4);
      const mobilePart = mobileNumber.substring(0, 4);
      const newPassword = `${
        namePart.charAt(0).toUpperCase() + namePart.slice(1)
      }@${mobilePart}`;
      setPassword(newPassword);
    } else {
      alert("Please select an employee and ensure mobile number is set.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    let formValid = true;

    if (!selectedEmployeeId) {
      newErrors.employee = "Please select an employee";
      formValid = false;
    }
    if (!organizationRole) {
      newErrors.role = "Please select an organization role";
      formValid = false;
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
      formValid = false;
    }
    if (!name.trim()) {
      newErrors.name = "Employee name is required";
      formValid = false;
    }
    if (!mobileNumber.trim() || mobileNumber.length !== 10) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
      formValid = false;
    }

    setErrors(newErrors);
    if (!formValid) {
      return;
    }

    const data = {
      name: name, // Use the name from the selected employee
      email: email,
      phone: mobileNumber,
      password: password,
      designation: organizationRole, // This maps to your backend's 'designation'
      employee_ref: selectedEmployeeId, // This is the _id of the employee record
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/create`, // Unified endpoint
        data
      );
      if (response.status === 201) {
        alert("User created successfully!");
        closeModal(); // Close the modal after successful submission
      } else {
        alert(response.data.message || "Failed to create user.");
      }
    } catch (error) {
      console.error(
        "Error creating user:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message ||
          "Error creating user. Please try again."
      );
    }
  };

  const organizationRoles = ["Telecaller", "DigitalMarketer", "BDE", "HR"]; // Admin/HR are likely not created this way

  return (
    <form
      className="grid sm:grid-cols-1 w-full md:grid-cols-2 sm:gap-4 xl:gap-8"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col">
        <label>Select Employee Name</label>
        <select
          name="employeeName"
          value={selectedEmployeeId}
          onChange={handleEmployeeChange}
          className="bg-white rounded-sm p-4 border border-[#cccccc]"
        >
          <option value="">Choose Employee</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.employeename}
            </option>
          ))}
        </select>
        {errors.employee && (
          <span className="text-red-500">{errors.employee}</span>
        )}
      </div>
      <div className="flex flex-col">
        <label>Mobile Number</label>
        <input
          type="text"
          name="mobileNumber"
          value={mobileNumber}
          readOnly
          className="bg-white rounded-sm p-4 border border-[#cccccc]"
        />
        {errors.mobileNumber && (
          <span className="text-red-500">{errors.mobileNumber}</span>
        )}
      </div>
      <div className="flex flex-col">
        <label>Email</label> {/* Added email field */}
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white rounded-sm p-4 border border-[#cccccc]"
        />
        {errors.email && <span className="text-red-500">{errors.email}</span>}
      </div>
      <div className="flex flex-col">
        <label>Organization Role</label>
        <select
          name="organizationrole"
          value={organizationRole}
          onChange={handleRoleChange}
          className="bg-white rounded-sm p-4 border border-[#cccccc]"
        >
          <option value="">Choose Role</option>
          {organizationRoles.map((role, index) => (
            <option key={index} value={role}>
              {role}
            </option>
          ))}
        </select>
        {errors.role && <span className="text-red-500">{errors.role}</span>}
      </div>
      <div className="flex flex-col">
        <label>Password</label>
        <input
          type="text"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white rounded-sm p-4 border border-[#cccccc]"
        />
        {errors.password && (
          <span className="text-red-500">{errors.password}</span>
        )}
        <button
          type="button"
          onClick={generatePassword}
          className="mt-2 text-[#FF2722] p-2 rounded text-start"
        >
          Generate Password
        </button>
      </div>
      <div className="flex flex-col">
        <div className="text-transparent">submit</div>
        <button
          type="submit"
          className="w-[50%] bg-[#FF27221A] p-4 flex justify-center items-center text-[#FF2722] text-base rounded-sm"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

// --- Sub-component: Form for adding a completely new user ---
const AddNewUserForm = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    designation: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error on change
  };

  const generatePassword = () => {
    if (formData.name && formData.phone) {
      const namePart = formData.name.split(" ")[0].substring(0, 4);
      const mobilePart = formData.phone.substring(0, 4);
      const newPassword = `${
        namePart.charAt(0).toUpperCase() + namePart.slice(1)
      }@${mobilePart}`;
      setFormData((prev) => ({ ...prev, password: newPassword }));
    } else {
      alert("Please enter a name and mobile number to generate a password.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    let formValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      formValid = false;
    }
    if (!formData.phone.trim() || formData.phone.length !== 10) {
      newErrors.phone = "Mobile number must be 10 digits";
      formValid = false;
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      formValid = false;
    }
    if (!formData.designation) {
      newErrors.designation = "Designation is required";
      formValid = false;
    }

    setErrors(newErrors);
    if (!formValid) {
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/create`, // Unified endpoint
        formData // This data matches the backend createUser
      );
      if (response.status === 201) {
        alert("User created successfully!");
        closeModal();
      } else {
        alert(response.data.message || "Failed to create user.");
      }
    } catch (error) {
      console.error(
        "Error creating user:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message ||
          "Error creating user. Please try again."
      );
    }
  };

  const organizationRoles = [
    "Admin",
    "Telecaller",
    "Digital Marketer",
    "BDE",
    "HR",
  ]; // All possible roles

  return (
    <form
      className="grid sm:grid-cols-1 w-full md:grid-cols-2 sm:gap-4 xl:gap-8"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col">
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="bg-white rounded-sm p-4 border border-[#cccccc]"
        />
        {errors.name && <span className="text-red-500">{errors.name}</span>}
      </div>
      <div className="flex flex-col">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="bg-white rounded-sm p-4 border border-[#cccccc]"
        />
        {errors.email && <span className="text-red-500">{errors.email}</span>}
      </div>
      <div className="flex flex-col">
        <label>Mobile Number</label>
        <input
          type="text"
          name="phone" // Changed to 'phone' to match backend
          value={formData.phone}
          onChange={handleInputChange}
          maxLength={10} // Enforce 10 digits
          className="bg-white rounded-sm p-4 border border-[#cccccc]"
        />
        {errors.phone && <span className="text-red-500">{errors.phone}</span>}
      </div>
      <div className="flex flex-col">
        <label>Designation</label>
        <select
          name="designation"
          value={formData.designation}
          onChange={handleInputChange}
          className="bg-white rounded-sm p-4 border border-[#cccccc]"
        >
          <option value="">Choose Designation</option>
          {organizationRoles.map((role, index) => (
            <option key={index} value={role}>
              {role}
            </option>
          ))}
        </select>
        {errors.designation && (
          <span className="text-red-500">{errors.designation}</span>
        )}
      </div>
      <div className="flex flex-col">
        <label>Password</label>
        <input
          type="text"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="bg-white rounded-sm p-4 border border-[#cccccc]"
        />
        {errors.password && (
          <span className="text-red-500">{errors.password}</span>
        )}
        <button
          type="button"
          onClick={generatePassword}
          className="mt-2 text-[#FF2722] p-2 rounded text-start"
        >
          Generate Password
        </button>
      </div>
      <div className="flex flex-col">
        <div className="text-transparent">submit</div>
        <button
          type="submit"
          className="w-[50%] bg-[#FF27221A] p-4 flex justify-center items-center text-[#FF2722] text-base rounded-sm"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

// --- Main AddUser Component with Tabs ---
const AddUser = ({ closeModal }) => {
  const [activeTab, setActiveTab] = useState("fromEmployee"); // 'fromEmployee' or 'addNew'

  return (
    <div className="p-4 flex flex-col w-full gap-6">
      <div className="flex border-b border-[#cccccc] mb-4">
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === "fromEmployee"
              ? "text-[#FF2722] border-b-2 border-[#FF2722]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("fromEmployee")}
        >
          Create From Existing Employee
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === "addNew"
              ? "text-[#FF2722] border-b-2 border-[#FF2722]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("addNew")}
        >
          Add New User
        </button>
      </div>

      <div>
        {activeTab === "fromEmployee" ? (
          <AddUserFromEmployeeForm closeModal={closeModal} />
        ) : (
          <AddNewUserForm closeModal={closeModal} />
        )}
      </div>
    </div>
  );
};

export default AddUser;
