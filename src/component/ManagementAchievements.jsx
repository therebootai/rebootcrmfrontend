import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import Modal from "react-modal";
import { MdOutlineVisibility } from "react-icons/md";
import ViewAchievement from "./adminbuisness/ViewAchievement";

const ManageAchievements = ({ currentMonth }) => {
  const [data, setData] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [amount, setAmount] = useState("");
  const [achievement, setAchievement] = useState("0");

  const fetchData = async () => {
    try {
      const [telecallers, digitalMarketers, bdes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/telecaller/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/digitalmarketer/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/bde/get`),
      ]);

      const combinedData = [
        ...telecallers.data
          .filter((item) => item.targets.length > 0)
          .map((item) => ({
            ...item,
            role: "Telecaller",
            name: item.telecallername,
            id: item.telecallerId,
            lastTarget: item.targets.find(
              (target) => target?.month === currentMonth
            ),
          })),
        ...digitalMarketers.data
          .filter((item) => item.targets.length > 0)
          .map((item) => ({
            ...item,
            role: "Digital Marketer",
            name: item.digitalMarketername,
            id: item.digitalMarketerId,
            lastTarget: item.targets.find(
              (target) => target?.month === currentMonth
            ),
          })),
        ...bdes.data
          .filter((item) => item.targets.length > 0)
          .map((item) => ({
            ...item,
            role: "BDE",
            name: item.bdename,
            id: item.bdeId,
            lastTarget: item.targets.find(
              (target) => target?.month === currentMonth
            ) ?? {
              month: currentMonth,
              year: new Date().getFullYear(),
              amount: 0,
              achievement: 0,
            },
          })),
      ];

      setData(combinedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getLatestTarget = (targets, currentMonth) => {
    if (!targets || targets.length === 0 || !currentMonth) return null;

    const [monthName, year] = currentMonth.split(" ");

    return targets.find(
      (target) =>
        target.month.toLowerCase() === monthName.toLowerCase() &&
        String(target.year) === String(year)
    );
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const handleEdit = (user) => {
    setEditUser(user);
    setMonth(user.lastTarget.month);
    setYear(user.lastTarget.year);
    setAmount(user.lastTarget.amount);
    setAchievement(user.lastTarget.achievement);
    setIsEditModalOpen(true);
  };

  const handleView = (user) => {
    setViewUser(user);
    setIsViewModalOpen(true);
  };

  const headers = [
    "Name",
    "Month",
    "Year",
    "Target",
    "Achievements",
    "Role",
    "Actions",
  ];

  const handleUpdate = async (id, userType, userId) => {
    try {
      const updatedTarget = {
        _id: id, // Include the target ID in the updated target data
        month,
        year,
        amount,
        achievement,
      };

      // Dynamically set the URL based on user type
      const url = `${
        import.meta.env.VITE_BASE_URL
      }/api/${userType}/updatetarget/${userId}`;

      await axios.put(url, {
        targetId: id,
        ...updatedTarget,
      });

      fetchData();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating target:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {headers.map((header, index) => (
          <div key={index} className="flex-1 text-base font-medium">
            {header}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {data.map((row, rowIndex) => {
          const latestTarget = getLatestTarget(
            row.targets,
            currentMonth + " " + new Date().getFullYear()
          ) || {
            amount: 0,
            achievement: 0,
          };

          const achievementPercentage =
            latestTarget.amount && latestTarget.achievement
              ? (
                  (latestTarget.achievement / latestTarget.amount) *
                  100
                ).toFixed(2)
              : 0;
          return (
            <div
              key={rowIndex}
              className="flex flex-row gap-2 text-[#777777] text-sm font-medium"
            >
              <div className="flex-1">{row.name}</div>
              <div className="flex-1">{row.lastTarget.month}</div>
              <div className="flex-1">{row.lastTarget.year}</div>
              <div className="flex-1">{row.lastTarget.amount}</div>
              <div className="flex-1">
                {achievementPercentage}% ({latestTarget.achievement || "0"})
              </div>
              <div className="flex-1">{row.role}</div>
              <div className="flex flex-1 flex-row items-center gap-2">
                <button
                  className="text-[#00D23B]"
                  onClick={() => handleView({ ...row, ...latestTarget })}
                >
                  <MdOutlineVisibility />
                </button>
                <button
                  className="text-[#5BC0DE]"
                  onClick={() => handleEdit({ ...row, ...latestTarget })}
                >
                  <FiEdit />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        contentLabel="Edit Target Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button
          onClick={() => setIsEditModalOpen(false)}
          className="close-button"
        >
          &times;
        </button>
        {editUser && (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <input
                type="text"
                value={month}
                readOnly
                onChange={(e) => setMonth(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                value={year}
                readOnly
                onChange={(e) => setYear(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                readOnly
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Achievement
              </label>
              <input
                type="text"
                value={achievement}
                onChange={(e) => setAchievement(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-[#777777] text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleUpdate(
                    editUser._id,
                    editUser.role,
                    editUser.telecallerId ??
                      editUser.bdeId ??
                      editUser.digitalMarketerId
                  )
                }
                className="px-4 py-2 bg-[#FF27221A] text-[#FF2722] border border-[#FF2722] rounded-md"
              >
                Update
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onRequestClose={() => setIsViewModalOpen(false)}
        contentLabel="View Target Modal"
        className="modal-content-show"
        overlayClassName="modal-overlay"
      >
        <button
          onClick={() => setIsViewModalOpen(false)}
          className="close-button"
        >
          &times;
        </button>
        {viewUser && (
          <ViewAchievement
            user={viewUser}
            onClose={() => setIsViewModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default ManageAchievements;
