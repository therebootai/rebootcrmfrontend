import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Set the root element for accessibility

const statusOptions = [
  "Fresh Data",
  "Appointment Generated",
  "Followup",
  "Not Interested",
  "Invalid Data",
  "Not Responding",
  "Deal Closed",
];

const EditBusiness = ({ isOpen, onClose, business, onSuccess }) => {
  const [formData, setFormData] = useState({
    buisnessname: "",
    contactpersonName: "",
    mobileNumber: "",
    city: "", // Will store ObjectId
    category: "", // Will store ObjectId
    status: "",
    source: "", // Will store ObjectId
    appointmentDate: null,
    followUpDate: null,
    remarks: "",
    appoint_to: null, // Will store User ObjectId for assigned BDE/DM/Telecaller
    lead_by: null, // Will store User ObjectId of who initially led the business
  });
  const [errors, setErrors] = useState({});
  const [showFollowUpDate, setShowFollowUpDate] = useState(false);
  const [cities, setCities] = useState([]); // Renamed from citys for clarity
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [allBDEs, setAllBDEs] = useState([]); // Renamed from allBDE, now holds User objects
  const [showAppointmentDate, setShowAppointmentDate] = useState(false);

  // Effect to populate form data and manage date visibility when 'business' prop changes
  useEffect(() => {
    if (business) {
      // Ensure dates are Date objects for DatePicker
      const initialFormData = {
        ...business,
        // Convert ISO strings to Date objects if they exist
        appointmentDate: business.appointmentDate
          ? new Date(business.appointmentDate)
          : null,
        followUpDate: business.followUpDate
          ? new Date(business.followUpDate)
          : null,
        // Ensure that city, category, source, appoint_to, lead_by are IDs
        // The 'business' prop might contain full objects or just IDs.
        // Assuming business.city, business.category, business.source, business.appoint_to, business.lead_by are _ids.
        // If they are full objects, you'll need to extract the _id:
        city: business.city?._id || business.city || "",
        category: business.category?._id || business.category || "",
        source: business.source?._id || business.source || "",
        appoint_to: business.appoint_to?._id || business.appoint_to || null,
        lead_by: business.lead_by?._id || business.lead_by || null,
      };
      setFormData(initialFormData);
      setShowFollowUpDate(initialFormData.status === "Followup");
      setShowAppointmentDate(
        initialFormData.status === "Appointment Generated"
      );
    }
  }, [business]); // Dependency on 'business' prop

  // Effect to fetch dropdown options (cities, categories, sources, BDEs)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cityResponse, categoryResponse, sourcesResponse, bdeResponse] =
          await Promise.all([
            axios.get(
              `${import.meta.env.VITE_BASE_URL}/api/city/get?sorting=true`
            ),
            axios.get(
              `${import.meta.env.VITE_BASE_URL}/api/category/get?sorting=true`
            ),
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/source/get`),
            // Fetch BDEs (users with designation 'bde')
            axios.get(
              `${
                import.meta.env.VITE_BASE_URL
              }/api/users/get?designation=BDE&status=true`
            ),
          ]);

        setCities(cityResponse.data); // Assuming data is [{_id, cityname}]
        setCategories(categoryResponse.data); // Assuming data is [{_id, categoryname}]
        setSources(sourcesResponse.data); // Assuming data is [{_id, sourcename}]
        setAllBDEs(bdeResponse.data.users); // Assuming data.users is [{_id, name, designation, userId}]
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchData();
  }, [isOpen]); // Re-fetch when modal opens, if needed

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData };

    if (name === "mobileNumber") {
      const sanitizedValue = value.replace(/\s+/g, "");
      if (sanitizedValue.length > 10) {
        return;
      }
      newFormData[name] = sanitizedValue;
    } else if (name === "city") {
      // Find the selected city object and store its _id
      const selectedCityObj = cities.find((c) => c.cityname === value);
      newFormData.city = selectedCityObj ? selectedCityObj._id : "";
    } else if (name === "category") {
      // Find the selected category object and store its _id
      const selectedCategoryObj = categories.find(
        (c) => c.categoryname === value
      );
      newFormData.category = selectedCategoryObj ? selectedCategoryObj._id : "";
    } else if (name === "source") {
      // Find the selected source object and store its _id
      const selectedSourceObj = sources.find((s) => s.sourcename === value);
      newFormData.source = selectedSourceObj ? selectedSourceObj._id : "";
    } else if (name === "status") {
      newFormData.status = value;
      setShowFollowUpDate(value === "Followup");
      setShowAppointmentDate(value === "Appointment Generated");

      // Corrected logic for clearing dates and assigned BDE
      if (value !== "Followup" && value !== "Appointment Generated") {
        newFormData.followUpDate = null;
        newFormData.appointmentDate = null;
        newFormData.appoint_to = null; // Clear assigned BDE
      }
    } else if (name === "appoint_to") {
      // Changed from bdeId to appoint_to
      newFormData.appoint_to = value; // Value from select option is already the _id
    } else {
      newFormData[name] = value;
    }

    setFormData(newFormData);
    // Clear errors for the field being changed
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });
    // Clear date-related errors when date is selected
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let formValid = true;
    const newErrors = {};

    // Basic form validation
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
    if (formData.status === "Appointment Generated" && !formData.appoint_to) {
      newErrors.appoint_to = "BDE is required for appointment";
      formValid = false;
    } // Changed bdeId to appoint_to

    setErrors(newErrors);

    if (!formValid) {
      console.error("Form validation failed:", newErrors);
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/business/update/${
          business._id // Assuming business.businessId is the unique identifier for the URL
        }`,
        formData, // formData now contains correct _id for selects and appoint_to
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is available
          },
        }
      );

      if (response.status === 200) {
        // Send notification if status is "Appointment Generated"
        // and if a new BDE is assigned or the appointment is newly generated
        // (compared to the original business data)
        const originalAppointTo =
          business.appoint_to?._id || business.appoint_to;

        if (
          formData.status === "Appointment Generated" &&
          (formData.appoint_to !== originalAppointTo ||
            (!originalAppointTo && formData.appoint_to)) // If it was null before and now assigned
        ) {
          const assignedBDE = allBDEs.find(
            (bde) => bde._id === formData.appoint_to
          );
          const bdeName = assignedBDE ? assignedBDE.name : "Assigned User";

          await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/send-notification`,
            {
              targetUserId: formData.appoint_to, // Use the user's _id
              title: "Business Appointment Updated/Assigned",
              body: `Business "${
                formData.buisnessname
              }" has been updated and assigned to ${bdeName} for an appointment on ${new Date(
                formData.appointmentDate
              ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })} at ${new Date(formData.appointmentDate).toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }
              )}. Please check details.`,
            }
          );
        }

        onSuccess(response.data.businessUpdate); // Pass the updated business data to parent
        onClose(); // Close the modal
      } else {
        console.warn(
          "Unexpected successful response status:",
          response.status,
          response.data
        );
        alert(
          response.data.message ||
            "Business updated, but with unexpected status."
        );
      }
    } catch (error) {
      console.error("Error updating business:", error);
      if (error.response) {
        if (error.response.data.error === "Mobile number already exists") {
          setErrors({ mobileNumber: "Mobile number already exists" });
        } else {
          alert(
            error.response.data.error ||
              "Failed to update business. Please try again."
          );
        }
      } else {
        alert("Network error or server unreachable.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit Business"
      className="modal-content" // Ensure these classNames are defined in your CSS
      overlayClassName="modal-overlay" // for styling the modal
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
              // Display cityname, but the value for onChange is cityname (which is then mapped to _id)
              value={
                cities.find((c) => c._id === formData.city)?.cityname || ""
              }
              onChange={handleInputChange}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            >
              <option value="">Choose</option>
              {cities.map((city) => (
                <option key={city._id} value={city.cityname}>
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
              value={
                categories.find((c) => c._id === formData.category)
                  ?.categoryname || ""
              }
              onChange={handleInputChange}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            >
              <option value="">Choose</option>
              {categories.map((category) => (
                <option key={category._id} value={category.categoryname}>
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
              value={
                sources.find((s) => s._id === formData.source)?.sourcename || ""
              }
              onChange={handleInputChange}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            >
              <option value="">Choose</option>
              {sources.map((source) => (
                <option key={source._id} value={source.sourcename}>
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

          {showAppointmentDate && (
            <div className="flex flex-col ">
              <label>Appointment Date</label>
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

          {showAppointmentDate && (
            <div className="flex flex-col ">
              <label>Select BDE</label>
              <select
                name="appoint_to" // Changed from bdeId to appoint_to
                value={formData.appoint_to}
                onChange={handleInputChange}
                className="bg-white rounded-sm p-4 border border-[#cccccc]"
              >
                <option value="">Choose Bde</option>
                {allBDEs.map((bde) => (
                  <option key={bde._id} value={bde._id}>
                    {bde.name}
                  </option>
                ))}
              </select>
              {errors.appoint_to && ( // Changed from bdeId to appoint_to
                <span className="text-red-500">{errors.appoint_to}</span>
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
