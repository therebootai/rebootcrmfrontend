import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import { DateRangePicker } from "react-date-range";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import DashboardEmployeeSection from "../component/adminbuisness/DashboardEmployeeSection";

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
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
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(true);

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
      const businessData = response.data;

      setBusinesses(businessData.businesses);

      calculateCounts(businessData);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  useEffect(() => {
    fetchBusinesses();
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
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [dateRange, selectedCategory, selectedCity]);

  const calculateCounts = (data) => {
    const totalBusiness = data.totalCount;
    const followUps = data.statuscount.FollowupCount;
    const visits = data.statuscount.visitCount;
    const dealCloses = data.statuscount.dealCloseCount;

    setCounts({
      totalBusiness,
      followUps,
      visits,
      dealCloses,
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
