import React from "react";
import { Dialog } from "@headlessui/react"; // Headless UI for accessibility
import axios from "axios";

const AppointmentModal = ({ isOpen, onClose, employee }) => {
  const [businessData, setBusinessData] = useState([]);

  useEffect(() => {
    if (employee) {
      const fetchBusinessData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/business/get?${
              employee.role === "Telecaller"
                ? `telecallerId=${employee.id}`
                : employee.role === "Digital Marketer"
                ? `digitalMarketerId=${employee.id}`
                : `bdeId=${employee.id}`
            }`
          );
          setBusinessData(response.data);
        } catch (error) {
          console.error("Error fetching business data:", error);
        }
      };

      fetchBusinessData();
    }
  }, [employee]);

  if (!employee) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <Dialog.Title className="text-xl font-medium mb-4">
          {employee.name}'s Appointments
        </Dialog.Title>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1 text-base font-medium">Business Name</div>
            <div className="flex-1 text-base font-medium">Contact Person</div>
            <div className="flex-1 text-base font-medium">Mobile Number</div>
            <div className="flex-1 text-base font-medium">City/Town</div>
            <div className="flex-1 text-base font-medium">
              Business Category
            </div>
            <div className="flex-1 text-base font-medium">Source</div>
            <div className="flex-1 text-base font-medium">Status</div>
          </div>
          {businessData.length > 0 ? (
            businessData.map((row, index) => (
              <div
                key={index}
                className="flex flex-row gap-2 text-[#777777] text-sm font-medium"
              >
                <div className="flex-1">{row.businessname}</div>
                <div className="flex-1">{row.contactpersonName}</div>
                <div className="flex-1">{row.mobileNumber}</div>
                <div className="flex-1">{row.city}</div>
                <div className="flex-1">{row.category}</div>
                <div className="flex-1">{row.source}</div>
                <div className="flex-1">{row.status}</div>
              </div>
            ))
          ) : (
            <div>No appointment data available</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </Dialog>
  );
};

export default AppointmentModal;
