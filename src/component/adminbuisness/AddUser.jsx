import axios from "axios";
import React, { useEffect, useState } from "react";

const AddUser = ({ closeModal }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [organizationRole, setOrganizationRole] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/employee/get`
        );
        setEmployees(employeeResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleEmployeeChange = (e) => {
    const employeeName = e.target.value;
    setSelectedEmployee(employeeName);
    const employee = employees.find((emp) => emp.employeename === employeeName);
    setMobileNumber(employee ? employee.mobileNumber : "");
  };

  const handleRoleChange = (e) => {
    setOrganizationRole(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const urlMap = {
      Telecaller: "/api/telecaller/create",
      "Digital Marketer": "/api/digitalmarketer/create",
      BDE: "/api/bde/create",
    };

    const nameKeyMap = {
      Telecaller: "telecallername",
      "Digital Marketer": "digitalMarketername",
      BDE: "bdename",
    };

    const selectedUrl = urlMap[organizationRole];
    const nameKey = nameKeyMap[organizationRole];

    if (!selectedUrl) {
      console.error("Invalid organization role selected");
      return;
    }

    const data = {
      [nameKey]: selectedEmployee,
      mobileNumber,
      organizationrole: organizationRole,
      password,
    };

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}${selectedUrl}`, data);
      closeModal(); // Close the modal after successful submission
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const generatePassword = () => {
    if (selectedEmployee && mobileNumber) {
      const namePart = selectedEmployee.split(" ")[0].substring(0, 4);
      const mobilePart = mobileNumber.substring(0, 4);
      const newPassword = `${
        namePart.charAt(0).toUpperCase() + namePart.slice(1)
      }@${mobilePart}`;
      setPassword(newPassword);
    } else {
      alert("Please select an employee and ensure mobile number is set.");
    }
  };

  const organizationRoles = ["Telecaller", "Digital Marketer", "BDE"];

  return (
    <div className="p-4 flex flex-col w-full gap-6">
      <form
        className="grid sm:grid-cols-1 w-full md:grid-cols-2 sm:gap-4 xl:gap-8"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col">
          <label>Name</label>
          <select
            name="employeename"
            value={selectedEmployee}
            onChange={handleEmployeeChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          >
            <option value="">Choose</option>
            {employees.map((employee) => (
              <option key={employee.employeeId} value={employee.employeename}>
                {employee.employeename}
              </option>
            ))}
          </select>
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
        </div>
        <div className="flex flex-col">
          <label>Organization Role</label>
          <select
            name="organizationrole"
            value={organizationRole}
            onChange={handleRoleChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          >
            <option value="">Choose</option>
            {organizationRoles.map((role, index) => (
              <option key={index} value={role}>
                {role}
              </option>
            ))}
          </select>
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
          <button
            type="button"
            onClick={generatePassword}
            className="mt-2  text-[#FF2722] p-2 rounded text-start"
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
    </div>
  );
};

export default AddUser;
