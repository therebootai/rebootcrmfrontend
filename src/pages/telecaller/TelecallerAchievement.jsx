import React, { useEffect, useState } from "react";
import TelecallerDashboardTemplate from "../../template/TelecallerDashboardTemplate";
import axios from "axios";
import { useParams } from "react-router-dom";

// Helper function to extract unique years from targets
const getUniqueYears = (targets) => {
  const years = new Set(targets.map((t) => t.year));
  return Array.from(years).sort((a, b) => b - a);
};

// Assuming rupeeFormatter is available from a previous context
const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const TelecallerAchievement = () => {
  const [allTargets, setAllTargets] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [uniqueYears, setUniqueYears] = useState([]);
  const [currentYear, setCurrentYear] = useState(
    new Date().getFullYear().toString()
  );
  const { telecallerId } = useParams();

  // 1. Fetch all data ONCE when telecallerId changes
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/users/get/${telecallerId}`
      );
      const targets = response.data.targets || [];

      setAllTargets(targets); // Store the full list of targets
      setUniqueYears(getUniqueYears(targets)); // Extract unique years from the full list
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [telecallerId]);

  // 2. Filter targets whenever allTargets or currentYear changes
  useEffect(() => {
    // If no year is selected, display all targets
    const targetsForYear = currentYear
      ? allTargets.filter((item) => item.year.toString() === currentYear)
      : allTargets;

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

  const headers = ["Month", "Year", "Target", "Achievement", "Actions"];

  return (
    <TelecallerDashboardTemplate>
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
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
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
                        {achievementPercentage}% (
                        {rupeeFormatter.format(target.achievement || 0)})
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>No targets available for this year.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TelecallerDashboardTemplate>
  );
};

export default TelecallerAchievement;
