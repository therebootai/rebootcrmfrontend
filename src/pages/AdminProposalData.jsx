import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { GoDotFill } from "react-icons/go";
import { GrCopy } from "react-icons/gr";
import { ToastContainer, toast } from "react-toastify";

import "react-date-range/dist/theme/default.css";

import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";

import Modal from "react-modal";
import SendProposalForEmployee from "../component/SendProposalForEmployee";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import LoadingAnimation from "../component/LoadingAnimation";

Modal.setAppElement("#root");

const AdminProposalData = () => {
  const [businesses, setBusinesses] = useState([]);
  // const [filteredBusinesses, setFilteredBusinesses] = useState([]);

  const [mobileNumber, setMobileNumber] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  // const [dateRange, setDateRange] = useState({
  //   startDate: null,
  //   endDate: null,
  //   key: "selection",
  // });
  // const [showDatePicker, setShowDatePicker] = useState(false);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  // const [showEditPopup, setShowEditPopup] = useState(false);

  const [showProposalPopup, setShowProposalPopup] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 12;

  const fetchBusinesses = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?page=${currentPage}&status=${status}&category=${category}&city=${city}&mobileNumber=${mobileNumber}&businessname=${businessName}`
      );
      // const sortedBusinesses = response.data.businesses.sort(
      //   (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      // );
      setTotalPages(response.data.totalPages);
      setBusinesses(response.data.businesses);
      // setFilteredBusinesses(sortedBusinesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useMemo(() => {
    async function getFilters() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/business/getfilter`
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

  useEffect(() => {
    fetchBusinesses();
  }, [currentPage]);

  // const normalizeString = (str) => {
  //   return str
  //     .toLowerCase() // Convert to lowercase
  //     .replace(/[-\/"",]/g, "") // Remove special characters
  //     .replace(/\s+/g, ""); // Remove all spaces
  // };

  // const applyFilters = () => {
  //   let filteredData = businesses;

  //   if (dateRange.startDate && dateRange.endDate) {
  //     const start = dateRange.startDate;
  //     const end = dateRange.endDate;
  //     filteredData = filteredData.filter((business) => {
  //       const followUpDate = new Date(business.followUpDate);
  //       return followUpDate >= start && followUpDate <= end;
  //     });
  //   }

  //   if (mobileNumber) {
  //     filteredData = filteredData.filter((business) =>
  //       business.mobileNumber.includes(mobileNumber)
  //     );
  //   }

  //   if (businessName) {
  //     const normalizedSearchTerm = normalizeString(businessName);
  //     filteredData = filteredData.filter((business) =>
  //       normalizeString(business.buisnessname).includes(normalizedSearchTerm)
  //     );
  //   }

  //   if (city) {
  //     filteredData = filteredData.filter((business) => business.city === city);
  //   }

  //   if (category) {
  //     filteredData = filteredData.filter(
  //       (business) => business.category === category
  //     );
  //   }

  //   if (status) {
  //     filteredData = filteredData.filter(
  //       (business) => business.status === status
  //     );
  //   }

  //   setFilteredBusinesses(filteredData);
  //   setCurrentPage(1); // Reset to the first page after applying filters
  // };

  useEffect(() => {
    // applyFilters();
    fetchBusinesses();
  }, [mobileNumber, businessName, city, category, status]);

  // const handleDateRangeChange = (ranges) => {
  //   setDateRange(ranges.selection);
  //   setShowDatePicker(false);
  // };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-GB", options) + " ";
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

  const openProposalPopup = (business) => {
    setSelectedBusiness(business);
    setShowProposalPopup(true); // Trigger modal open
  };

  const closeProposalPopup = () => {
    setShowProposalPopup(false);
    setSelectedBusiness(null);
  };

  // Pagination logic
  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = filteredBusinesses.slice(
  //   indexOfFirstItem,
  //   indexOfLastItem
  // );
  // const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);

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

  return (
    <AdminDashboardTemplate>
      <div className="w-full flex flex-col gap-4 ">
        <div className="py-4 border-b border-[#cccccc] w-full flex flex-wrap gap-4 items-center">
          <h1 className="text-[#777777] text-lg font-semibold">Filter</h1>

          <div>
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
            <input
              type="text"
              name="businessName"
              placeholder="Business Name"
              value={businessName}
              onChange={(e) => {
                setCurrentPage(1);
                setBusinessName(e.target.value);
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
        <div>
          <div>
            {fetchLoading ? (
              <LoadingAnimation />
            ) : (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {businesses.length > 0 ? (
                  businesses.map((business, index) => (
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
                            {formatDate(business.followUpDate)})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>
                            <GoDotFill />
                          </span>
                          <span>{business.category}</span>
                        </div>
                        <div className="flex  justify-between w-full items-center ">
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
                              <span>{business.remarks}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-4 text-white">
                            <button
                              className="px-2 p-1 bg-[#FF2722] rounded-md text-sm font-semibold"
                              onClick={() => openProposalPopup(business)} // This opens the proposal popup
                            >
                              Send Proposal
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No businesses found</p>
                )}
              </div>
            )}
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

        <ToastContainer />
      </div>
    </AdminDashboardTemplate>
  );
};

export default AdminProposalData;
