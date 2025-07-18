import React, { useEffect, useMemo, useState } from "react";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import { DateRangePicker } from "react-date-range";
import axios from "axios";
import { format } from "date-fns";
import EmployeeSection from "../component/salesDashboard/EmployeeSection";
import TargetSalesGraph from "../component/salesDashboard/TargetSalesGraph";
import SalesCollectionGraph from "../component/salesDashboard/SalesCollectionGraph";
import TargetCollectionGraph from "../component/salesDashboard/TargetCollectionGraph";

const SalesDashboard = () => {
  const [counts, setCounts] = useState({
    totalBusiness: 0,
    followUps: 0,
    visits: 0,
    dealCloses: 0,
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
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);

  const [targetSalesYear, setTargetSalesYear] = useState(
    new Date().getFullYear()
  );
  const [targetSalesGraphData, setTargetSalesGraphData] = useState([]);

  function calculateMonthlyTargetSalesData(bdes, telecallers, year) {
    // Initialize monthly aggregates for the entire year
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

    // --- Aggregate Targets from BDEs ---
    bdes.forEach((bde) => {
      if (bde.targets && Array.isArray(bde.targets)) {
        bde.targets.forEach((target) => {
          // Only include targets for the specified year
          if (target.year === year) {
            const monthIndex = new Date(
              `${target.month} 1, ${target.year}`
            ).getMonth();
            const shortMonth = monthNamesShort[monthIndex];
            if (monthlyDataMap[shortMonth]) {
              monthlyDataMap[shortMonth].target += target.amount || 0;
              monthlyDataMap[shortMonth].clearedAmount +=
                target.achievement || 0;
            }
          }
        });
      }
    });

    // --- Aggregate Targets from Telecallers ---
    telecallers.forEach((telecaller) => {
      if (telecaller.targets && Array.isArray(telecaller.targets)) {
        telecaller.targets.forEach((target) => {
          // Only include targets for the specified year
          if (target.year === year) {
            const monthIndex = new Date(
              `${target.month} 1, ${target.year}`
            ).getMonth();
            const shortMonth = monthNamesShort[monthIndex];
            if (monthlyDataMap[shortMonth]) {
              monthlyDataMap[shortMonth].target += target.amount || 0;
              monthlyDataMap[shortMonth].clearedAmount +=
                target.achievement || 0;
            }
          }
        });
      }
    });

    // // --- Aggregate Cleared Amounts from Client Data ---
    // allIndividualResults.forEach((result) => {
    //   if (
    //     result.status === "fulfilled" &&
    //     (result.value.type === "BDE_CLIENT" ||
    //       result.value.type === "Telecaller_CLIENT") &&
    //     result.value.data // Ensure data exists for client results
    //   ) {
    //     // Assuming client data is an array where each item might have collections
    //     result.value.data.forEach((clientItem) => {
    //       if (clientItem.collections && Array.isArray(clientItem.collections)) {
    //         clientItem.collections.forEach((collection) => {
    //           if (collection.date && typeof collection.amount === "number") {
    //             // Ensure amount is a number
    //             const collectionDate = new Date(collection.date);
    //             // Only include collections for the specified year
    //             if (collectionDate.getFullYear() === year) {
    //               const monthIndex = collectionDate.getMonth();
    //               const shortMonth = monthNamesShort[monthIndex];
    //               if (monthlyDataMap[shortMonth]) {
    //                 monthlyDataMap[shortMonth].clearedAmount +=
    //                   collection.amount;
    //               }
    //             }
    //           }
    //         });
    //       }
    //     });
    //   }
    // });

    // Convert the aggregated map into the final array format
    const finalMonthlyTargetSalesData = Object.values(monthlyDataMap).map(
      (item) => ({
        target: item.target.toString(), // Convert to string as per your desired format
        clearedAmount: item.clearedAmount.toString(), // Convert to string
        month: item.month,
      })
    );

    return finalMonthlyTargetSalesData;
  }

  const fetchBusinesses = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?category=${selectedCategory}&city=${selectedCity}&createdstartdate=${
          dateRange.startDate
            ? new Date(
                dateRange.startDate.getTime() -
                  dateRange.startDate.getTimezoneOffset() * 60000
              ).toISOString()
            : ""
        }&createdenddate=${
          dateRange.endDate
            ? new Date(
                dateRange.endDate.getTime() -
                  dateRange.endDate.getTimezoneOffset() * 60000
              ).toISOString()
            : ""
        }`
      );
      const [telecallers, digitalMarketers, bdes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/telecaller/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/digitalmarketer/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/bde/get`),
      ]);

      const businessData = response.data;

      const combinedData = {
        target: [
          ...telecallers.data.map((item) => item.targets),
          ...digitalMarketers.data.map((item) => item.targets),
          ...bdes.data.map((item) => item.targets),
        ].flat(),
      };

      calculateCounts({ ...businessData, ...combinedData });
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  const fetchtableData = async () => {
    try {
      const [telecallers, bdes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/telecaller/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/bde/get`),
      ]);

      let employeeIds = {
        BDE: bdes.data.map((item) => item.bdeId),
        Telecaller: telecallers.data.map((item) => item.telecallerId),
      };

      let employeeObjectIds = {
        BDE: bdes.data.map((item) => item._id),
        Telecaller: telecallers.data.map((item) => item._id),
      };

      const formatDateToISO = (date) => {
        if (!date) return "";
        // Subtract the timezone offset to get the UTC equivalent for an ISO string
        const utcDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        );
        return utcDate.toISOString();
      };

      const formattedStartDate = formatDateToISO(tableDateRange.startDate);
      const formattedEndDate = formatDateToISO(tableDateRange.endDate);

      const individualApiCalls = [];

      // --- Prepare BDE API Calls ---
      employeeIds.BDE.forEach((bdeId) => {
        const businessUrl = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?bdeId=${bdeId}&byTagAppointment=true&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}&appointmentstartdate=${formattedStartDate}&appointmentenddate=${formattedEndDate}`;
        individualApiCalls.push(
          axios
            .get(businessUrl)
            .then((response) => ({
              type: "BDE",
              id: bdeId,
              data: response.data,
            }))
            .catch((error) => {
              console.error(`Error fetching data for BDE ID ${bdeId}:`, error);
              return { type: "BDE", id: bdeId, error: error.message, data: [] }; // Return empty data on error
            })
        );
      });

      employeeObjectIds.BDE.forEach((bdeId) => {
        const clientUrl = `${
          import.meta.env.VITE_BASE_URL
        }/api/client/get?bdeName=${bdeId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
        individualApiCalls.push(
          axios
            .get(clientUrl)
            .then((response) => ({
              type: "BDE",
              id: bdeId,
              data: response.data,
            }))
            .catch((error) => {
              console.error(`Error fetching data for BDE ID ${bdeId}:`, error);
              return { type: "BDE", id: bdeId, error: error.message, data: [] }; // Return empty data on error
            })
        );
      });

      // --- Prepare Telecaller API Calls ---
      employeeIds.Telecaller.forEach((telecallerId) => {
        const businessUrl = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?telecallerId=${telecallerId}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}&appointmentstartdate=${formattedStartDate}&appointmentenddate=${formattedEndDate}`;
        individualApiCalls.push(
          axios
            .get(businessUrl)
            .then((response) => ({
              type: "Telecaller",
              id: telecallerId,
              data: response.data,
            }))
            .catch((error) => {
              console.error(
                `Error fetching data for Telecaller ID ${telecallerId}:`,
                error
              );
              return {
                type: "Telecaller",
                id: telecallerId,
                error: error.message,
                data: [],
              }; // Return empty data on error
            })
        );
      });

      employeeObjectIds.Telecaller.forEach((telecallerId) => {
        const clientUrl = `${
          import.meta.env.VITE_BASE_URL
        }/api/client/get?tmeLeads=${telecallerId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
        individualApiCalls.push(
          axios
            .get(clientUrl)
            .then((response) => ({
              type: "Telecaller",
              id: telecallerId,
              data: response.data,
            }))
            .catch((error) => {
              console.error(
                `Error fetching data for Telecaller ID ${telecallerId}:`,
                error
              );
              return {
                type: "Telecaller",
                id: telecallerId,
                error: error.message,
                data: [],
              }; // Return empty data on error
            })
        );
      });

      // Execute all individual API calls concurrently
      const allIndividualResults = await Promise.allSettled(individualApiCalls);

      setAllEmployees([
        ...bdes.data.map((item) => ({
          ...item,
          role: "BDE",
          name: item.bdename,
          id: item.bdeId,
          targets: item.targets || [],
          statuscount: allIndividualResults.find(
            (result) =>
              result.status === "fulfilled" &&
              result.value.type === "BDE" &&
              result.value.id === item.bdeId
          ).value.data.statuscount,
          collections: allIndividualResults.find(
            (result) =>
              result.status === "fulfilled" &&
              result.value.type === "BDE" &&
              result.value.id === item._id
          ).value.data.data,
        })),
        ...telecallers.data.map((item) => ({
          ...item,
          role: "Telecaller",
          name: item.telecallername,
          id: item.telecallerId,
          targets: item.targets || [],
          statuscount: allIndividualResults.find(
            (result) =>
              result.status === "fulfilled" &&
              result.value.type === "Telecaller" &&
              result.value.id === item.telecallerId
          ).value.data.statuscount,
        })),
      ]);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  const fetchTargetSalesGraphData = async () => {
    try {
      const [telecallers, bdes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/telecaller/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/bde/get`),
      ]);

      const finalData = calculateMonthlyTargetSalesData(
        bdes.data.targets,
        telecallers.data.targets
      );

      setTargetSalesGraphData(finalData);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  useEffect(() => {
    fetchBusinesses();
    fetchtableData();
  }, []);

  useMemo(() => {
    async function getFilters() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/business/getfilter`
        );
        const data = response.data;
        setCities(data.cities);
        setCategories(data.businessCategories);
      } catch (error) {
        console.log(error);
      }
    }
    getFilters();
    fetchTargetSalesGraphData();
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [dateRange, selectedCategory, selectedCity]);

  useEffect(() => {
    fetchtableData();
    fetchTargetSalesGraphData();
  }, [tableDateRange]);

  const calculateCounts = (data) => {
    const totalBusiness = data.totalCount;
    const followUps = data.statuscount.FollowupCount;
    const visits = data.statuscount.visitCount;
    const dealCloses = data.statuscount.dealCloseCount;

    let targets = 0,
      achievements = 0;

    for (const item of data.target) {
      if (dateRange && dateRange.startDate) {
        const startDate = new Date(dateRange.startDate);
        const itemMonthIndex = new Date(
          Date.parse(item.month + " 1, " + item.year)
        ).getMonth(); // Convert month name to 0-11 index
        const itemYear = item.year;

        // Compare by month (0-11 index) and year
        if (
          itemMonthIndex === startDate.getMonth() &&
          itemYear === startDate.getFullYear()
        ) {
          targets += item.amount;
          achievements += parseInt(item.achievement);
        }
      } else {
        // If no dateRange.startDate is provided, sum all amounts
        targets += item.amount;
        achievements += parseInt(item.achievement ?? 0);
      }
    }

    setCounts({
      totalBusiness,
      followUps,
      visits,
      dealCloses,
      targets,
      achievements,
    });
  };

  const handleDateRangeChange = (ranges) => {
    setDateRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: "selection",
    });

    setIsDateFilterApplied(false);
  };

  const clearDateFilter = () => {
    const emptyDateRange = {
      startDate: "",
      endDate: "",
      key: "selection",
    };
    setDateRange(emptyDateRange);
    setIsDateFilterApplied(false);
    fetchBusinesses(category, city, mobileNumber, 1, emptyDateRange);
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
  ];

  return (
    <AdminDashboardTemplate>
      <div className=" p-4 flex flex-col gap-6">
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
                    rangeColors={["#0A5BFF"]}
                  />
                </div>
              )}
            </div>

            <div className=" flex items-center gap-2">
              {!isDateFilterApplied ? (
                <button
                  className="px-2 py-1 bg-[#0A5BFF] text-white rounded-md text-sm font-medium cursor-pointer"
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
                <option key={index} value={city}>
                  {city}
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
                <option key={index} value={category}>
                  {category}
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
          dateRange={tableDateRange}
          setDateRange={setTableDateRange}
          fetchtableData={fetchtableData}
        />
      </div>
      <div className=" flex flex-col gap-12 p-4 border-t border-[#cccccc] mt-8">
        <TargetSalesGraph
          selectedYear={targetSalesYear}
          setSelectedYear={setTargetSalesYear}
          data={targetSalesGraphData}
        />
      </div>
      <div className=" flex flex-col gap-12 p-4 border-t border-[#cccccc] mt-8 ">
        <SalesCollectionGraph />
      </div>
      <div className=" flex flex-col gap-12 p-4 border-t border-[#cccccc] mt-8 ">
        <TargetCollectionGraph />
      </div>
    </AdminDashboardTemplate>
  );
};

export default SalesDashboard;
