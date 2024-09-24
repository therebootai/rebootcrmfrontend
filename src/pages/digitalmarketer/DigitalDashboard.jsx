import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { DateRangePicker } from "react-date-range";
import DigitalDashboardTemplate from "../../template/DigitalDashboardTemplate";
import DigitalMarketerCallingData from "../../component/digitalmarketer/DigitalMarketerCallingData";

const DigitalDashboard = () => {
  const { digitalMarketerId } = useParams(); // Retrieve digitalMarketerId from URL
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
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
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/business/get?digitalMarketerId=${digitalMarketerId}`
        );
        const businessData = response.data;

        // Extract unique categories and cities for the dropdowns
        const uniqueCategories = [
          ...new Set(businessData.map((business) => business.category)),
        ];
        const uniqueCities = [
          ...new Set(businessData.map((business) => business.city)),
        ];

        setBusinesses(businessData);
        setCategories(uniqueCategories);
        setCities(uniqueCities);

        // Set the initial state to display all businesses
        setFilteredBusinesses(businessData);
        calculateCounts(businessData);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };

    fetchBusinesses();
  }, [digitalMarketerId]);

  useEffect(() => {
    filterAndSetData();
  }, [dateRange, selectedCategory, selectedCity]);

  const calculateCounts = (data) => {
    const totalBusiness = data.length;
    const followUps = data.filter(
      (business) => business.status === "Followup"
    ).length;
    const visits = data.filter(
      (business) => business.status === "Appointment Generated"
    ).length;
    const dealCloses = data.filter(
      (business) => business.status === "Deal Closed"
    ).length;

    setCounts({
      totalBusiness,
      followUps,
      visits,
      dealCloses,
    });
  };

  const filterAndSetData = () => {
    let filtered = businesses;

    // Apply date range filter only if both dates are selected
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((business) => {
        const createdAt = new Date(business.createdAt);
        return (
          createdAt >= dateRange.startDate && createdAt <= dateRange.endDate
        );
      });
    }

    // Apply category filter if selected
    if (selectedCategory) {
      filtered = filtered.filter(
        (business) => business.category === selectedCategory
      );
    }

    // Apply city filter if selected
    if (selectedCity) {
      filtered = filtered.filter((business) => business.city === selectedCity);
    }

    // Update state with filtered data and recalculate counts
    setFilteredBusinesses(filtered);
    calculateCounts(filtered);
  };

  const handleDateRangeChange = (ranges) => {
    setDateRange(ranges.selection);
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
    { name: "Appointment Generated", number: counts.visits },
    { name: "Deal Close", number: counts.dealCloses },
  ];

  return (
    <DigitalDashboardTemplate>
      <div className="flex flex-col gap-4">
        <div className="py-4 border-b border-[#cccccc] w-full flex flex-wrap gap-4 items-center relative">
          <h1 className="text-[#777777] text-lg font-semibold">Filter</h1>
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
          <DigitalMarketerCallingData businesses={filteredBusinesses} />
        </div>
      </div>
    </DigitalDashboardTemplate>
  );
};

export default DigitalDashboard;
