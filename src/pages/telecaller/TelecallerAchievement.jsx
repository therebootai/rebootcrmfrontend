import React, { useEffect, useState } from "react";
import TelecallerDashboardTemplate from "../../template/TelecallerDashboardTemplate";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import EditTargetPopup from "../../component/EditTargetPopup";

const TelecallerAchievement = () => {
  const [data, setData] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const { telecallerId } = useParams();

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/telecaller/get/${telecallerId}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [telecallerId]);

  const handleEditClick = (target) => {
    setSelectedTarget(target);
    setShowPopup(true);
  };

  const handleUpdate = (updatedTarget) => {
    setData((prevData) => ({
      ...prevData,
      targets: prevData.targets.map((t) =>
        t._id === updatedTarget._id ? updatedTarget : t
      ),
    }));
  };

  const headers = ["Month", "Year", "Target", "Achievement", "Actions"];

  return (
    <TelecallerDashboardTemplate>
      <div className="flex flex-col gap-6">
        <div className="py-6 border-b border-[#cccccc] flex flex-wrap items-center gap-6">
          <h1>Filter</h1>
          <select
            name="category"
            placeholder="By Category"
            className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-sm border border-[#CCCCCC]"
          >
            <option value="">By Month</option>
          </select>
          <button className="px-3 p-1 flex justify-center items-center text-[#FF2722] rounded-sm border border-[#FF2722] bg-[#FF27221A]">
            Export
          </button>
        </div>
        <div className=" w-full overflow-x-auto">
          <div className="flex flex-col xlg:min-w-[1000px] lg:min-w-[600px] sm:min-w-[450px] overflow-x-auto gap-2">
            <div className="flex gap-2">
              {headers.map((header, index) => (
                <div key={index} className="flex-1 text-base font-medium">
                  {header}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              {data && data.targets ? (
                data.targets.map((target, rowIndex) => {
                  const achievementPercentage =
                    target.amount && target.achievement
                      ? ((target.achievement / target.amount) * 100).toFixed(2)
                      : 0;
                  return (
                    <div
                      key={rowIndex}
                      className="flex flex-row gap-2 text-[#777777] text-sm font-medium"
                    >
                      <div className="flex-1">{target.month}</div>
                      <div className="flex-1">{target.year}</div>
                      <div className="flex-1">{target.amount}</div>
                      <div className="flex-1">
                        {achievementPercentage}% ({target.achievement || "0"})
                      </div>
                      <div className="flex flex-1 flex-row items-center gap-2">
                        <button
                          className="text-[#5BC0DE]"
                          onClick={() => handleEditClick(target)}
                        >
                          <FiEdit />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>No targets available</div>
              )}
            </div>
          </div>
        </div>

        {showPopup && (
          <EditTargetPopup
            show={showPopup}
            onClose={() => setShowPopup(false)}
            target={selectedTarget}
            onUpdate={handleUpdate}
            userId={telecallerId}
            userType="telecaller"
          />
        )}
      </div>
    </TelecallerDashboardTemplate>
  );
};

export default TelecallerAchievement;
