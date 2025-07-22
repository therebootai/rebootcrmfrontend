import { useEffect, useCallback, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { GrCopy } from "react-icons/gr";
import { ToastContainer, toast } from "react-toastify";
import { DateRangePicker } from "react-date-range";
// main style file
// theme css file
import { format } from "date-fns";

import EditBusinessPopup from "../EditBusinessPopup";

import Modal from "react-modal";
import SendProposalForEmployee from "../SendProposalForEmployee";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import LoadingAnimation from "../LoadingAnimation";
import BdeMarkVisit from "./BdeMarkVisit";
import { AuthContext } from "../../context/AuthContext";

Modal.setAppElement("#root");

const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const BdeAppointmentData = () => {
  const { bdeId } = useParams(); // Retrieve bdeId from URL
  const [businesses, setBusinesses] = useState([]); // Stores businesses fetched from backend

  // Applied filter states (trigger data fetch when changed)
  const [mobileNumber, setMobileNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState(""); // Stores _id for city
  const [category, setCategory] = useState(""); // Stores _id for category
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });

  // Pending filter states (updated by user input, applied on button click)
  const [pendingMobileNumber, setPendingMobileNumber] = useState("");
  const [pendingBusinessName, setPendingBusinessName] = useState("");
  const [pendingCity, setPendingCity] = useState(""); // Stores _id for pending city
  const [pendingCategory, setPendingCategory] = useState(""); // Stores _id for pending category
  const [pendingStatus, setPendingStatus] = useState("");
  const [pendingDateRange, setPendingDateRange] = useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // States for dropdown options (populated from backend)
  const [uniqueCities, setUniqueCities] = useState([]); // Stores objects { _id, cityname }
  const [uniqueCategories, setUniqueCategories] = useState([]); // Stores objects { _id, categoryname }
  const [uniqueStatuses, setUniqueStatuses] = useState([]); // Stores string names for status

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showProposalPopup, setShowProposalPopup] = useState(false);
  const [showVistPopup, setShowVisitPopup] = useState(false); // For Mark Visited popup
  const [fetchLoading, setFetchLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [totalPage, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({
    totalBusiness: 0,
    followUps: 0,
    visits: 0, // This will be Appointment Generated count
    dealCloses: 0,
    target: {
      amount: 0,
      achievement: 0,
      percentage: 0,
    },
  });

  const { user } = useContext(AuthContext); // If AuthContext is needed for BDE data

  // --- Helper for Date Formatting (consistent with backend) ---
  const formatDateToISO = (date) => {
    if (!date) return "";
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return utcDate.toISOString();
  };

  // --- calculateCounts: Aggregates dashboard numbers based on fetched data ---
  const calculateCounts = useCallback(
    (data) => {
      const totalBusiness = data.totalCount || 0;
      const followUps = data.statusCount?.FollowupCount || 0;
      const visits = data.statusCount?.appointmentCount || 0; // Backend sends 'appointmentCount' for 'Visit' in BDE context
      const dealCloses = data.statusCount?.dealCloseCount || 0;

      let totalTargetsAmount = 0;
      let totalAchievementsAmount = 0;

      // Sum targets and achievements from the BDE's targets array within the selected date range
      if (data.targets && Array.isArray(data.targets)) {
        data.targets.forEach((target) => {
          if (target.month && target.year) {
            const targetDate = new Date(`${target.month} 1, ${target.year}`);
            // Check if targetDate falls within the applied dateRange
            if (
              (!dateRange.startDate ||
                targetDate >=
                  new Date(
                    dateRange.startDate.getFullYear(),
                    dateRange.startDate.getMonth(),
                    1
                  )) &&
              (!dateRange.endDate ||
                targetDate <=
                  new Date(
                    dateRange.endDate.getFullYear(),
                    dateRange.endDate.getMonth() + 1,
                    0 // Last day of the month
                  ))
            ) {
              totalTargetsAmount += parseFloat(target.amount || 0);
              totalAchievementsAmount += parseFloat(target.achievement || 0);
            }
          }
        });
      }

      const achievementPercentage =
        totalTargetsAmount > 0
          ? ((totalAchievementsAmount / totalTargetsAmount) * 100).toFixed(2)
          : 0;

      setCounts({
        totalBusiness,
        followUps,
        visits,
        dealCloses,
        target: {
          amount: totalTargetsAmount,
          achievement: totalAchievementsAmount,
          percentage: achievementPercentage,
        },
      });
    },
    [dateRange] // Dependency: dateRange to recalculate counts when filter changes
  );

  // --- fetchBusinessesData: Fetches business data and BDE targets from backend ---
  const fetchBusinessesData = useCallback(async () => {
    setFetchLoading(true);
    try {
      let params = {
        // Send assignedTo and createdBy as the current bdeId
        assignedTo: bdeId, // BDE is assignedTo
        createdBy: bdeId, // BDE also creates businesses
        page: currentPage,
        limit: itemsPerPage,
        appointmentstartdate: dateRange.startDate // BDE filters by appointmentDate
          ? formatDateToISO(dateRange.startDate)
          : null,
        appointmentenddate: dateRange.endDate
          ? formatDateToISO(dateRange.endDate)
          : null,
        mobileNumber,
        businessName,
        city, // This will be the _id of the city (if explicitly selected)
        category, // This will be the _id of the category (if explicitly selected)
        status,
        byTagAppointment: true, // Specific to BDE appointments
      };

      if (city === "") {
        params = {
          ...params,
          city: user.assignCities.map((c) => c._id).join(","),
        };
      } else {
        params = {
          ...params,
          city,
        };
      }

      if (category === "") {
        params = {
          ...params,
          category: user.assignCategories.map((c) => c._id).join(","),
        };
      } else {
        params = {
          ...params,
          category,
        };
      }

      // Filter out null/empty string parameters to avoid sending unnecessary query params
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(
          ([, value]) => value !== null && value !== ""
        )
      );

      const [busisnessResponse, leadByResponse, createdByResponse] =
        await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/business/get`, {
            params: filteredParams,
          }),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/business/get`, {
            params: {
              ...filteredParams,
              appointTo: bdeId,
            },
          }),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/business/get`, {
            params: {
              ...filteredParams,
              createdBy: bdeId,
            },
          }),
        ]);

      // Fetch BDE's own data for targets (from /api/users endpoint, assuming BDEs are Users)
      const bdeResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/users/get/${bdeId}`
      );

      const bdeData = bdeResponse.data; // Assuming bdeResponse.data contains 'targets' array

      const allBusinesses = [
        ...busisnessResponse.data.businesses,
        ...leadByResponse.data.businesses,
        ...createdByResponse.data.businesses,
      ];

      // Create a Map to store unique businesses, using a unique identifier (e.g., _id) as the key
      const uniqueBusinessesMap = new Map();
      allBusinesses.forEach((business) => {
        if (business && business._id) {
          // Ensure business and its _id exist
          uniqueBusinessesMap.set(business._id, business);
        }
      });

      // Convert the Map values back to an array
      const uniqueBusinessesArray = Array.from(uniqueBusinessesMap.values());

      setBusinesses(uniqueBusinessesArray);
      setTotalPages(busisnessResponse.data.totalPages || 1);

      // Pass the BDE's targets to calculateCounts
      calculateCounts({
        businesses: uniqueBusinessesArray,
        targets: bdeData.targets || [],
      });
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error("Error fetching data. Please try again.", {
        position: "bottom-center",
      });
    } finally {
      setFetchLoading(false);
    }
  }, [
    bdeId, // Dependency on bdeId
    currentPage,
    dateRange,
    mobileNumber,
    businessName,
    city,
    category,
    status,
    itemsPerPage,
    calculateCounts,
  ]);

  // --- Initial Data Fetch and subsequent fetches on filter/pagination change ---
  useEffect(() => {
    // Adjust currentPage if it's out of bounds after a filter change that might reduce total pages
    if (currentPage < 1) {
      setCurrentPage(1);
    } else if (currentPage > totalPage && totalPage > 0) {
      setCurrentPage(totalPage);
    }
    fetchBusinessesData();
  }, [
    bdeId, // Dependency on bdeId
    currentPage,
    dateRange,
    mobileNumber,
    businessName,
    city,
    category,
    status,
    totalPage,
    fetchBusinessesData,
  ]);

  // --- Fetch unique filter options (cities, categories, statuses) ---
  useEffect(() => {
    async function getFilters() {
      try {
        // Fetch ALL cities and categories for dropdowns
        const [citiesResponse, categoriesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/city/get`),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/category/get`),
        ]);

        // Map responses to { _id, name } format for dropdown options
        setUniqueCities(
          citiesResponse.data.map((item) => ({
            _id: item._id,
            cityname: item.cityname,
          })) || []
        );
        setUniqueCategories(
          categoriesResponse.data.map((item) => ({
            _id: item._id,
            categoryname: item.categoryname,
          })) || []
        );

        // Statuses are hardcoded as per previous version
        setUniqueStatuses([
          "Fresh Data",
          "Appointment Generated",
          "Followup",
          "Not Interested",
          "Invalid Data",
          "Not Responding",
          "Deal Closed",
          "Visited",
        ]);
      } catch (error) {
        console.error("Error fetching filters for dropdowns:", error);
      }
    }
    getFilters();
  }, []); // Empty dependency array means this runs once on mount

  // --- Date Range Handlers ---
  const handlePendingDateRangeChange = (ranges) => {
    setPendingDateRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: "selection",
    });
  };

  // --- Unified Apply Filters Function ---
  const applyAllFilters = () => {
    setDateRange(pendingDateRange);
    setMobileNumber(pendingMobileNumber);
    setBusinessName(pendingBusinessName);
    setCity(pendingCity);
    setCategory(pendingCategory);
    setStatus(pendingStatus);
    setCurrentPage(1); // Always reset to first page on applying new filters
    setShowDatePicker(false); // Close date picker
    // fetchBusinessesData will be triggered by the useEffect due to state changes
  };

  // --- Unified Clear All Filters Function ---
  const clearAllFilters = () => {
    const emptyDateRange = { startDate: null, endDate: null, key: "selection" };
    setPendingDateRange(emptyDateRange);
    setDateRange(emptyDateRange);

    setPendingMobileNumber("");
    setMobileNumber("");

    setPendingBusinessName("");
    setBusinessName("");

    setPendingCity("");
    setCity("");

    setPendingCategory("");
    setCategory("");

    setPendingStatus("");
    setStatus("");

    setCurrentPage(1); // Reset to first page
    setShowDatePicker(false); // Ensure date picker is closed
    // fetchBusinessesData will be triggered by the useEffect due to state changes
  };

  // --- Utility for formatting dates for display ---
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Handle invalid dates

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)

    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  };

  // --- Handle Copy to Clipboard ---
  const handleCopy = (business) => {
    const leadText = `Name: ${business.buisnessname}\nMobile Number: ${
      business.mobileNumber
    }\nCity: ${business.city?.cityname || business.city || "N/A"}\nCategory: ${
      business.category?.categoryname || business.category || "N/A"
    }\nStatus: ${business.status}\nFollow-up Date: ${formatDate(
      business.followUpDate
    )}`;

    const textArea = document.createElement("textarea");
    textArea.value = leadText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      toast.success("Lead copied to clipboard", {
        position: "bottom-center",
        icon: "✅",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy lead to clipboard.", {
        position: "bottom-center",
      });
    }
    document.body.removeChild(textArea);
  };

  // --- Modal Open/Close Handlers ---
  const openProposalPopup = (business) => {
    setSelectedBusiness(business);
    setShowProposalPopup(true);
  };

  const closeProposalPopup = () => {
    setShowProposalPopup(false);
    setSelectedBusiness(null);
  };

  const handleEdit = (business) => {
    setSelectedBusiness(business);
    setShowEditPopup(true);
  };

  const handlePopupClose = () => {
    setShowEditPopup(false);
    setSelectedBusiness(null);
    fetchBusinessesData(); // Re-fetch data after edit to ensure consistency
  };

  // handleUpdate is for client-side immediate update, but fetchBusinessesData will refresh from server
  const handleUpdate = (updatedBusiness) => {
    setBusinesses((prevBusinesses) =>
      prevBusinesses.map((business) =>
        business._id === updatedBusiness._id // Use _id for comparison
          ? { ...business, ...updatedBusiness }
          : business
      )
    );
    // No need to update filteredBusinesses as it's removed
  };

  // --- Pagination Controls ---
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPage) {
      setCurrentPage(pageNumber);
    }
  };

  const pageRange = 5;
  let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
  let endPage = startPage + pageRange - 1;

  if (endPage > totalPage) {
    endPage = totalPage;
    startPage = Math.max(1, endPage - pageRange + 1);
  }

  const dashboard = [
    { name: "Total Business", number: counts.totalBusiness },
    { name: "Follow Ups", number: counts.followUps },
    { name: "Visit", number: counts.visits }, // Renamed from Appointment Generated to Visit as per BDE context
    { name: "Deal Close", number: counts.dealCloses },
    {
      name: "Achievement",
      number: `${rupeeFormatter.format(counts.target.achievement)} (${
        counts.target.percentage
      }%)`,
    },
    { name: "Target", number: rupeeFormatter.format(counts.target.amount) },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="py-4 border-b border-[#cccccc] w-full flex flex-wrap gap-4 items-center">
        <h1 className="text-[#777777] text-lg font-semibold">Filter</h1>
        {/* Date range input */}
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <input
              type="text"
              value={
                pendingDateRange.startDate && pendingDateRange.endDate
                  ? `${format(
                      pendingDateRange.startDate,
                      "dd/MM/yyyy"
                    )} - ${format(pendingDateRange.endDate, "dd/MM/yyyy")}`
                  : "Select Date Range"
              }
              onClick={() => setShowDatePicker(!showDatePicker)}
              readOnly
              className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC] cursor-pointer"
            />
            {showDatePicker && (
              <div className="absolute z-10 top-full mt-2 left-0">
                <DateRangePicker
                  ranges={[pendingDateRange]}
                  onChange={handlePendingDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  rangeColors={["#ff2722"]}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <input
            type="text"
            name="mobileNumber"
            placeholder="Mobile Number"
            value={pendingMobileNumber}
            onChange={(e) => setPendingMobileNumber(e.target.value)}
            className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
          />
        </div>
        <div>
          <input
            type="text"
            name="businessName"
            placeholder="Business Name"
            value={pendingBusinessName}
            onChange={(e) => setPendingBusinessName(e.target.value)}
            className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
          />
        </div>
        <div>
          <select
            name="city"
            value={pendingCity}
            onChange={(e) => setPendingCity(e.target.value)}
            className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
          >
            <option value="">By City/Town</option>
            {uniqueCities.map((cityOption) => (
              <option key={cityOption._id} value={cityOption._id}>
                {cityOption.cityname}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            name="category"
            value={pendingCategory}
            onChange={(e) => setPendingCategory(e.target.value)}
            className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
          >
            <option value="">By Category</option>
            {uniqueCategories.map((catOption) => (
              <option key={catOption._id} value={catOption._id}>
                {catOption.categoryname}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            name="status"
            value={pendingStatus}
            onChange={(e) => setPendingStatus(e.target.value)}
            className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
          >
            <option value="">By Status</option>
            {uniqueStatuses.map((statusOption, index) => (
              <option key={index} value={statusOption}>
                {statusOption}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 bg-[#FF2722] text-white rounded-md text-sm font-medium cursor-pointer"
            onClick={applyAllFilters}
          >
            Apply Filters
          </button>
          <button
            className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm font-medium cursor-pointer"
            onClick={clearAllFilters}
          >
            Clear All
          </button>
        </div>
      </div>
      <div className="flex flex-wrap md:gap-6 sm:gap-3 lg:gap-8">
        {dashboard.map((item, index) => (
          <div
            key={index}
            className="p-4 sm:px-6 lg:px-10 text-center border border-[#CCCCCC] flex flex-col gap-0 boxsh"
          >
            <span className="md:text-xl sm:text-lg font-semibold text-[#777777]">
              {item.name}
            </span>
            <span className="md:text-lg sm:text-base font-semibold text-[#FF2722]">
              {item.number}
            </span>
          </div>
        ))}
      </div>
      {fetchLoading ? (
        <LoadingAnimation />
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {businesses.length > 0 ? (
            businesses.map((business, index) => (
              <div
                key={business._id || index} // Use _id for unique key if available
                className="bg-white text-[#2F2C49] w-full rounded-lg border border-[#CCCCCC] text-sm font-medium flex justify-between p-4"
              >
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex justify-between w-full items-center">
                    <div className="flex items-center gap-2">
                      <span>
                        <GoDotFill />
                      </span>
                      <span>{business.buisnessname}</span>
                    </div>
                    <div className="flex text-lg gap-4 ">
                      <div
                        className=" cursor-pointer text-[#00A3FF]"
                        onClick={() => handleEdit(business)}
                      >
                        <FaRegEdit />
                      </div>
                      <div
                        onClick={() => handleCopy(business)}
                        className=" cursor-pointer text-[#777777]"
                      >
                        <GrCopy />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      <GoDotFill />
                    </span>
                    <a href={`tel:${business.mobileNumber}`}>
                      {business.mobileNumber}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      <GoDotFill />
                    </span>
                    <span>
                      {business.status} - (
                      {business.followUpDate
                        ? formatDate(business.followUpDate)
                        : "No Date"}
                      )
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      <GoDotFill />
                    </span>
                    <span>{business.category?.categoryname || "N/A"}</span>
                  </div>
                  <div className="flex justify-between w-full items-end ">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span>
                          <GoDotFill />
                        </span>
                        <span>{business.city?.cityname || "N/A"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>
                          <GoDotFill />
                        </span>
                        <span>
                          {business.appointmentDate
                            ? formatDate(business.appointmentDate)
                            : "No Appointment Date"}
                        </span>
                      </div>
                      {/* Assuming remarks is still needed here */}
                      <div className="flex items-center gap-2">
                        <span>
                          <GoDotFill />
                        </span>
                        <span>{business.remarks}</span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-white">
                      <button
                        onClick={() => openProposalPopup(business)}
                        className="px-2 p-1 bg-[#FF2722] rounded-md text-sm font-semibold"
                      >
                        Send Proposal
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBusiness(business);
                          setShowVisitPopup(true);
                        }}
                        className="px-2 p-1 bg-green-500 rounded-md text-sm font-semibold"
                      >
                        Mark Visited
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col "></div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">
              No businesses found
            </p>
          )}
        </div>
      )}

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
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => (
            <button
              key={startPage + i}
              className={`px-4 py-2 ${
                currentPage === startPage + i
                  ? "text-[#D53F3A]"
                  : "text-[#777777]"
              } font-bold rounded`}
              onClick={() => handlePageChange(startPage + i)}
            >
              {startPage + i}
            </button>
          ))}
        </div>
        <button
          className={`flex gap-1 text-center items-center ${
            currentPage === totalPage ? "text-[#777777]" : "text-[#D53F3A]"
          } font-bold rounded`}
          disabled={currentPage === totalPage}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <div>Next</div>
          <div>
            <MdKeyboardDoubleArrowRight />
          </div>
        </button>
      </div>

      {/* Proposal Modal */}
      {showProposalPopup && selectedBusiness && (
        <Modal
          isOpen={showProposalPopup}
          onRequestClose={closeProposalPopup}
          contentLabel="Send Proposal Modal"
          className="model-proposal !overflow-y-scroll no-scrollbar"
          overlayClassName="modal-overlay"
        >
          <button onClick={closeProposalPopup} className="close-button">
            &times;
          </button>
          <SendProposalForEmployee
            business={selectedBusiness}
            onClose={closeProposalPopup}
          />
        </Modal>
      )}

      {/* Edit Business Popup */}
      {selectedBusiness && showEditPopup && (
        <EditBusinessPopup
          show={showEditPopup}
          onClose={handlePopupClose}
          business={selectedBusiness}
          onUpdate={handleUpdate}
        />
      )}

      {/* Mark Visit Popup */}
      {selectedBusiness && showVistPopup && (
        <BdeMarkVisit
          show={showVistPopup}
          onClose={() => {
            setShowVisitPopup(false);
            setSelectedBusiness(null);
            fetchBusinessesData(); // Re-fetch data after visit update
          }}
          business={selectedBusiness}
          onUpdate={handleUpdate}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default BdeAppointmentData;
