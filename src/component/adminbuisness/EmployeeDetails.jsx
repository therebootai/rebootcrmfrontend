import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { format } from "date-fns";
import AdminDashboardTemplate from "../../template/AdminDashboardTemplate";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import LoadingAnimation from "../LoadingAnimation";

const EmployeeDetails = () => {
  const { role, id } = useParams(); // Get the role and id from the URL
  const [data, setData] = useState([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null, // Default to null to avoid filtering on date initially
    endDate: null, // Default to null to avoid filtering on date initially
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 20; // You can adjust this to control the number of items per page

  const fetchEmployeeBusinessData = async () => {
    try {
      setFetchLoading(true);
      let url = "";
      if (role === "telecaller") {
        url = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?telecallerId=${id}&page=${currentPage}&status=${status}&category=${category}&city=${city}&mobileNumber=${mobileNumber}&startDate=${
          dateRange.startDate?.toISOString() || ""
        }&endDate=${dateRange.endDate?.toISOString() || ""}`;
      } else if (role === "digitalmarketer") {
        url = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?digitalMarketerId=${id}&page=${currentPage}&status=${status}&category=${category}&city=${city}&mobileNumber=${mobileNumber}&startDate=${
          dateRange.startDate?.toISOString() || ""
        }&endDate=${dateRange.endDate?.toISOString() || ""}`;
      } else if (role === "bde") {
        url = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?bdeId=${id}&byTagAppointment=true&page=${currentPage}&status=${status}&category=${category}&city=${city}&mobileNumber=${mobileNumber}&startDate=${
          dateRange.startDate?.toISOString() || ""
        }&endDate=${dateRange.endDate?.toISOString() || ""}`;
      }

      const response = await axios.get(url);
      setData(response.data.businesses);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching business data:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeBusinessData();
  }, [role, id, currentPage]);

  useMemo(() => {
    async function getFilters() {
      try {
        let endpointParams = {};
        if (role === "telecaller") endpointParams.telecallerId = id;
        if (role === "digitalmarketer") endpointParams.digitalMarketerId = id;
        if (role === "bde") endpointParams.bdeId = id;

        const queryParams = new URLSearchParams(endpointParams).toString();
        const url = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/getfilter?${queryParams}`;

        const response = await axios.get(url);

        setUniqueCities(response.data.cities || []);
        setUniqueCategories(response.data.businessCategories || []);
        setUniqueStatuses(response.data.status || []);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    }
    getFilters();
  }, []);

  useEffect(() => {
    fetchEmployeeBusinessData();
  }, [dateRange, mobileNumber, city, category, status]);

  const handleDateRangeChange = (ranges) => {
    setCurrentPage(1);
    setDateRange(ranges.selection);
    setShowDatePicker(false); // hide the date picker after selection
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const pageRange = 5;
  let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
  let endPage = startPage + pageRange - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - pageRange + 1);
  }

  const headers = [
    "Business Name",
    "Contact Person",
    "Mobile Number",
    "City",
    "Category",
    "Source",
    "Status",
  ];

  return (
    <AdminDashboardTemplate>
      <div className="w-full flex flex-col gap-4">
        <div className="py-4 border-b border-[#cccccc] w-full flex flex-row gap-4 items-center">
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
          <div className="">
            <input
              type="text"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={mobileNumber}
              onChange={(e) => {
                setCurrentPage(1);
                setMobileNumber(e.target.value);
              }}
              className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
            />
          </div>
          <div>
            <select
              name="city"
              value={city}
              onChange={(e) => {
                setCurrentPage(1);
                setCity(e.target.value);
              }}
              className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
            >
              <option value="">By City/Town</option>
              {uniqueCities.map((city, index) => (
                <option key={index} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="category"
              value={category}
              onChange={(e) => {
                setCurrentPage(1);
                setCategory(e.target.value);
              }}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">By Category</option>
              {uniqueCategories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="status"
              value={status}
              onChange={(e) => {
                setCurrentPage(1);
                setStatus(e.target.value);
              }}
              className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
            >
              <option value="">By Status</option>
              {uniqueStatuses.map((status, index) => (
                <option key={index} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-center gap-4 pb-4 border-b items-center mt-4">
          <button
            className={`flex gap-1 text-center items-center ${
              currentPage === 1 ? "text-[#777777]" : "text-[#D53F3A]"
            } font-bold rounded`}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <div>
              <MdKeyboardDoubleArrowLeft />
            </div>
            <div>Prev</div>
          </button>
          <div className="flex gap-2">
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
              const pageNumber = startPage + i; // Calculate the correct page number
              return (
                <button
                  key={pageNumber}
                  className={`px-4 py-2 ${
                    currentPage === pageNumber
                      ? "text-[#D53F3A]"
                      : "text-[#777777]"
                  } font-bold rounded`}
                  onClick={() => handlePageChange(pageNumber)} // Pass the correct page number
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          <button
            className={`flex gap-1 text-center items-center ${
              currentPage === totalPages ? "text-[#777777]" : "text-[#D53F3A]"
            } font-bold rounded`}
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <div>Next</div>
            <div>
              <MdKeyboardDoubleArrowRight />
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {fetchLoading ? (
            <LoadingAnimation />
          ) : (
            <>
              <div className="flex gap-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex-1 text-base font-medium">
                    {header}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                {data.length > 0 ? (
                  data.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex flex-row gap-2 text-[#777777] text-sm font-medium"
                    >
                      <div className="flex-1">{row.buisnessname}</div>
                      <div className="flex-1">{row.contactpersonName}</div>
                      <div className="flex-1">{row.mobileNumber}</div>
                      <div className="flex-1">{row.city}</div>
                      <div className="flex-1">{row.category}</div>
                      <div className="flex-1">{row.source}</div>
                      <div className="flex-1">{row.status}</div>
                    </div>
                  ))
                ) : (
                  <div>No business data available</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default EmployeeDetails;
