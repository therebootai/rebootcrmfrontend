import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import Modal from "react-modal";
import AddBuisness from "../component/adminbuisness/AddBuisness";
import ManageBusiness from "../component/adminbuisness/ManageBusiness";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DuplicatePopup from "../component/DuplicatePopup";
import { DateRangePicker } from "react-date-range";

import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import SendSingleProposal from "../component/adminbuisness/SendSingleProposal";

const AddAndManageBuisness = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState([]); // This will hold the paginated data from backend
  // const [filteredBusinesses, setFilteredBusinesses] = useState([]); // REMOVED: Redundant, backend handles filtering
  const [mobileNumber, setMobileNumber] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([
    // Hardcode unique statuses as they are fixed enums
    "Fresh Data",
    "Appointment Generated",
    "Followup",
    "Not Interested",
    "Invalid Data",
    "Not Responding",
    "Deal Closed",
    "Visited",
  ]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [duplicateNumbers, setDuplicateNumbers] = useState([]);
  const [loading, setLoading] = useState(false); // For import loading
  const [fetchLoading, setFetchLoading] = useState(false); // For business fetch loading
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isNewDataImport, setIsNewDataImport] = useState(false); // To trigger re-fetch after import
  const [dateRange, setDateRange] = useState({
    startDate: null, // Use null for initial empty state
    endDate: null, // Use null for initial empty state
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false); // For date filter button logic
  const [allSources, setAllSources] = useState([]);
  const [currentSource, setCurrentSource] = useState("");
  const [createdBy, setCreatedBy] = useState(""); // Renamed from 'createdby' for consistency
  const [allUsers, setAllUsers] = useState([]); // Renamed from 'allUser' for consistency

  const [proposalModal, setProposalModal] = useState(false);
  const [proposalNumber, setProposalNumber] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setDuplicateNumbers([]); // Clear duplicates when closing popup
  // const closePopup = () => setIsPopupOpen(false); // Original closePopup

  // --- Unified User Fetching ---
  const getAllUsers = useCallback(async () => {
    try {
      // Fetch all users from the unified endpoint, potentially with a limit to get all
      // You might need to adjust the limit if you have many users, or add pagination here
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/users/get?limit=1000`
      ); // Fetch a large number or implement pagination
      if (response.data) {
        setAllUsers(
          response.data.users.map((user) => ({
            id: user._id, // Use MongoDB _id
            name: user.name,
            designation: user.designation, // Keep designation for display if needed
          }))
        );
      } else {
        console.error("Failed to fetch users:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching all users:", error);
    }
  }, []); // No dependencies, runs once or when called

  // --- Fetch Businesses (Main Data Fetcher) ---
  const fetchAllBusinesses = useCallback(async () => {
    try {
      setFetchLoading(true);

      // Format dates for API call (toISOString() is crucial for backend Date parsing)
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

      // Construct the URL with all filters
      const params = new URLSearchParams();
      params.append("page", currentPage);
      if (status) params.append("status", status);
      if (category) params.append("category", category); // Backend expects name
      if (city) params.append("city", city); // Backend expects name
      if (mobileNumber) params.append("mobileNumber", mobileNumber);
      if (formattedStartDate)
        params.append("createdstartdate", formattedStartDate);
      if (formattedEndDate) params.append("createdenddate", formattedEndDate);
      if (currentSource) params.append("source", currentSource); // Backend expects name
      if (createdBy) params.append("createdBy", createdBy); // Backend expects user _id or userId

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/business/get?${params.toString()}`
      );

      const data = response.data;

      if (data.success) {
        setAllBusinesses(data.businesses); // Backend returns paginated and filtered data
        setTotalPages(data.totalPages);
        // setFilteredBusinesses(data.businesses); // REMOVED: No client-side filtering needed
      } else {
        console.error("Failed to fetch businesses:", data.message);
        setAllBusinesses([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setAllBusinesses([]);
      setTotalPages(1);
    } finally {
      setFetchLoading(false);
    }
  }, [
    currentPage,
    status,
    category,
    city,
    mobileNumber,
    dateRange,
    currentSource,
    createdBy,
  ]); // Dependencies for useCallback

  // --- Effect to fetch businesses when filters or page change ---
  useEffect(() => {
    fetchAllBusinesses();
  }, [fetchAllBusinesses]); // fetchAllBusinesses is memoized, so this runs when its dependencies change

  // --- Handle New Business Added ---
  const handleNewBusiness = (newBusinessResponse) => {
    // After adding a new business, re-fetch the entire list to ensure pagination and filters are correct
    fetchAllBusinesses();
    closeModal();
  };

  // --- Date Range Handlers ---
  const handleDateRangeChange = (ranges) => {
    setDateRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: "selection",
    });
    setIsDateFilterApplied(false); // Indicate that filter is not yet applied
  };

  const applyDateFilter = () => {
    setCurrentPage(1); // Reset to first page when applying new date filter
    setIsDateFilterApplied(true);
    setShowDatePicker(false);
    // fetchAllBusinesses will be triggered by useEffect due to dateRange change
  };

  const clearDateFilter = () => {
    setDateRange({
      startDate: null, // Use null for empty date range
      endDate: null,
      key: "selection",
    });
    setIsDateFilterApplied(false);
    setCurrentPage(1); // Reset to first page
    // fetchAllBusinesses will be triggered by useEffect due to dateRange change
  };

  // --- Fetch Filter Options (Cities, Categories, Sources) ---
  useMemo(() => {
    async function getFilters() {
      try {
        const [citiesResponse, categoriesResponse, sourcesResponse] =
          await Promise.all([
            // Assuming these endpoints return arrays of objects like { _id: "...", cityname: "..." }
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/city/get`),
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/category/get`),
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/source/get`),
          ]);

        // Map to get just the names (strings) for select options
        setUniqueCities(citiesResponse.data.map((c) => c).filter(Boolean)); // Filter out null/undefined
        setUniqueCategories(
          categoriesResponse.data.map((c) => c).filter(Boolean)
        );
        setAllSources(sourcesResponse.data); // Assuming sourcesResponse.data is already an array of { sourceId, sourcename }

        setIsNewDataImport(false); // Reset this flag if it's used to trigger filter fetch
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    }
    getFilters();
    getAllUsers(); // Fetch all users when filters are loaded
  }, [getAllUsers, isNewDataImport]); // isNewDataImport will trigger re-fetch after import

  // --- Export Function ---
  const handleExport = () => {
    // Export all current businesses (already filtered/paginated by backend)
    const exportData = allBusinesses.map((business) => ({
      "Business Id": business.businessId,
      "Business Name": business.buisnessname,
      "Contact Person": business.contactpersonName,
      "Mobile Number": business.mobileNumber,
      // Access populated fields correctly
      "City/Town": business.city?.cityname || business.city, // Use city.cityname if populated, else raw city (for safety)
      "Business Category": business.category?.categoryname || business.category,
      Status: business.status,
      Source: business.source?.sourcename || business.source,
      "Follow-up Date": business.followUpDate
        ? format(new Date(business.followUpDate), "dd/MM/yyyy")
        : "N/A",
      "Created At": business.createdAt
        ? format(new Date(business.createdAt), "dd/MM/yyyy")
        : "N/A",
      Remarks: business.remarks,
      "Lead By": business.lead_by?.name || "N/A", // Access populated lead_by name
      "Assigned To": business.appoint_to?.name || "N/A", // Access populated appoint_to name
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Business");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "business.xlsx");
  };

  // --- Import Function ---
  const handleImport = async (event) => {
    const file = event.target.files[0];
    const allowedExtensions = /(\.csv)$/i;

    if (!file) {
      console.error("No file selected");
      return;
    }

    if (!allowedExtensions.exec(file.name)) {
      alert("Please upload a valid CSV file");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/business/uploadexcel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const allDuplicates = [
        ...(response.data.duplicatesInFile || []), // Ensure arrays are handled
        ...(response.data.duplicatesInDB || []),
      ];

      if (allDuplicates.length > 0) {
        setDuplicateNumbers(allDuplicates);
        setIsPopupOpen(true); // Open popup using state
      }

      setIsNewDataImport(true); // Trigger re-fetch of businesses and filters
      setCurrentPage(1); // Go back to page 1 after import

      alert(response.data.message || "File imported successfully!");
    } catch (error) {
      console.error(
        "Error importing businesses:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message ||
          "Failed to import businesses. Please check the file and try again."
      );
    } finally {
      setLoading(false);
      event.target.value = ""; // Reset the file input
    }
  };

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4 p-4">
        <div className="py-6 flex border-b border-[#cccccc] items-center flex-wrap gap-6">
          <span className="text-lg font-semibold text-[#777777]">Filter</span>
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
                    fetchAllBusinesses(
                      category,
                      status,
                      city,
                      mobileNumber,

                      dateRange
                    );
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
            <input
              type="number"
              placeholder="Search using number"
              value={mobileNumber}
              onChange={(e) => {
                setCurrentPage(1);
                setMobileNumber(e.target.value);
              }}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md text-[#FF2722]"
            />
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
              <option value="">All Categories</option>
              {uniqueCategories.map((cat, index) => (
                <option key={index} value={cat._id}>
                  {cat.categoryname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="city"
              value={city}
              onChange={(e) => {
                setCurrentPage(1);
                setCity(e.target.value);
              }}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Cities</option>
              {uniqueCities.map((cty, index) => (
                <option key={index} value={cty._id}>
                  {cty.cityname}
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
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map((sts, index) => (
                <option key={index} value={sts}>
                  {sts}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="source"
              value={currentSource}
              onChange={(e) => {
                setCurrentPage(1);
                setCurrentSource(e.target.value);
              }}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Sources</option>
              {allSources.map((sts) => (
                <option key={sts.sourceId} value={sts.sourcename}>
                  {sts.sourcename}
                </option>
              ))}
            </select>
          </div>
          {/* <div>
            <select
              name="user"
              value={createdby}
              onChange={(e) => {
                setCurrentPage(1);
                setCreatedBy(e.target.value);
              }}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Users</option>
              {allUser.map((sts) => (
                <option key={sts.id} value={sts.id}>
                  {sts.name}
                </option>
              ))}
            </select>
          </div> */}
          <div
            className="px-2 p-1 bg-[#FF2722] text-white rounded-md text-sm font-medium cursor-pointer"
            onClick={openModal}
          >
            ADD
          </div>
          <div
            className="px-2 p-1 bg-[#FF2722] text-white rounded-md text-sm font-medium cursor-pointer"
            onClick={handleExport}
          >
            Export
          </div>
          <div className="px-2 p-1 bg-[#FF2722] text-white rounded-md text-sm font-medium cursor-pointer">
            <label className="cursor-pointer flex items-center">
              {loading ? (
                <div className="loader mr-2" /> // Display loader
              ) : (
                "Import"
              )}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImport}
                style={{ display: "none" }}
                disabled={loading} // Disable input when loading
              />
            </label>
          </div>
        </div>
        <div>
          <ManageBusiness
            businesses={allBusinesses}
            showdelete={true}
            fetchLoading={fetchLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            setProposalNumber={setProposalNumber}
            setProposalModal={setProposalModal}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Business Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        <AddBuisness onAddBusiness={handleNewBusiness} />
      </Modal>

      <Modal
        isOpen={proposalModal}
        onRequestClose={() => setProposalModal(false)}
        contentLabel="Send Proposal Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button
          onClick={() => setProposalModal(false)}
          className="close-button"
        >
          &times;
        </button>
        <SendSingleProposal phoneNumber={proposalNumber} />
      </Modal>

      <DuplicatePopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        duplicates={duplicateNumbers}
      />
    </AdminDashboardTemplate>
  );
};

export default AddAndManageBuisness;
