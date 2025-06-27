import axios from "axios";
import { useState } from "react";

const EditUser = ({ user, onClose, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [mobileNumber, setMobileNumber] = useState(user.mobileNumber);
  const [organizationRole, setOrganizationRole] = useState(user.role);
  const [password, setPassword] = useState("");

  const handleEditSave = async () => {
    const urlMap = {
      Telecaller: `/api/telecaller/update/${user.id}`,
      "Digital Marketer": `/api/digitalmarketer/update/${user.id}`,
      BDE: `/api/bde/update/${user.id}`,
    };

    const nameKeyMap = {
      Telecaller: "telecallername",
      "Digital Marketer": "digitalMarketername",
      BDE: "bdename",
    };

    const nameKey = nameKeyMap[organizationRole];

    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}${urlMap[organizationRole]}`,
        {
          [nameKey]: name,
          mobileNumber,
          organizationrole: organizationRole,
          ...(password && { password }), // Only include password if it's not empty
        }
      );
      alert("User updated successfully");
      onUpdate(); // Refresh the data after update
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating user:", error);
    }
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
      alert("Please ensure name and mobile number are set.");
    }
  };

  const organizationRoles = ["Telecaller", "Digital Marketer", "BDE"];

  return (
    <div className="p-4 flex flex-col w-full gap-6">
      <form className="grid sm:grid-cols-1 w-full md:grid-cols-2 sm:gap-4 xl:gap-8">
        <div className="flex flex-col">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
        </div>
        <div className="flex flex-col">
          <label>Mobile Number</label>
          <input
            type="text"
            name="mobileNumber"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
        </div>
        <div className="flex flex-col">
          <label>Organization Role</label>
          <select
            name="organizationRole"
            value={organizationRole}
            onChange={(e) => setOrganizationRole(e.target.value)}
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
            className="mt-2 text-[#FF2722] p-2 rounded text-start"
          >
            Generate Password
          </button>
        </div>
        <div className="flex flex-col">
          <div className="text-transparent">submit</div>
          <button
            type="button"
            onClick={handleEditSave}
            className="w-[50%] bg-[#FF27221A] p-4 flex justify-center items-center text-[#FF2722] text-base rounded-sm"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
