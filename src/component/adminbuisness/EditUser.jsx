import axios from "axios";
import { useEffect, useState } from "react";
import Modal from "react-modal";

const EditUser = ({ isOpen, onClose, user, onUpdate }) => {
  // Initialize formData with user's current data.
  // Ensure that arrays like assignCategories, assignCities, targets are properly initialized
  // to empty arrays if they might be null/undefined on the user object.
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "", // Assuming email is part of the user object
    phone: user.phone || "", // Assuming phone (mobileNumber) is part of the user object
    designation: user.designation || "", // Renamed from organizationRole to match backend
    password: "",
  });
  const [errors, setErrors] = useState({});

  // Effect to update formData if the 'user' prop changes (e.g., when a different user is selected for editing)
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        designation: user.designation || "",
        password: "", // Always clear password on modal open for security
      });
      setErrors({}); // Clear errors when user changes
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // Optional: Mobile number input validation
    if (name === "phone") {
      const sanitizedValue = value.replace(/\D/g, ""); // Remove non-digits
      if (sanitizedValue.length > 10) {
        return; // Prevent input more than 10 digits
      }
      updatedValue = sanitizedValue;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: updatedValue,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error for the field being changed
  };

  const generatePassword = () => {
    if (formData.name && formData.phone) {
      const namePart = formData.name.split(" ")[0].substring(0, 4);
      const phonePart = formData.phone.substring(0, 4);
      const newPassword = `${
        namePart.charAt(0).toUpperCase() + namePart.slice(1)
      }@${phonePart}`;
      setFormData((prevFormData) => ({
        ...prevFormData,
        password: newPassword,
      }));
    } else {
      alert(
        "Please ensure Name and Mobile Number are entered to generate a password."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let formValid = true;
    const newErrors = {};

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      formValid = false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
      formValid = false;
    }
    if (!formData.phone.trim() || formData.phone.length !== 10) {
      newErrors.phone = "Mobile number must be a 10-digit number";
      formValid = false;
    }
    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
      formValid = false;
    }

    setErrors(newErrors);

    if (!formValid) {
      console.error("Form validation failed:", newErrors);
      return;
    }

    // Prepare data to send to the backend
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone, // Backend expects 'phone' for mobile number
      designation: formData.designation,
    };

    // Only include password if it's set/changed
    if (formData.password) {
      dataToSend.password = formData.password;
    }

    try {
      // Use the unified /users/:userId endpoint
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/users/${user.userId}`, // Use user.userId or user._id
        dataToSend
      );

      if (response.status === 200) {
        alert("User updated successfully!");
        onUpdate(response.data.user); // Pass the updated user data back
        onClose(); // Close the modal
      } else {
        alert(
          response.data.message || "Failed to update user. Please try again."
        );
      }
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message ||
          "Error updating user. Please try again."
      );
    }
  };

  // Your full list of possible designations as per your backend's createUser logic
  const organizationRoles = [
    "Admin",
    "Telecaller",
    "Digital Marketer",
    "BDE",
    "HR",
  ];
  const userStatusOptions = ["active", "inactive"]; // Common user statuses

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit User"
      className="modal-content" // Make sure these classNames are defined in your CSS
      overlayClassName="modal-overlay" // for styling the modal
    >
      <button onClick={onClose} className="close-button">
        &times;
      </button>
      <div className="p-4 flex flex-col w-full gap-6">
        <h2 className="text-xl font-semibold mb-4">Edit User: {user.name}</h2>
        <form
          className="grid sm:grid-cols-1 w-full md:grid-cols-2 sm:gap-4 xl:gap-8"
          onSubmit={handleSubmit}
        >
          {/* Name */}
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

          {/* Email */}
          <div className="flex flex-col">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
            {errors.email && (
              <span className="text-red-500">{errors.email}</span>
            )}
          </div>

          {/* Mobile Number (Phone) */}
          <div className="flex flex-col">
            <label>Mobile Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              maxLength={10}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
            {errors.phone && (
              <span className="text-red-500">{errors.phone}</span>
            )}
          </div>

          {/* Designation (Organization Role) */}
          <div className="flex flex-col">
            <label>Designation</label> {/* Changed label to Designation */}
            <select
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            >
              <option value="">Choose</option>
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

          {/* Password */}
          <div className="flex flex-col">
            <label>Password (Leave blank to keep current)</label>
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

          {/* Submit Button */}
          <div className="flex flex-col">
            <div className="text-transparent">submit</div>{" "}
            {/* Placeholder for alignment */}
            <button
              type="submit"
              className="w-[50%] bg-[#FF27221A] p-4 flex justify-center items-center text-[#FF2722] text-base rounded-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditUser;
