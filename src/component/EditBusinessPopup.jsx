import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

Modal.setAppElement("#root");

const EditBusinessPopup = ({ show, onClose, business, onUpdate }) => {
  const [status, setStatus] = useState(business.status || "");
  const [followUpDate, setFollowUpDate] = useState(
    business.followUpDate ? new Date(business.followUpDate) : null
  );
  const [bdeList, setBdeList] = useState([]);
  const [selectedBdeId, setSelectedBdeId] = useState(business.appoint_to || "");
  const [appointmentDate, setAppointmentDate] = useState(
    business.appointmentDate ? new Date(business.appointmentDate) : null
  );

  useEffect(() => {
    const fetchBdeList = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/users/get?designation=BDE`
        );
        setBdeList(response.data.users);
      } catch (error) {
        console.error("Error fetching BDE list:", error);
      }
    };

    fetchBdeList();
  }, []);

  const handleUpdate = async () => {
    try {
      // Update business details
      const updatedBusiness = {
        status,
        followUpDate: followUpDate ? followUpDate.toISOString() : null,
      };

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/business/update/${business._id}`,
        updatedBusiness
      );

      // If the status is "Appointment Generated," also save the BDE and appointment date
      if (
        status === "Appointment Generated" &&
        selectedBdeId &&
        appointmentDate
      ) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/business/update/${
            business._id
          }`,
          {
            appoint_to: selectedBdeId,
            appointmentDate: appointmentDate.toISOString(),
          }
        );
        try {
          await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/send-notification`,
            {
              targetUserId: selectedBdeId,
              title: "New Business Appointment has been Assigned",
              body: `New Business named ${
                business.buisnessname
              } has been assigned to you on ${appointmentDate.toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }
              )} at ${appointmentDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}. Please check the details and get in touch with the customer.`,
            }
          );
        } catch (error) {
          console.error("Error sending notification:", error);
        }
      }

      onUpdate({
        ...business,
        ...updatedBusiness,
        appoint_to: selectedBdeId,
        appointmentDate: appointmentDate,
      });

      onClose();
    } catch (error) {
      console.error("Error updating business or tagging appointment:", error);
    }
  };

  return (
    <Modal
      isOpen={show}
      onRequestClose={onClose}
      className="bg-white rounded-lg p-6 xl:w-[30%] lg:w-[35%] md:w-[50%] sm:w-[80%] mx-auto mt-20 shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <h2 className="text-2xl font-semibold mb-4">Edit Business</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="Fresh Data">Fresh Data</option>
          <option value="Appointment Generated">Appointment Generated</option>
          <option value="Followup">Follow Up</option>
          <option value="Not Interested">Not Interested</option>
          <option value="Invalid Data">Invalid Data</option>
          <option value="Deal Closed">Deal Closed</option>
          <option value="Not Responding">Not Responding</option>
          <option value="Appointment Pending">Appointment Pending</option>
        </select>
      </div>

      {status === "Followup" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Follow Up Date
          </label>
          <DatePicker
            selected={followUpDate}
            onChange={(date) => setFollowUpDate(date)}
            dateFormat="dd/MM/yyyy"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      )}

      {status === "Appointment Generated" && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign BDE
            </label>
            <select
              className="w-full p-2 mb-4 border border-gray-300 rounded-md"
              value={selectedBdeId}
              onChange={(e) => setSelectedBdeId(e.target.value)}
            >
              <option value="">Select BDE</option>
              {bdeList.map((bde) => (
                <option key={bde._id} value={bde._id}>
                  {bde.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Date
            </label>
            <DatePicker
              selected={appointmentDate}
              onChange={(date) => setAppointmentDate(date)}
              showTimeSelect
              dateFormat="Pp"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholderText="Select date and time"
            />
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-black rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Save
        </button>
      </div>
    </Modal>
  );
};

export default EditBusinessPopup;
