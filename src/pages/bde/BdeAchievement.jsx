import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import BdeDashboardTemplate from "../../template/BdeDashboardTemplate";
import EditTargetPopup from "../../component/EditTargetPopup";

const getuniqueYears = (targets) => {
  const years = new Set(targets.map((t) => t.year));
  return Array.from(years).sort((a, b) => b - a);
};

const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0, // No decimal places for whole rupees
  maximumFractionDigits: 0,
});

const BdeAchievement = () => {
  const [allTargets, setAllTargets] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [uniqueYears, setUniqueYears] = useState([]);
  const [currentYear, setCurrentYear] = useState(
    new Date().getFullYear().toString()
  );
  const { bdeId } = useParams();

  // 1. Fetch all data ONCE when bdeId changes
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/users/get/${bdeId}`
      );
      const targets = response.data.targets || [];

      setAllTargets(targets); // Store the full list of targets
      setUniqueYears(getuniqueYears(targets)); // Extract unique years from the full list
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [bdeId]);

  // 2. Filter targets whenever allTargets or currentYear changes
  useEffect(() => {
    const targetsForYear = allTargets.filter(
      (item) => item.year.toString() === currentYear
    );
    setFilteredTargets(targetsForYear);
  }, [allTargets, currentYear]);

  const handleEditClick = (target) => {
    setSelectedTarget(target);
    setShowPopup(true);
  };

  // 3. Correctly handle updates by modifying the allTargets state
  const handleUpdate = (updatedTarget) => {
    setAllTargets((prevAllTargets) =>
      prevAllTargets.map((t) =>
        t._id === updatedTarget._id ? updatedTarget : t
      )
    );
  };

  const headers = ["Month", "Year", "Target", "Collection", "Achievement"];

  return (
    <BdeDashboardTemplate>
      <div className="flex flex-col gap-6">
        <div className="py-6 border-b border-[#cccccc] flex flex-wrap items-center gap-6">
          <h1>Filter</h1>
          <select
            placeholder="By Year"
            onChange={(e) => setCurrentYear(e.target.value)}
            value={currentYear}
            className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-sm border border-[#CCCCCC]"
          >
            <option value="">By Year</option>
            {uniqueYears.map(
              (
                year // Corrected to map over uniqueYears
              ) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>
          <button className="px-3 p-1 flex justify-center items-center text-[#FF2722] rounded-sm border border-[#FF2722] bg-[#FF27221A]">
            Export
          </button>
        </div>
        <div className=" w-full overflow-x-auto">
          <div className="flex flex-col  gap-2 xlg:min-w-[1000px] lg:min-w-[600px] sm:min-w-[450px] overflow-x-auto">
            <div className="flex gap-2">
              {headers.map((header, index) => (
                <div key={index} className="flex-1 text-base font-medium">
                  {header}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              {filteredTargets.length > 0 ? (
                filteredTargets.map((target, rowIndex) => {
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
                      <div className="flex-1">
                        {rupeeFormatter.format(target.amount)}
                      </div>
                      <div className="flex-1">
                        {rupeeFormatter.format(target.collection)}
                      </div>
                      <div className="flex-1">
                        {achievementPercentage}% (
                        {rupeeFormatter.format(target.achievement) || "0"})
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
            userId={bdeId}
            userType="bde"
          />
        )}
      </div>
    </BdeDashboardTemplate>
  );
};

export default BdeAchievement;
