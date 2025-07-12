import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Set the root element for accessibility

const EditBusiness = ({ isOpen, onClose, business, onSuccess }) => {
  const [formData, setFormData] = useState({
    buisnessname: "",
    contactpersonName: "",
    mobileNumber: "",
    city: "",
    category: "",
    status: "",
    source: "",
    appointmentDate: null,
    followUpDate: null,
    remarks: "",
    telecallerId: "",
    digitalMarketerId: "",
    bdeId: "",
    tagAppointment: "",
  });
  const [errors, setErrors] = useState({});
  const [showFollowUpDate, setShowFollowUpDate] = useState(false);
  const [citys, setCitys] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [allBDE, setAllBDE] = useState([]);
  const [showAppoinmentDate, setShowAppoinmentDate] = useState(false);

  useEffect(() => {
    if (business) {
      setFormData(business);
      setShowFollowUpDate(business.status === "Followup");
      setShowAppoinmentDate(business.status === "Appointment Generated");
    }

    const fetchData = async () => {
      try {
        const cityResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/city/get?sorting=true`
        );
        setCitys(cityResponse.data);

        const categoryResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/category/get?sorting=true`
        );
        setCategories(categoryResponse.data);

        const sourcesResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/source/get`
        );
        setSources(sourcesResponse.data);

        const bdeResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/bde/get?status=active`
        );
        setAllBDE(bdeResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [business]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobileNumber") {
      // Remove spaces from the mobile number
      const sanitizedValue = value.replace(/\s+/g, "");

      // Prevent input more than 10 digits
      if (sanitizedValue.length > 10) {
        return;
      }

      setFormData({
        ...formData,
        [name]: sanitizedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (name === "status") {
      setShowFollowUpDate(value === "Followup");
      setShowAppoinmentDate(value === "Appointment Generated");
      if (value !== "Followup" || value !== "Appointment Generated") {
        setFormData({
          ...formData,
          tagAppointment: "",
          bdeId: "",
        });
      }
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (name === "bdeId") {
      setFormData({
        ...formData,
        tagAppointment: value,
        bdeId: value,
      });
    }
  };

  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let formValid = true;
    const newErrors = {};

    if (!formData.buisnessname.trim()) {
      newErrors.buisnessname = "Business name is required";
      formValid = false;
    }

    if (!formData.mobileNumber.trim() || formData.mobileNumber.length !== 10) {
      newErrors.mobileNumber = "Mobile Number must be a 10-digit number";
      formValid = false;
    }

    if (!formData.city) {
      newErrors.city = "City is required";
      formValid = false;
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
      formValid = false;
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
      formValid = false;
    }

    if (!formData.source) {
      newErrors.source = "Lead Source is required";
      formValid = false;
    }
    if (formData.status === "Followup" && !formData.followUpDate) {
      newErrors.followUpDate = "Follow-up date is required";
      formValid = false;
    }

    if (
      formData.status === "Appointment Generated" &&
      !formData.appointmentDate
    ) {
      newErrors.appointmentDate = "Appointment date is required";
      formValid = false;
    }

    if (formData.status === "Appointment Generated" && !formData.bdeId) {
      newErrors.bdeId = "BDE is required";
      formValid = false;
    }

    setErrors(newErrors);

    if (formValid) {
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/business/update/${
            business.businessId
          }`,
          formData
        );

        onSuccess(response.data.businessUpdate);
        onClose();
      } catch (error) {
        console.error("Error updating business:", error);
        if (
          error.response &&
          error.response.data.error === "Mobile number already exists"
        ) {
          setErrors({ mobileNumber: "Mobile number already exists" });
        } else {
          alert("Failed to update business. Please try again.");
        }
      }
    }
  };

  const statusOptions = [
    "Fresh Data",
    "Appointment Generated",
    "Followup",
    "Not Interested",
    "Invalid Data",
    "Not Responding",
    "Deal Closed",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit Business"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <button onClick={onClose} className="close-button">
        &times;
      </button>
      <div className="p-4 flex flex-col w-full gap-6">
        <form
          className="grid sm:grid-cols-1 w-full md:grid-cols-2 sm:gap-4 xl:gap-8"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col">
            <label>Business Name</label>
            <input
              type="text"
              name="buisnessname"
              value={formData.buisnessname}
              onChange={handleInputChange}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
            {errors.buisnessname && (
              <span className="text-red-500">{errors.buisnessname}</span>
            )}
          </div>
          <div className="flex flex-col">
            <label>Contact Person (Optional)</label>
            <input
              type="text"
              name="contactpersonName"
              value={formData.contactpersonName}
              onChange={handleInputChange}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
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
            <label>City/Town</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            >
              <option value="">Choose</option>
              {citys.map((city) => (
                <option key={city.cityId} value={city.cityname}>
                  {city.cityname}
                </option>
              ))}
            </select>
            {errors.city && <span className="text-red-500">{errors.city}</span>}
          </div>
          <div className="flex flex-col ">
            <label>Business Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            >
              <option value="">Choose</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryname}>
                  {category.categoryname}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="text-red-500">{errors.category}</span>
            )}
          </div>
          <div className="flex flex-col">
            <label>Select Lead Source</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            >
              <option value="">Choose</option>
              {sources.map((source) => (
                <option key={source.sourceId} value={source.sourcename}>
                  {source.sourcename}
                </option>
              ))}
            </select>
            {errors.source && (
              <span className="text-red-500">{errors.source}</span>
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
          {showFollowUpDate && (
            <div className="flex flex-col ">
              <label>Follow-up Date</label>
              <DatePicker
                selected={formData.followUpDate}
                onChange={(date) => handleDateChange(date, "followUpDate")}
                minDate={new Date()}
                showTimeSelect
                dateFormat="Pp"
                className="bg-white rounded-sm w-full p-4 border border-[#cccccc]"
              />
              {errors.followUpDate && (
                <span className="text-red-500">{errors.followUpDate}</span>
              )}
            </div>
          )}

          {showAppoinmentDate && (
            <div className="flex flex-col ">
              <label>Appoinment Date</label>
              <DatePicker
                selected={formData.appointmentDate}
                onChange={(date) => handleDateChange(date, "appointmentDate")}
                minDate={new Date()}
                showTimeSelect
                dateFormat="Pp"
                className="bg-white rounded-sm w-full p-4 border border-[#cccccc]"
              />
              {errors.appointmentDate && (
                <span className="text-red-500">{errors.appointmentDate}</span>
              )}
            </div>
          )}

          {showAppoinmentDate && (
            <div className="flex flex-col ">
              <label>Select BDE</label>
              <select
                name="bdeId"
                value={formData.bdeId}
                onChange={handleInputChange}
                className="bg-white rounded-sm p-4 border border-[#cccccc]"
              >
                <option value="">Choose Bde</option>
                {allBDE.map((bde, index) => (
                  <option key={index} value={bde.bdeId}>
                    {bde.bdename}
                  </option>
                ))}
              </select>
              {errors.bdeId && (
                <span className="text-red-500">{errors.bdeId}</span>
              )}
            </div>
          )}

          <div className="flex flex-col ">
            <label>Remarks (Optional)</label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
          </div>
          <div className="flex flex-col ">
            <div className="text-transparent">submit</div>
            <button
              type="submit"
              className="w-[50%] bg-[#FF27221A] p-4 flex justify-center items-center text-[#FF2722] text-base rounded-sm"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditBusiness;
