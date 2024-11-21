import React, { useEffect, useState } from "react";
import AdminDashboardTemplate from "../../template/AdminDashboardTemplate";
import { format } from "date-fns";
import { DateRangePicker } from "react-date-range";
import axios from "axios";
import { MdOutlineVisibility } from "react-icons/md";
import { FaCopy } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import ViewWebsiteLeads from "./ViewWebsiteLeads";
import LoadingAnimation from "../../component/LoadingAnimation";

const formatLeadDetails = (lead) => {
  return `
    Name: ${lead.name}
    Mobile Number: ${lead.mobileNumber}
    Email: ${lead.email}
    Consultation For: ${lead.consultationFor}
    Message: ${lead.massage || "N/A"}
    Status: ${lead.status}
  `;
};

const WebsiteLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    consultationFor: "",
    status: "",
    startDate: null,
    endDate: null,
  });
  const [dropdownData, setDropdownData] = useState({
    consultationForOptions: [],
    statusOptions: [],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateRange, setTempDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [dateFilterApplied, setDateFilterApplied] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null); // State for selected lead
  const [showLeads, setShowLeads] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const baseURL = import.meta.env.VITE_BASE_URL;

  // Fetch dropdown options for consultationFor and status
  const fetchDropdownOptions = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/api/websiteleads/dropdown-options`
      );
      const { consultationForOptions, statusOptions } = response.data;
      setDropdownData({
        consultationForOptions,
        statusOptions,
      });
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
    setCurrentPage(1); // Reset current page to 1
  };

  // Handle consultationFor dropdown change
  const handleConsultationForChange = (e) => {
    setFilters({ ...filters, consultationFor: e.target.value });
    setCurrentPage(1); // Reset current page to 1
  };

  // Handle status dropdown change
  const handleStatusChange = (e) => {
    setFilters({ ...filters, status: e.target.value });
    setCurrentPage(1); // Reset current page to 1
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDateSelection = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setTempDateRange({ startDate, endDate }); // Save selected dates temporarily
  };

  // Apply Date Filter on Show Button Click
  const handleApplyDateFilter = () => {
    setFilters((prev) => ({
      ...prev,
      startDate: tempDateRange.startDate,
      endDate: tempDateRange.endDate,
    }));
    setDateFilterApplied(true); // Toggle to Clear button
    setCurrentPage(1); // Reset to the first page
    setShowDatePicker(false); // Close the date picker
  };

  // Clear Date Filter on Clear Button Click
  const handleClearDateFilter = () => {
    setFilters((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
    }));
    setTempDateRange({ startDate: null, endDate: null }); // Clear temp date range
    setDateFilterApplied(false); // Toggle back to Show button
    setCurrentPage(1); // Reset to the first page
  };

  // Fetch leads data
  const fetchLeads = async () => {
    if (currentPage === undefined || currentPage === null) {
      console.error("currentPage is not initialized yet");
      return;
    }
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: filters.search,
        consultationFor: filters.consultationFor,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      const response = await axios.get(`${baseURL}/api/websiteleads/get`, {
        params,
      });

      const { data, totalPages, totalLeads } = response.data;

      setLeads(data);
      setCurrentPage(response.data.currentPage);
      setTotalPages(totalPages);
      setTotalLeads(totalLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage && currentPage !== undefined) {
      fetchLeads();
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  const handleViewClick = (lead) => {
    setSelectedLead(lead);
    setShowLeads(true);
  };

  const handleCloseLeads = () => {
    setShowLeads(false);
    setSelectedLead(null);
  };

  const handleCopyClick = (lead) => {
    const leadDetails = formatLeadDetails(lead);
    navigator.clipboard.writeText(leadDetails).then(
      () => {
        alert("Lead details copied to clipboard!");
      },
      (error) => {
        console.error("Error copying to clipboard:", error);
        alert("Failed to copy lead details.");
      }
    );
  };

  const handleDeleteClick = (lead) => {
    setSelectedLead(lead);
    setShowDeletePopup(true); // Show the delete confirmation popup
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `${baseURL}/api/websiteleads/delete/${selectedLead.webSiteleadsId}`
      );
      setLeads(
        leads.filter(
          (lead) => lead.webSiteleadsId !== selectedLead.webSiteleadsId
        )
      );
      setShowDeletePopup(false);

      fetchLeads();
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Failed to delete the lead.");
    }
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false); // Close the popup without deleting
  };

  const handleStatusUpdate = async (e, lead) => {
    const updatedStatus = e.target.value;

    try {
      // Make an API request to update the status in the database
      const response = await axios.put(
        `${baseURL}/api/websiteleads/update/${lead.webSiteleadsId}`, // URL to update the lead
        {
          status: updatedStatus, // Pass the updated status in the request body
        }
      );

      if (response.data.success) {
        // Update the status in the frontend UI without re-fetching the data
        setLeads((prevLeads) =>
          prevLeads.map((l) =>
            l.webSiteleadsId === lead.webSiteleadsId
              ? { ...l, status: updatedStatus }
              : l
          )
        );
      } else {
        alert("Failed to update the status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update the status.");
    }
  };

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4 p-4">
        {/* Filters Section */}
        <div className="py-6 flex border-b border-[#cccccc] items-center flex-wrap gap-6">
          <span className="text-lg font-semibold text-[#777777]">Filter</span>

          <div className="relative">
            <input
              type="text"
              placeholder="Select Date Range"
              readOnly
              value={
                tempDateRange.startDate && tempDateRange.endDate
                  ? `${format(
                      new Date(tempDateRange.startDate),
                      "dd/MM/yyyy"
                    )} - ${format(
                      new Date(tempDateRange.endDate),
                      "dd/MM/yyyy"
                    )}`
                  : ""
              }
              className="px-4 py-1 border border-[#cccccc] text-sm rounded-md cursor-pointer"
              onClick={() => setShowDatePicker(!showDatePicker)}
            />
            {showDatePicker && (
              <div className="absolute z-10">
                <DateRangePicker
                  ranges={[
                    {
                      startDate: tempDateRange.startDate || new Date(),
                      endDate: tempDateRange.endDate || new Date(),
                      key: "selection",
                    },
                  ]}
                  onChange={handleDateSelection}
                  rangeColors={["#00aaff"]}
                />
              </div>
            )}
          </div>

          {/* Show or Clear Button */}
          <div>
            {dateFilterApplied ? (
              <button
                onClick={handleClearDateFilter}
                className="px-4 py-1 bg-red-500 text-white rounded"
              >
                Clear
              </button>
            ) : (
              <button
                onClick={handleApplyDateFilter}
                className="px-4 py-1 bg-green-500 text-white rounded"
              >
                Show
              </button>
            )}
          </div>

          {/* Search Input */}
          <div>
            <input
              type="text"
              placeholder="Search using number or name"
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md text-[#FF2722]"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Consultation For Dropdown */}
          <div>
            <select
              name="consultationfor"
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
              value={filters.consultationFor}
              onChange={handleConsultationForChange}
            >
              <option value="">All Consultation</option>
              {dropdownData.consultationForOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              name="status"
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
              value={filters.status}
              onChange={handleStatusChange}
            >
              <option value="">All Status</option>
              {dropdownData.statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leads Table */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <LoadingAnimation />
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="xlg:min-w-[1000px] sm:min-w-[900px] flex flex-col">
                <div className="flex gap-4 sm:text-xs md:text-sm font-medium py-4 border-y border-[#CCCCCC] text-[#333333]">
                  <div className="w-[15%]">Date & Time</div>
                  <div className="w-[15%]">Name</div>
                  <div className="w-[15%]">Mobile Number</div>
                  <div className="w-[15%]">Message</div>
                  <div className="w-[15%]">Consultation For</div>
                  <div className="w-[15%]">Status</div>
                  <div className="w-[10%]">Actions</div>
                </div>
                {leads && leads.length > 0 ? (
                  leads.map((lead) => (
                    <div
                      key={lead.webSiteleadsId}
                      className="flex gap-4 sm:text-xs md:text-sm py-4  text-[#333333]"
                    >
                      <div className="w-[15%]">
                        {format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm")}
                      </div>
                      <div className="w-[15%]">{lead.name}</div>
                      <div className="w-[15%]">{lead.mobileNumber}</div>
                      <div className="w-[15%] onelinelimit">
                        {lead.massage || "N/A"}
                      </div>
                      <div className="w-[15%]">{lead.consultationFor}</div>
                      <div className="w-[15%]">
                        <select
                          name="status"
                          className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
                          value={lead.status} // Set the current status as the value
                          onChange={(e) => handleStatusUpdate(e, lead)} // Trigger the update on change
                        >
                          <option value="Fresh Data">Fresh Data</option>
                          <option value="Follow Up">Follow Up</option>
                          <option value="Deal Close">Deal Close</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </div>
                      <div className="w-[10%] flex flex-row gap-3 text-lg items-center">
                        <button
                          onClick={() => handleViewClick(lead)}
                          className="text-[#00D23B]"
                        >
                          <MdOutlineVisibility />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(lead)}
                          className="text-[#D53F3A]"
                        >
                          <RiDeleteBin5Line />
                        </button>
                        <button
                          onClick={() => handleCopyClick(lead)}
                          className="text-blue-500"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No leads available</div>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between py-4">
            <span>
              Showing {leads.length} of {totalLeads} leads
            </span>
            <div>
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1 mx-1 border rounded"
              >
                Prev
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1 mx-1 border rounded"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div
          className={`fixed top-0 right-0 h-screen w-[60%] xl:w-[50%] overflow-scroll no-scrollbar bg-[#EDF4F7] shadow-lg transform transition-transform duration-300 ease-in-out ${
            showLeads ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {showLeads && (
            <ViewWebsiteLeads lead={selectedLead} onClose={handleCloseLeads} />
          )}
        </div>

        {showDeletePopup && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-semibold">
                Are you sure you want to delete this lead?
              </h2>
              <div className="flex gap-5 mt-4">
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Yes
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-300 text-black rounded"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardTemplate>
  );
};

export default WebsiteLeads;
