import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { GrCopy } from "react-icons/gr";
import { ToastContainer, toast } from "react-toastify";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { format } from "date-fns";
import "react-toastify/dist/ReactToastify.css";
import EditBusinessPopup from "../EditBusinessPopup";

import Modal from "react-modal";
import SendProposalForEmployee from "../SendProposalForEmployee";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import LoadingAnimation from "../LoadingAnimation";

Modal.setAppElement("#root");

const BdeAppointmentData = () => {
  const { bdeId } = useParams(); // Retrieve bdeId from URL
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);

  const [dateRange, setDateRange] = useState({
    startDate: null, // Changed from `new Date()` to `null`
    endDate: null, // Changed from `new Date()` to `null`
    key: "selection",
  });
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pendingDateRange, setPendingDateRange] = useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const [mobileNumber, setMobileNumber] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [showProposalPopup, setShowProposalPopup] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [totalPage, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({
    totalBusiness: 0,
    followUps: 0,
    visits: 0,
    dealCloses: 0,
    target: {
      amount: 0,
      achievement: 0,
      percentage: 0,
    },
  });
  const [fetchLoading, setFetchLoading] = useState(false);

  const fetchBusinesses = async (
    bdeId,
    currentPage,
    itemsPerPage,
    dateRange = {},
    mobileNumber,
    businessName,
    city,
    category,
    status
  ) => {
    setFetchLoading(true);
    try {
      const params = {
        bdeId,
        page: currentPage,
        limit: itemsPerPage,
        appointmentstartdate: dateRange.startDate
          ? new Date(
              dateRange.startDate.getTime() -
                dateRange.startDate.getTimezoneOffset() * 60000
            ).toISOString()
          : null,
        appointmentenddate: dateRange.endDate
          ? new Date(
              dateRange.endDate.getTime() -
                dateRange.endDate.getTimezoneOffset() * 60000
            ).toISOString()
          : null,
        mobileNumber,
        businessName,
        city,
        category,
        status,
        byTagAppointment: true,
      };

      // Making the API request
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/business/get`,
        { params }
      );

      const bdeResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/bde/get/${bdeId}`
      );

      const businessesData = response.data;

      const bdeData = bdeResponse.data;

      setBusinesses(businessesData.businesses);

      calculateCounts({ ...businessesData, ...bdeData });
      setFilteredBusinesses(businessesData.businesses || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage < 1) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    fetchBusinesses(
      bdeId,
      currentPage,
      itemsPerPage,
      dateRange,
      mobileNumber,
      businessName,
      city,
      category,
      status
    );
  }, [
    bdeId,
    currentPage,
    dateRange,
    mobileNumber,
    businessName,
    city,
    category,
    status,
  ]);

  const getLatestTarget = (targets, currentMonth) => {
    if (!targets || targets.length === 0 || !currentMonth) return null;

    const [monthName, year] = currentMonth.split(" ");

    return targets.find(
      (target) =>
        target.month.toLowerCase() === monthName.toLowerCase() &&
        String(target.year) === String(year)
    );
  };

  const calculateCounts = (data) => {
    const totalBusiness = data.totalCount;
    const followUps = data.statuscount.FollowupCount;
    const visits = data.statuscount.visitCount;
    const dealCloses = data.statuscount.dealCloseCount;

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const startDate = dateRange?.startDate
      ? new Date(dateRange.startDate)
      : new Date();

    const monthIndex = startDate.getMonth(); // 0–11
    const year = startDate.getFullYear();

    const currentMonthStr = `${monthNames[monthIndex]} ${year}`;

    const latestTarget = getLatestTarget(data.targets, currentMonthStr) || {
      amount: 0,
      achievement: 0,
    };

    const achievementPercentage =
      latestTarget.amount && latestTarget.achievement
        ? ((latestTarget.achievement / latestTarget.amount) * 100).toFixed(2)
        : 0;

    setCounts({
      totalBusiness,
      followUps,
      visits,
      dealCloses,
      target: {
        amount: latestTarget.amount ?? 0,
        achievement: latestTarget.achievement ?? 0,
        percentage: achievementPercentage,
      },
    });
  };

  const dashboard = [
    { name: "Total Business", number: counts.totalBusiness },
    { name: "Follow Ups", number: counts.followUps },
    { name: "Visit", number: counts.visits },
    { name: "Deal Close", number: counts.dealCloses },
    {
      name: "Achievement",
      number: `${counts.target.achievement} (${counts.target.percentage}%)`,
    },
    { name: "Target", number: counts.target.amount },
  ];

  const normalizeString = (str) => {
    return str
      .toLowerCase() // Convert to lowercase
      .replace(/[-\/"",]/g, "") // Remove special characters
      .replace(/\s+/g, ""); // Remove all spaces
  };

  useMemo(() => {
    async function getFilters() {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/business/getfilter?bdeId=${bdeId}`
        );
        const data = response.data;
        setUniqueCities(data.cities);
        setUniqueCategories(data.businessCategories);
        setUniqueStatuses(data.status);
      } catch (error) {
        console.log(error);
      }
    }
    getFilters();
  }, []);

  const applyFilters = () => {
    let filteredData = [...businesses];

    // if (dateRange.startDate && dateRange.endDate) {
    //   const start = new Date(dateRange.startDate);
    //   start.setUTCHours(0, 0, 0, 0);

    //   const end = new Date(dateRange.endDate);
    //   end.setUTCHours(23, 59, 59, 999);

    //   filteredData = filteredData.filter((business) => {
    //     const followUpDate = new Date(business.followUpDate);
    //     return followUpDate >= start && followUpDate <= end;
    //   });
    // }

    if (mobileNumber) {
      filteredData = filteredData.filter((business) =>
        business.mobileNumber.includes(mobileNumber)
      );
    }
    if (businessName) {
      const normalizedSearchTerm = normalizeString(businessName);
      filteredData = filteredData.filter((business) =>
        normalizeString(business.buisnessname).includes(normalizedSearchTerm)
      );
    }

    if (city) {
      filteredData = filteredData.filter((business) => business.city === city);
    }
    if (category) {
      filteredData = filteredData.filter(
        (business) => business.category === category
      );
    }
    if (status) {
      filteredData = filteredData.filter(
        (business) => business.status === status
      );
    }

    setFilteredBusinesses(filteredData);
  };

  // useEffect(() => {
  //   setCurrentPage(1);
  //   const filteredData = applyFilters(businesses);
  //   setFilteredBusinesses(filteredData);
  // }, [mobileNumber, city, category, status, businesses]);

  useEffect(() => {
    setCurrentPage(1);
    applyFilters();
  }, [dateRange, mobileNumber, businessName, city, category, status]);

  const handlePendingDateRangeChange = (ranges) => {
    setPendingDateRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: "selection",
    });
  };

  const applyDateFilter = () => {
    setDateRange(pendingDateRange);
    setIsDateFilterApplied(true);
    setShowDatePicker(false);

    fetchBusinesses(
      bdeId,
      1, // Reset to first page
      itemsPerPage,
      pendingDateRange,
      mobileNumber,
      businessName,
      city,
      category,
      status
    );
  };

  const clearDateFilter = () => {
    const emptyDateRange = {
      startDate: null,
      endDate: null,
      key: "selection",
    };

    setPendingDateRange(emptyDateRange);
    setDateRange(emptyDateRange);
    setIsDateFilterApplied(false);

    fetchBusinesses(
      bdeId,
      1, // Reset to first page
      itemsPerPage,
      emptyDateRange,
      mobileNumber,
      businessName,
      city,
      category,
      status
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours(); // Local time hours
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Local time minutes
    const ampm = hours >= 12 ? "PM" : "AM"; // Determine AM/PM
    hours = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)

    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  };

  const handleCopy = (business) => {
    const leadText = `Name: ${business.buisnessname}\nMobile Number: ${
      business.mobileNumber
    }\nCity: ${business.city}\nCategory: ${business.category}\nStatus: ${
      business.status
    }\nFollow-up Date: ${formatDate(business.followUpDate)}`;

    navigator.clipboard
      .writeText(leadText)
      .then(() => {
        toast.success("Lead copied to clipboard", {
          position: "bottom-center",
          icon: "✅",
        });
      })
      .catch((error) => {
        console.error("Error copying lead:", error);
      });
  };

  const handleEdit = (business) => {
    setSelectedBusiness(business);
    setShowEditPopup(true);
  };

  const handlePopupClose = () => {
    setShowEditPopup(false);
    setSelectedBusiness(null);
  };

  const openProposalPopup = (business) => {
    setSelectedBusiness(business);
    setShowProposalPopup(true); // Trigger modal open
  };

  const closeProposalPopup = () => {
    setShowProposalPopup(false);
    setSelectedBusiness(null);
  };

  const handleUpdate = (updatedBusiness) => {
    setBusinesses((prevBusinesses) =>
      prevBusinesses.map((business) =>
        business.businessId === selectedBusiness.businessId
          ? { ...business, ...updatedBusiness }
          : business
      )
    );
    setFilteredBusinesses((prevFilteredBusinesses) =>
      prevFilteredBusinesses.map((business) =>
        business.businessId === selectedBusiness.businessId
          ? { ...business, ...updatedBusiness }
          : business
      )
    );
  };

  const totalPages = totalPage;

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const pageRange = 5;
  let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
  let endPage = startPage + pageRange - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - pageRange + 1);
  }
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="py-4 border-b border-[#cccccc] w-full flex flex-wrap gap-4 items-center">
        <h1 className="text-[#777777] text-lg font-semibold">Filter</h1>
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
              className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
            />
            {showDatePicker && (
              <div className="absolute z-10">
                <DateRangePicker
                  ranges={[pendingDateRange]}
                  onChange={handlePendingDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  rangeColors={["#ff2722"]}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isDateFilterApplied ? (
              <button
                className="px-2 py-1 bg-[#FF2722] text-white rounded-md text-sm font-medium cursor-pointer"
                onClick={applyDateFilter}
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
            type="text"
            name="mobileNumber"
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
          />
        </div>
        <div>
          <input
            type="text"
            name="businessName"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
          />
        </div>
        <div>
          <select
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
            onChange={(e) => setCategory(e.target.value)}
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
            onChange={(e) => setStatus(e.target.value)}
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
          {filteredBusinesses.length > 0 ? (
            filteredBusinesses.map((business, index) => (
              <div
                key={index}
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
                    <span>{business.category}</span>
                  </div>
                  <div className="flex  justify-between w-full items-end ">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span>
                          <GoDotFill />
                        </span>
                        <span>{business.city}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>
                          <GoDotFill />
                        </span>
                        <span>
                          {business.appointmentDate
                            ? format(
                                new Date(business.appointmentDate),
                                "dd-MM-yyyy HH:mm"
                              )
                            : "No Appointment Date"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 text-white">
                      <button
                        onClick={() => openProposalPopup(business)}
                        className="px-2 p-1 bg-[#FF2722] rounded-md text-sm font-semibold"
                      >
                        Send Proposal
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col  "></div>
              </div>
            ))
          ) : (
            <p>No businesses found</p>
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

      {selectedBusiness && (
        <EditBusinessPopup
          show={showEditPopup}
          onClose={handlePopupClose}
          business={selectedBusiness}
          onUpdate={handleUpdate}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default BdeAppointmentData;
