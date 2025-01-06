import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddBuisness = ({ onAddBusiness }) => {
  const [citys, setCity] = useState([]);
  const [categories, setCategory] = useState([]);
  const [sources, setSources] = useState([]);
  const [showFollowUpDate, setShowFollowUpDate] = useState(false);
  const { telecallerId } = useParams();
  const { bdeId } = useParams();
  const { digitalMarketerId } = useParams();

  const [formData, setFormData] = useState({
    buisnessname: "",
    contactpersonName: "",
    mobileNumber: "",
    city: "",
    category: "",
    status: "",
    source: "",
    followUpDate: null,
    remarks: "",
    telecallerId: "",
    digitalMarketerId: "",
    bdeId: "",
  });
  const [errors, setErrors] = useState({});
  useEffect(() => {
    // Set the telecallerId in formData if it exists
    if (telecallerId) {
      setFormData((prevData) => ({
        ...prevData,
        telecallerId: telecallerId,
      }));
    }
    if (bdeId) {
      setFormData((prevData) => ({
        ...prevData,
        bdeId: bdeId,
      }));
    }
    if (digitalMarketerId) {
      setFormData((prevData) => ({
        ...prevData,
        digitalMarketerId: digitalMarketerId,
      }));
    }
  }, [telecallerId, bdeId, digitalMarketerId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cityResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/city/get`
        );
        setCity(cityResponse.data);

        const categoryResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/category/get`
        );
        setCategory(categoryResponse.data);

        const sourcesResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/source/get`
        );
        setSources(sourcesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
      setShowFollowUpDate(
        value === "Followup" || value === "Appointment Generated"
      );
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      followUpDate: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
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

    setErrors(newErrors);
    if (formValid) {
      try {
        // Send data to backend
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/business/create`,
          formData
        );

        onAddBusiness(response.data);

        // Optionally, reset form data
        setFormData({
          buisnessname: "",
          contactpersonName: "",
          mobileNumber: "",
          city: "",
          category: "",
          status: "",
          source: "",
          followUpDate: null,
          remarks: "",
        });
      } catch (error) {
        console.error("Error creating Business Details:", error);
        if (
          error.response &&
          error.response.data.error === "Mobile number already exists"
        ) {
          setErrors({ mobileNumber: "Mobile number already exists" });
        } else {
          setFormData({
            buisnessname: "",
            contactpersonName: "",
            mobileNumber: "",
            city: "",
            category: "",
            status: "",
            source: "",
            followUpDate: null,
            remarks: "",
          });
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
    "Deal Closed",
    "Not Responding",
    "Appointment Pending",
  ];

  return (
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
              onChange={handleDateChange}
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
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBuisness;
