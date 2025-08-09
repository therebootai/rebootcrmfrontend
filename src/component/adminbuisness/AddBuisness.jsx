import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AuthContext } from "../../context/AuthContext";
import { set } from "date-fns";

const statusOptions = [
  "Fresh Data",
  "Appointment Generated",
  "Followup",
  "Not Interested",
  "Invalid Data",
  "Not Responding",
  "Deal Closed",
];

const AddBuisness = ({ onAddBusiness }) => {
  // currentUserId comes as a prop
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [allBDEs, setAllBDEs] = useState([]);

  const [showFollowUpDate, setShowFollowUpDate] = useState(false);
  const [showAppointmentDate, setShowAppointmentDate] = useState(false);

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
    appoint_to: null,
    created_by: null,
    lead_by: null, // Initialize lead_by from prop
  });
  const [errors, setErrors] = useState({});

  const { user } = useContext(AuthContext);

  // Effect to set lead_by from currentUserId prop
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      created_by: user._id,
    }));
    if (user.designation !== "Admin") {
      if (user.designation === "BDE") {
        setFormData((prevData) => ({
          ...prevData,
          appoint_to: user._id,
        }));
      }
      setFormData((prevData) => ({
        ...prevData,
        lead_by: user._id,
      }));
    }
  }, [user]); // Dependency array ensures it updates if currentUserId changes

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
      const selectedCityObj = cities.find((c) => c._id === value);
      newFormData.city = selectedCityObj ? selectedCityObj._id : "";
    } else if (name === "category") {
      const selectedCategoryObj = categories.find(
        (c) => c.categoryname === value
      );
      newFormData.category = selectedCategoryObj ? selectedCategoryObj._id : "";
    } else if (name === "source") {
      const selectedSourceObj = sources.find((s) => s.sourcename === value);
      newFormData.source = selectedSourceObj ? selectedSourceObj._id : "";
    } else if (name === "status") {
      newFormData.status = value;
      setShowFollowUpDate(value === "Followup");
      setShowAppointmentDate(value === "Appointment Generated");

      if (value !== "Followup" && value !== "Appointment Generated") {
        newFormData.followUpDate = null;
        newFormData.appointmentDate = null;
        newFormData.appoint_to = null;
      }
    } else if (name === "appoint_to") {
      newFormData.appoint_to = value;
    } else {
      newFormData[name] = value;
    }

    setFormData(newFormData);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  // Fetch initial data for dropdowns (same as before)
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
            axios.get(
              `${
                import.meta.env.VITE_BASE_URL
              }/api/users/get?designation=BDE&status=true`
            ),
          ]);

        setCities(cityResponse.data);
        setCategories(categoryResponse.data);
        setSources(sourcesResponse.data);
        setAllBDEs(bdeResponse.data.users);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchData();
  }, []);

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
    if (formData.status === "Appointment Generated" && !formData.appoint_to) {
      newErrors.appoint_to = "BDE is required for appointment";
      formValid = false;
    }

    setErrors(newErrors);
    if (!formValid) {
      console.error("Form validation failed:", newErrors);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/business/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        if (formData.status === "Appointment Generated") {
          const assignedBDE = allBDEs.find(
            (bde) => bde._id === formData.appoint_to
          );
          const bdeName = assignedBDE ? assignedBDE.name : "Assigned User";

          await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/send-notification`,
            {
              targetUserId: formData.appoint_to,
              title: "New Business Appointment has been Assigned",
              body: `New Business named ${
                formData.buisnessname
              } has been assigned to ${bdeName} on ${new Date(
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
              )}. Please check the details and get in touch with the customer.`,
            }
          );
        }

        onAddBusiness(response.data);

        setFormData({
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
          appoint_to: "",
          lead_by: currentUserId || "",
          created_by: currentUserId || "",
        });
        setShowFollowUpDate(false);
        setShowAppointmentDate(false);
        setErrors({});
      } else {
        console.warn(
          "Unexpected successful response status:",
          response.status,
          response.data
        );
        alert(
          response.data.message ||
            "Business created, but with unexpected status."
        );
        onAddBusiness(response.data);
      }
    } catch (error) {
      console.error("Error creating Business Details:", error);
      if (error.response) {
        if (error.response.data.error === "Mobile number already exists") {
          setErrors({ mobileNumber: "Mobile number already exists" });
        } else {
          alert(error.response.data.error || "Failed to create business.");
        }
      } else {
        alert("Network error or server unreachable.");
      }
    }
  };

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
            value={cities.find((c) => c._id === formData.city)?._id || ""}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          >
            <option value="">Choose</option>
            {cities.map((city) => (
              <option key={city._id} value={city._id}>
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
              name="appoint_to"
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
            {errors.appoint_to && (
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
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBuisness;
