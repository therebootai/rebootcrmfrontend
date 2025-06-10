import ManageAchievements from "../component/ManagementAchievements";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import { useState } from "react";

const AddAndManageAchievement = () => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [currentMonth, setCurrentMonth] = useState(
    monthNames[new Date().getMonth()]
  );
  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex gap-4">
          <select
            className="text-lg px-4 py-2 outline-none border border-[#cccccc] rounded-md"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
          >
            {monthNames.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div>
          <ManageAchievements currentMonth={currentMonth} />
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageAchievement;
