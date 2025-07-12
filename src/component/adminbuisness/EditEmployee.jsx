import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditEmployee = ({ employeeId, onClose, onAddEmployees }) => {
  const [formData, setFormData] = useState({
    employeename: "",
    mobileNumber: "",
    guardianName: "",
    emergencyNumber: "",
    joiningDate: "",
    role: "",
    type: "",
    govtId: null,
    experienceLetter: null,
    bankDetails: null,
    agreement: null,
    status: "",
    profile_img: null,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/employee/get/${employeeId}`
        );
        setFormData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [employeeId]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "mobileNumber" && value.length > 10) {
      return; // Prevent input more than 10 digits
    }
    if (name === "emergencyNumber" && value.length > 10) {
      return; // Prevent input more than 10 digits
    }
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      joiningDate: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let formValid = true;
    const newErrors = {};

    if (!formData.employeename.trim()) {
      newErrors.employeename = "Employee Name is required";
      formValid = false;
    }

    if (!formData.mobileNumber.trim() || formData.mobileNumber.length !== 10) {
      newErrors.mobileNumber = "Mobile Number must be a 10-digit number";
      formValid = false;
    }

    if (
      !formData.emergencyNumber.trim() ||
      formData.emergencyNumber.length !== 10
    ) {
      newErrors.emergencyNumber = "Emergency Number must be a 10-digit number";
      formValid = false;
    }
    if (!formData.role) {
      newErrors.role = "Role is required";
      formValid = false;
    }

    if (!formData.type) {
      newErrors.type = "Type is required";
      formValid = false;
    }

    if (!formData.govtId) {
      newErrors.govtId = "Govt Id is required";
      formValid = false;
    }
    if (!formData.bankDetails) {
      newErrors.bankDetails = "Bank Details are required";
      formValid = false;
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = "Joining Date is required";
      formValid = false;
    }

    setErrors(newErrors);

    if (formValid) {
      setSubmitting(true);
      try {
        const data = new FormData();
        for (const key in formData) {
          data.append(key, formData[key]);
        }

        const response = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/employee/update/${employeeId}`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        onClose();

        onAddEmployees(response.data);
        // window.location.reload();
        setFormData({
          employeename: "",
          mobileNumber: "",
          guardianName: "",
          emergencyNumber: "",
          role: "",
          type: "",
          joiningDate: "",
          govtId: null,
          experienceLetter: null,
          bankDetails: null,
          agreement: null,
          status: "",
          profile_img: null,
        });
      } catch (error) {
        console.error("Error creating Employee:", error);
        if (
          error.response &&
          error.response.data.error === "Mobile number already exists"
        ) {
          setErrors({ mobileNumber: "Mobile number already exists" });
        } else if (
          error.response &&
          error.response.data.error ===
            "Alternative mobile number already exists"
        ) {
          setErrors({
            emergencyNumber: "Alternative mobile number already exists",
          });
        } else {
          alert("Failed to create Employee. Please try again.");
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  const statusOptions = ["Active", "Deactive"];

  return (
    <div className="p-4 flex flex-col w-full gap-6">
      <form
        className="grid sm:grid-cols-1 w-full md:grid-cols-2 sm:gap-4 xl:gap-8"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col">
          <label>Employee Name</label>
          <input
            type="text"
            name="employeename"
            value={formData.employeename}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
          {errors.employeename && (
            <span className="text-red-500">{errors.employeename}</span>
          )}
        </div>

        <div className="flex flex-col ">
          <label>Mobile Number</label>
          <input
            type="text"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
          {errors.mobileNumber && (
            <span className="text-red-500">{errors.mobileNumber}</span>
          )}
        </div>

        <div className="flex flex-col ">
          <label>Guardian Name</label>
          <input
            type="text"
            name="guardianName"
            value={formData.guardianName}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
          {errors.guardianName && (
            <span className="text-red-500">{errors.guardianName}</span>
          )}
        </div>

        <div className="flex flex-col ">
          <label>Emergency Number</label>
          <input
            type="text"
            name="emergencyNumber"
            value={formData.emergencyNumber}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          ></input>
          {errors.emergencyNumber && (
            <span className="text-red-500">{errors.emergencyNumber}</span>
          )}
        </div>
        <div className="flex flex-col ">
          <label>Role</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          ></input>
          {errors.role && <span className="text-red-500">{errors.role}</span>}
        </div>
        <div className="flex flex-col ">
          <label>Type</label>
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          ></input>
          {errors.type && <span className="text-red-500">{errors.type}</span>}
        </div>
        <div className="flex flex-col">
          <label>Joining Date</label>

          <DatePicker
            selected={formData.joiningDate}
            onChange={handleDateChange}
            dateFormat="MM/dd/yyyy"
            className="bg-white w-full rounded-sm p-4 border border-[#cccccc]"
          />
          {errors.joiningDate && (
            <span className="text-red-500">{errors.joiningDate}</span>
          )}
        </div>
        <div className="flex flex-col ">
          <label>Select Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          >
            <option value="">Choose</option>
            {statusOptions.map((status, index) => (
              <option key={index} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status && (
            <span className="text-red-500">{errors.status}</span>
          )}
        </div>
        <div className="flex flex-col ">
          <label>Govt Id</label>
          <input
            type="file"
            name="govtId"
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          ></input>
          {errors.govtId && (
            <span className="text-red-500">{errors.govtId}</span>
          )}
        </div>

        <div className="flex flex-col ">
          <label>Experience Letter</label>
          <input
            type="file"
            name="experienceLetter"
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
        </div>
        <div className="flex flex-col ">
          <label>Bank Details</label>
          <input
            type="file"
            name="bankDetails"
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
          {errors.bankDetails && (
            <span className="text-red-500">{errors.bankDetails}</span>
          )}
        </div>
        <div className="flex flex-col ">
          <label>Agreement</label>
          <input
            type="file"
            name="agreement"
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
        </div>
        <div className="flex flex-col col-span-2 gap-2">
          <label>Profile Image</label>
          <input
            type="file"
            name="profile_img"
            accept="image/*"
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
          {errors.profile_img && (
            <span className="text-red-500">{errors.profile_img}</span>
          )}
        </div>

        <div className="flex flex-col ">
          <div className="text-transparent">submit</div>
          <button
            type="submit"
            disabled={submitting}
            className="w-[50%] bg-[#FF27221A] p-4 flex justify-center items-center text-[#FF2722] text-base rounded-sm"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;
