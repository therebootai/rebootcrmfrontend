import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { format } from "date-fns";
import { DateRangePicker } from "react-date-range";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import DashboardEmployeeSection from "../component/adminbuisness/DashboardEmployeeSection";

const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0, // No decimal places for whole rupees
  maximumFractionDigits: 0,
});

const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    totalBusiness: 0,
    followUps: 0,
    visits: 0,
    dealCloses: 0,
    targets: 0, // Overall Sales Target Amount
    achievements: 0, // Overall Sales Achievement Amount
  });
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);

  // Note: allEmployees, tableDateRange, and graph-related states/functions
  // are assumed to be managed within DashboardEmployeeSection and the graph components themselves,
  // as per the separation of concerns for AdminDashboard.

  // --- fetchBusinesses: Fetches overall business counts and combined targets for main dashboard ---
  const fetchBusinesses = useCallback(async () => {
    try {
      const formattedStartDate = dateRange.startDate
        ? new Date(
            dateRange.startDate.getTime() -
              dateRange.startDate.getTimezoneOffset() * 60000
          ).toISOString()
        : "";
      const formattedEndDate = dateRange.endDate
        ? new Date(
            dateRange.endDate.getTime() -
              dateRange.endDate.getTimezoneOffset() * 60000
          ).toISOString()
        : "";

      const businessResponse = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?category=${selectedCategory}&city=${selectedCity}&createdstartdate=${formattedStartDate}&createdenddate=${formattedEndDate}`
      );

      // Fetch all user types to get their targets for overall dashboard counts
      const [telecallersResponse, digitalMarketersResponse, bdesResponse] =
        await Promise.all([
          axios.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/api/users/get?designation=Telecaller`
          ),
          axios.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/api/users/get?designation=Digital%20Marketer` // Ensure space is encoded
          ),
          axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/users/get?designation=BDE`
          ),
        ]);

      const businessData = businessResponse.data;

      // Combine targets from all employee types for overall dashboard counts
      // Use flatMap to ensure the result is a single flat array of target objects
      const combinedTargets = [
        ...telecallersResponse.data.users.flatMap((item) => item.targets || []),
        ...digitalMarketersResponse.data.users.flatMap(
          (item) => item.targets || []
        ),
        ...bdesResponse.data.users.flatMap((item) => item.targets || []),
      ];

      calculateCounts({ ...businessData, target: combinedTargets });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, [dateRange, selectedCategory, selectedCity]); // Dependencies for useCallback

  // Initial fetch for main dashboard data on component mount
  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]); // Dependency: fetchBusinesses useCallback

  // Fetch filters (cities and categories) once on component mount
  useEffect(() => {
    async function getFilters() {
      try {
        const [citiesResponse, categoriesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/city/get`),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/category/get`),
        ]);
        // Assuming your city/category endpoints return an array of objects with 'cityname'/'categoryname'
        setCities(citiesResponse.data.map((item) => item));
        setCategories(categoriesResponse.data.map((item) => item));
      } catch (error) {
        console.log("Error fetching filters:", error);
      }
    }
    getFilters();
  }, []); // Empty dependency array means it runs once on mount

  // --- calculateCounts: Aggregates overall dashboard numbers ---
  const calculateCounts = (data) => {
    const totalBusiness = data.totalCount;
    const followUps = data.statusCount.FollowupCount; // Ensure 'statusCount' matches backend response
    const visits = data.statusCount.visitCount;
    const dealCloses = data.statusCount.dealCloseCount;

    let totalTargets = 0; // Overall sales target (sum of 'amount')
    let totalSalesAchievements = 0; // Overall sales achievement (sum of 'achievement')

    // Iterate through the combined targets array
    for (const item of data.target) {
      // Apply date range filter if provided for overall counts
      if (dateRange && dateRange.startDate && item.month && item.year) {
        const startDate = new Date(dateRange.startDate);
        const itemDate = new Date(Date.parse(`${item.month} 1, ${item.year}`));

        // Compare by month and year within the selected date range
        if (
          itemDate.getMonth() === startDate.getMonth() &&
          itemDate.getFullYear() === startDate.getFullYear()
        ) {
          totalTargets += parseFloat(item.amount || 0); // Use parseFloat and default to 0
          totalSalesAchievements += parseFloat(item.achievement || 0); // Use parseFloat and default to 0
        }
      } else if (!dateRange || !dateRange.startDate) {
        // If no dateRange.startDate is provided, sum all amounts and achievements
        totalTargets += parseFloat(item.amount || 0); // Use parseFloat and default to 0
        totalSalesAchievements += parseFloat(item.achievement || 0); // Use parseFloat and default to 0
      }
    }

    setCounts({
      totalBusiness,
      followUps,
      visits,
      dealCloses,
      targets: totalTargets, // Overall Sales Targets
      achievements: totalSalesAchievements, // Overall Sales Achievements
    });
  };

  // --- Event Handlers for Filters ---
  const handleDateRangeChange = (ranges) => {
    setDateRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: "selection",
    });
    setIsDateFilterApplied(false); // Reset filter applied status
  };

  const clearDateFilter = () => {
    const emptyDateRange = {
      startDate: null,
      endDate: null,
      key: "selection",
    };
    setDateRange(emptyDateRange);
    setIsDateFilterApplied(false);
    // fetchBusinesses will be triggered by the useEffect dependency on dateRange
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const dashboard = [
    { name: "Total Business", number: counts.totalBusiness },
    { name: "Follow Ups", number: counts.followUps },
    { name: "Visit", number: counts.visits },
    { name: "Deal Close", number: counts.dealCloses },
    { name: "Targets", number: rupeeFormatter.format(counts.targets) },
    {
      name: "Achievements",
      number: rupeeFormatter.format(counts.achievements),
    },
  ];

  return (
    <AdminDashboardTemplate>
      <div className="p-4 flex flex-col gap-4">
        <div className="py-4 border-b border-[#cccccc] w-full flex flex-row gap-4 items-center relative">
          <h1 className="text-[#777777] text-lg font-semibold">Filter</h1>
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <input
                type="text"
                value={
                  dateRange.startDate && dateRange.endDate
                    ? `${format(dateRange.startDate, "dd/MM/yyyy")} - ${format(
                        dateRange.endDate,
                        "dd/MM/yyyy"
                      )}`
                    : "Select Date Range"
                }
                onClick={() => setShowDatePicker(!showDatePicker)}
                readOnly
                className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
              />

              {showDatePicker && (
                <div className="absolute z-10">
                  <DateRangePicker
                    ranges={[dateRange]}
                    onChange={handleDateRangeChange}
                    moveRangeOnFirstSelection={false}
                    rangeColors={["#ff2722"]}
                  />
                </div>
              )}
            </div>

            <div className=" flex items-center gap-2">
              {!isDateFilterApplied ? (
                <button
                  className="px-2 py-1 bg-[#FF2722] text-white rounded-md text-sm font-medium cursor-pointer"
                  onClick={() => {
                    fetchBusinesses();
                    setIsDateFilterApplied(true);
                    setShowDatePicker(!showDatePicker);
                  }}
                >
                  Show
                </button>
              ) : (
                <button
                  className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm font-medium cursor-pointer"
                  onClick={clearDateFilter}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div>
            <select
              name="city"
              value={selectedCity}
              onChange={handleCityChange}
              className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
            >
              <option value="">By City/Town</option>
              {cities.map((city, index) => (
                <option key={index} value={city._id}>
                  {city.cityname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
            >
              <option value="">By Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category._id}>
                  {category.categoryname}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-8">
          {dashboard.map((item, index) => (
            <div
              key={index}
              className="p-4 px-10 text-center border border-[#CCCCCC] flex flex-col gap-0 boxsh"
            >
              <span className="text-xl font-semibold text-[#777777]">
                {item.name}
              </span>
              <span className="text-lg font-semibold text-[#FF2722]">
                {item.number}
              </span>
            </div>
          ))}
        </div>
        <div>
          <DashboardEmployeeSection />
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default AdminDashboard;
