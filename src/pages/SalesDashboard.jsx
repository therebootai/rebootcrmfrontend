import React, { useEffect, useCallback, useState } from "react";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import { DateRangePicker } from "react-date-range";
import axios from "axios";
import { format } from "date-fns";
import EmployeeSection from "../component/salesDashboard/EmployeeSection";
import TargetSalesGraph from "../component/salesDashboard/TargetSalesGraph";
import SalesCollectionGraph from "../component/salesDashboard/SalesCollectionGraph";
import TargetCollectionGraph from "../component/salesDashboard/TargetCollectionGraph";

const monthNamesShort = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// --- Helper for Date Formatting ---
const formatDateToISO = (date) => {
  if (!date) return "";
  const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return utcDate.toISOString();
};

const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0, // No decimal places for whole rupees
  maximumFractionDigits: 0,
});

const SalesDashboard = () => {
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
  const [tableDateRange, setTableDateRange] = useState({
    // Date range specifically for the employee table
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]); // Data for the employee table

  const [targetSalesYear, setTargetSalesYear] = useState(
    new Date().getFullYear()
  );
  const [targetSalesGraphData, setTargetSalesGraphData] = useState([]);

  const [salesCollectionYear, setSalesCollectionYear] = useState(
    new Date().getFullYear()
  );
  const [salesCollectionGraphData, setSalesCollectionGraphData] = useState([]);

  const [targetCollectionYear, setTargetCollectionYear] = useState(
    new Date().getFullYear()
  );
  const [targetCollectionGraphData, setTargetCollectionGraphData] = useState(
    []
  );

  // --- Helper: Calculates total Collection for a user within a given date range ---
  const calculateCollectionForRange = useCallback(
    (targets, startDate, endDate) => {
      let totalCollection = 0;
      if (!targets || !Array.isArray(targets)) return 0;

      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      targets.forEach((target) => {
        if (target.month && target.year) {
          const targetDate = new Date(`${target.month} 1, ${target.year}`);
          if (
            !isNaN(targetDate.getTime()) &&
            (!start || targetDate >= start) &&
            (!end || targetDate <= end)
          ) {
            totalCollection += parseFloat(target.collection || 0); // Sum 'collection' field
          }
        }
      });
      return totalCollection;
    },
    []
  );

  // --- calculateMonthlyTargetSalesData (Uses amount for target, achievement for clearedAmount) ---
  // This function aggregates sales targets and sales achievements for the graph.
  function calculateMonthlyTargetSalesData(users, year) {
    const monthlyDataMap = {
      JAN: { target: 0, clearedAmount: 0, month: "JAN" },
      FEB: { target: 0, clearedAmount: 0, month: "FEB" },
      MAR: { target: 0, clearedAmount: 0, month: "MAR" },
      APR: { target: 0, clearedAmount: 0, month: "APR" },
      MAY: { target: 0, clearedAmount: 0, month: "MAY" },
      JUN: { target: 0, clearedAmount: 0, month: "JUN" },
      JUL: { target: 0, clearedAmount: 0, month: "JUL" },
      AUG: { target: 0, clearedAmount: 0, month: "AUG" },
      SEP: { target: 0, clearedAmount: 0, month: "SEP" },
      OCT: { target: 0, clearedAmount: 0, month: "OCT" },
      NOV: { target: 0, clearedAmount: 0, month: "NOV" },
      DEC: { target: 0, clearedAmount: 0, month: "DEC" },
    };

    users.forEach((user) => {
      if (user.targets && Array.isArray(user.targets)) {
        user.targets.forEach((target) => {
          if (target.year === year && target.month) {
            const monthIndex = new Date(
              `${target.month} 1, ${target.year}`
            ).getMonth();
            const shortMonth = monthNamesShort[monthIndex];
            if (monthlyDataMap[shortMonth]) {
              monthlyDataMap[shortMonth].target += parseFloat(
                target.amount || 0
              ); // Sales Target
              monthlyDataMap[shortMonth].clearedAmount += parseFloat(
                target.achievement || 0
              ); // Sales Achievement
            }
          }
        });
      }
    });

    const finalMonthlyTargetSalesData = Object.values(monthlyDataMap).map(
      (item) => ({
        target: item.target.toString(),
        clearedAmount: item.clearedAmount.toString(),
        month: item.month,
      })
    );

    return finalMonthlyTargetSalesData;
  }

  // --- calculateMonthlySalesCollectionData (MODIFIED: Uses target.collection for clearedAmount) ---
  // This function aggregates sales targets and actual money collected for the graph.
  function calculateMonthlySalesCollectionData(users, year) {
    const monthlyDataMap = {
      JAN: { target: 0, clearedAmount: 0, month: "JAN" },
      FEB: { target: 0, clearedAmount: 0, month: "FEB" },
      MAR: { target: 0, clearedAmount: 0, month: "MAR" },
      APR: { target: 0, clearedAmount: 0, month: "APR" },
      MAY: { target: 0, clearedAmount: 0, month: "MAY" },
      JUN: { target: 0, clearedAmount: 0, month: "JUN" },
      JUL: { target: 0, clearedAmount: 0, month: "JUL" },
      AUG: { target: 0, clearedAmount: 0, month: "AUG" },
      SEP: { target: 0, clearedAmount: 0, month: "SEP" },
      OCT: { target: 0, clearedAmount: 0, month: "OCT" },
      NOV: { target: 0, clearedAmount: 0, month: "NOV" },
      DEC: { target: 0, clearedAmount: 0, month: "DEC" },
    };

    users.forEach((user) => {
      if (user.targets && Array.isArray(user.targets)) {
        user.targets.forEach((target) => {
          if (target.year === year && target.month) {
            const monthIndex = new Date(
              `${target.month} 1, ${target.year}`
            ).getMonth();
            const shortMonth = monthNamesShort[monthIndex];
            if (monthlyDataMap[shortMonth]) {
              monthlyDataMap[shortMonth].target += parseFloat(
                target.amount || 0
              ); // Sales Target
              monthlyDataMap[shortMonth].clearedAmount += parseFloat(
                target.collection || 0
              ); // Actual Collection
            }
          }
        });
      }
    });

    const finalMonthlyData = Object.values(monthlyDataMap).map((item) => ({
      target: item.target.toString(),
      clearedAmount: item.clearedAmount.toString(),
      month: item.month,
    }));

    return finalMonthlyData;
  }

  // --- calculateMonthlyTargetCollectionData (MODIFIED: Uses target.collection for clearedAmount) ---
  // This is specifically for Target Collection vs Actual Collection.
  function calculateMonthlyTargetCollectionData(users, year) {
    const monthlyDataMap = {
      JAN: { target: 0, clearedAmount: 0, month: "JAN" },
      FEB: { target: 0, clearedAmount: 0, month: "FEB" },
      MAR: { target: 0, clearedAmount: 0, month: "MAR" },
      APR: { target: 0, clearedAmount: 0, month: "APR" },
      MAY: { target: 0, clearedAmount: 0, month: "MAY" },
      JUN: { target: 0, clearedAmount: 0, month: "JUN" },
      JUL: { target: 0, clearedAmount: 0, month: "JUL" },
      AUG: { target: 0, clearedAmount: 0, month: "AUG" },
      SEP: { target: 0, clearedAmount: 0, month: "SEP" },
      OCT: { target: 0, clearedAmount: 0, month: "OCT" },
      NOV: { target: 0, clearedAmount: 0, month: "NOV" },
      DEC: { target: 0, clearedAmount: 0, month: "DEC" },
    };

    users.forEach((user) => {
      if (user.targets && Array.isArray(user.targets)) {
        user.targets.forEach((target) => {
          if (target.year === year && target.month) {
            const monthIndex = new Date(
              `${target.month} 1, ${target.year}`
            ).getMonth();
            const shortMonth = monthNamesShort[monthIndex];
            if (monthlyDataMap[shortMonth]) {
              monthlyDataMap[shortMonth].target += parseFloat(
                target.amount || 0
              ); // Sales Target (can be used as collection target if applicable)
              monthlyDataMap[shortMonth].clearedAmount += parseFloat(
                target.collection || 0
              ); // Actual Collection
            }
          }
        });
      }
    });

    const finalMonthlyData = Object.values(monthlyDataMap).map((item) => ({
      target: item.target.toString(),
      clearedAmount: item.clearedAmount.toString(),
      month: item.month,
    }));

    return finalMonthlyData;
  }

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

  // --- fetchtableData: Fetches data for the employee table (if it's part of SalesDashboard) ---
  // This function is kept here as it uses SalesDashboard's states (tableDateRange)
  const fetchtableData = useCallback(async () => {
    try {
      const [telecallersRes, bdesRes] = await Promise.all([
        axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/users/get?designation=Telecaller`
        ),
        axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/users/get?designation=BDE`
        ),
      ]);

      const telecallers = telecallersRes.data.users;
      const bdes = bdesRes.data.users;

      const formattedStartDate = formatDateToISO(tableDateRange.startDate);
      const formattedEndDate = formatDateToISO(tableDateRange.endDate);

      const individualBusinessApiCalls = [];

      bdes.forEach((bde) => {
        const businessUrl = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?assignedTo=${
          bde._id
        }&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}&appointmentstartdate=${formattedStartDate}&appointmentenddate=${formattedEndDate}`;
        individualBusinessApiCalls.push(
          axios
            .get(businessUrl)
            .then((response) => ({
              type: "BDE_BUSINESS",
              id: bde._id,
              data: response.data,
            }))
            .catch((error) => {
              console.error(
                `Error fetching business data for BDE ID ${bde._id}:`,
                error
              );
              return {
                type: "BDE_BUSINESS",
                id: bde._id,
                error: error.message,
                data: { statusCount: {} },
              };
            })
        );
      });

      telecallers.forEach((telecaller) => {
        const businessUrl = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?createdBy=${
          telecaller._id
        }&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}&appointmentstartdate=${formattedStartDate}&appointmentenddate=${formattedEndDate}`;
        individualBusinessApiCalls.push(
          axios
            .get(businessUrl)
            .then((response) => ({
              type: "Telecaller_BUSINESS",
              id: telecaller._id,
              data: response.data,
            }))
            .catch((error) => {
              console.error(
                `Error fetching business data for Telecaller ID ${telecaller._id}:`,
                error
              );
              return {
                type: "Telecaller_BUSINESS",
                id: telecaller._id,
                error: error.message,
                data: { statusCount: {} },
              };
            })
        );
      });

      const allIndividualBusinessResults = await Promise.allSettled(
        individualBusinessApiCalls
      );

      const processedEmployees = [
        ...bdes.map((user) => ({
          ...user,
          role: user.designation,
          name: user.name,
          id: user._id,
          targets: user.targets || [],
          statuscount:
            allIndividualBusinessResults.find(
              (result) =>
                result.status === "fulfilled" &&
                result.value.type === "BDE_BUSINESS" &&
                result.value.id === user._id
            )?.value.data.statusCount || {},
          latestTarget: getLatestTargetForTable(
            user.targets,
            tableDateRange.startDate,
            tableDateRange.endDate
          ),
          collections: calculateCollectionForRange(
            user.targets,
            tableDateRange.startDate,
            tableDateRange.endDate
          ),
        })),
        ...telecallers.map((user) => ({
          ...user,
          role: user.designation,
          name: user.name,
          id: user._id,
          targets: user.targets || [],
          statuscount:
            allIndividualBusinessResults.find(
              (result) =>
                result.status === "fulfilled" &&
                result.value.type === "Telecaller_BUSINESS" &&
                result.value.id === user._id
            )?.value.data.statusCount || {},
          latestTarget: getLatestTargetForTable(
            user.targets,
            tableDateRange.startDate,
            tableDateRange.endDate
          ),
          collections: calculateCollectionForRange(
            user.targets,
            tableDateRange.startDate,
            tableDateRange.endDate
          ),
        })),
      ];
      setAllEmployees(processedEmployees);
    } catch (error) {
      console.error("Error fetching table data or employees:", error);
    }
  }, [tableDateRange, calculateCollectionForRange]); // Dependencies for useCallback

  // Helper function for fetchtableData to get the specific target for the table's date range
  const getLatestTargetForTable = useCallback((targets, startDate, endDate) => {
    if (!targets || targets.length === 0) return null;

    let filteredTargets = targets;

    const applyDateRangeFilter =
      startDate instanceof Date &&
      !isNaN(startDate) &&
      endDate instanceof Date &&
      !isNaN(endDate);

    if (applyDateRangeFilter) {
      const startOfMonthFilter = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
      );
      const endOfMonthFilter = new Date(
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        0
      );

      filteredTargets = targets.filter((target) => {
        const targetDate = new Date(
          target.year,
          new Date(Date.parse(target.month + " 1, 2000")).getMonth(),
          1
        );
        return (
          targetDate >= startOfMonthFilter && targetDate <= endOfMonthFilter
        );
      });
    }

    if (filteredTargets.length === 0) {
      return null;
    }

    const latestTarget = filteredTargets.reduce((latest, current) => {
      const currentTargetDate = new Date(current.month + " 1, " + current.year);
      const latestTargetDate = latest
        ? new Date(latest.month + " 1, " + latest.year)
        : null;

      return !latest || currentTargetDate > latestTargetDate ? current : latest;
    }, null);

    if (latestTarget) {
      latestTarget.amount = parseFloat(latestTarget.amount || 0);
      latestTarget.achievement = parseFloat(latestTarget.achievement || 0);
      latestTarget.collection = parseFloat(latestTarget.collection || 0);
    }
    return latestTarget;
  }, []); // No external dependencies for this useCallback

  // --- fetchTargetSalesGraphData ---
  const fetchTargetSalesGraphData = useCallback(async () => {
    try {
      const [telecallersRes, bdesRes] = await Promise.all([
        axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/users/get?designation=Telecaller`
        ),
        axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/users/get?designation=BDE`
        ),
      ]);
      const telecallers = telecallersRes.data.users;
      const bdes = bdesRes.data.users;

      const allUsersWithTargets = [...telecallers, ...bdes];

      const finalData = calculateMonthlyTargetSalesData(
        allUsersWithTargets,
        targetSalesYear
      );
      setTargetSalesGraphData(finalData);
    } catch (error) {
      console.error("Error fetching target sales graph data:", error);
    }
  }, [targetSalesYear]); // Dependency: targetSalesYear

  // --- fetchSalesCollectionGraphData ---
  const fetchSalesCollectionGraphData = useCallback(async () => {
    try {
      const [telecallersRes, bdesRes] = await Promise.all([
        axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/users/get?designation=Telecaller`
        ),
        axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/users/get?designation=BDE`
        ),
      ]);
      const telecallers = telecallersRes.data.users;
      const bdes = bdesRes.data.users;

      const allUsersWithTargets = [...telecallers, ...bdes];

      const finalData = calculateMonthlySalesCollectionData(
        allUsersWithTargets,
        salesCollectionYear
      );
      setSalesCollectionGraphData(finalData);
    } catch (error) {
      console.error("Error fetching sales collection graph data:", error);
    }
  }, [salesCollectionYear]); // Dependency: salesCollectionYear

  // --- fetchTargetCollectionGraphData ---
  const fetchTargetCollectionGraphData = useCallback(async () => {
    try {
      const [telecallersRes, bdesRes] = await Promise.all([
        axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/users/get?designation=Telecaller`
        ),
        axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/users/get?designation=BDE`
        ),
      ]);
      const telecallers = telecallersRes.data.users;
      const bdes = bdesRes.data.users;

      const allUsersWithTargets = [...telecallers, ...bdes];

      const finalData = calculateMonthlyTargetCollectionData(
        allUsersWithTargets,
        targetCollectionYear
      );
      setTargetCollectionGraphData(finalData);
    } catch (error) {
      console.error("Error fetching target collection graph data:", error);
    }
  }, [targetCollectionYear]); // Dependency: targetCollectionYear

  // --- Initial Data Fetches on Component Mount ---
  useEffect(() => {
    fetchBusinesses();
    fetchtableData(); // Also fetch table data initially
    fetchTargetSalesGraphData();
    fetchSalesCollectionGraphData();
    fetchTargetCollectionGraphData();
  }, [
    fetchBusinesses,
    fetchtableData,
    fetchTargetSalesGraphData,
    fetchSalesCollectionGraphData,
    fetchTargetCollectionGraphData,
  ]);

  // --- Fetch Filters (Cities and Categories) once on mount ---
  useEffect(() => {
    async function getFilters() {
      try {
        const [citiesResponse, categoriesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/city/get`),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/category/get`),
        ]);
        // Assuming your city/category endpoints return an array of objects with 'cityname'/'categoryname'
        setCities(citiesResponse.data.map((item) => item.cityname));
        setCategories(categoriesResponse.data.map((item) => item.categoryname));
      } catch (error) {
        console.log("Error fetching filters:", error);
      }
    }
    getFilters();
  }, []); // Empty dependency array means it runs once on mount

  // --- useEffect to trigger fetchtableData when tableDateRange changes ---
  useEffect(() => {
    fetchtableData();
  }, [tableDateRange, fetchtableData]); // Depend on tableDateRange and the memoized fetchtableData

  // --- useEffects to trigger graph data fetches when their respective years change ---
  useEffect(() => {
    fetchTargetSalesGraphData();
  }, [targetSalesYear, fetchTargetSalesGraphData]);

  useEffect(() => {
    fetchSalesCollectionGraphData();
  }, [salesCollectionYear, fetchSalesCollectionGraphData]);

  useEffect(() => {
    fetchTargetCollectionGraphData();
  }, [targetCollectionYear, fetchTargetCollectionGraphData]);

  // --- calculateCounts: Aggregates overall dashboard numbers ---
  const calculateCounts = useCallback(
    (data) => {
      const totalBusiness = data.totalCount;
      const followUps = data.statusCount.FollowupCount;
      const visits = data.statusCount.visitCount;
      const dealCloses = data.statusCount.dealCloseCount;

      let totalTargets = 0; // Overall sales target (sum of 'amount')
      let totalSalesAchievements = 0; // Overall sales achievement (sum of 'achievement')

      // Iterate through the combined targets array
      for (const item of data.target) {
        // Apply date range filter if provided for overall counts
        if (dateRange && dateRange.startDate && item.month && item.year) {
          const startDate = new Date(dateRange.startDate);
          const itemDate = new Date(
            Date.parse(`${item.month} 1, ${item.year}`)
          );

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
    },
    [dateRange]
  ); // Dependency: dateRange for filtering overall counts

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
    { name: "Overall Target", number: rupeeFormatter.format(counts.targets) }, // Display overall target
    {
      name: "Overall Sales Achievement",
      number: rupeeFormatter.format(counts.achievements),
    }, // Display overall sales achievement
  ];

  return (
    <AdminDashboardTemplate>
      <div className="p-4 flex flex-col gap-6">
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
                className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC] cursor-pointer"
              />

              {showDatePicker && (
                <div className="absolute z-10 top-full mt-2 left-0">
                  <DateRangePicker
                    ranges={[dateRange]}
                    onChange={handleDateRangeChange}
                    moveRangeOnFirstSelection={false}
                    rangeColors={["#0A5BFF"]}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isDateFilterApplied ? (
                <button
                  className="px-2 py-1 bg-[#0A5BFF] text-white rounded-md text-sm font-medium cursor-pointer"
                  onClick={() => {
                    // When "Show" is clicked, apply the date filter to the main dashboard counts
                    fetchBusinesses(); // This will use the 'dateRange' state
                    setIsDateFilterApplied(true);
                    setShowDatePicker(false);
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
              <span className="text-lg font-semibold text-[#0A5BFF]">
                {item.number}
              </span>
            </div>
          ))}
        </div>

        <EmployeeSection
          employees={allEmployees}
          dateRange={tableDateRange} // Pass tableDateRange for EmployeeSection's internal filtering
          setDateRange={setTableDateRange} // Allow EmployeeSection to update its own date range
          fetchtableData={fetchtableData} // Pass the function to re-fetch table data
        />

        <div className="flex flex-col gap-12 p-4 border-t border-[#cccccc] mt-8">
          <TargetSalesGraph
            selectedYear={targetSalesYear}
            setSelectedYear={setTargetSalesYear}
            data={targetSalesGraphData}
          />
        </div>
        <div className="flex flex-col gap-12 p-4 border-t border-[#cccccc] mt-8 ">
          <SalesCollectionGraph
            selectedYear={salesCollectionYear}
            setSelectedYear={setSalesCollectionYear}
            data={salesCollectionGraphData}
          />
        </div>
        <div className="flex flex-col gap-12 p-4 border-t border-[#cccccc] mt-8 ">
          <TargetCollectionGraph
            selectedYear={targetCollectionYear}
            setSelectedYear={setTargetCollectionYear}
            data={targetCollectionGraphData}
          />
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default SalesDashboard;
