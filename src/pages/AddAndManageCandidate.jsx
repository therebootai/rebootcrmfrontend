import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import Modal from "react-modal";
import { format } from "date-fns";
import AddCandidate from "../component/adminbuisness/AddCandidate";
import ManageCandidate from "../component/adminbuisness/ManageCandidate";
import { useCallback } from "react";
import { DateRangePicker } from "react-date-range";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";

const AddAndManageCandidate = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [city, setCity] = useState("");
  const [interestPost, setInterestPost] = useState("");
  const [uniqueCities, setUniqueCities] = useState([]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNewCandidates = (newCandidates) => {
    setCandidates((prevCandidates) => [...prevCandidates, newCandidates]);
    closeModal();
  };

  const fetchAllCandidates = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/candidate/get`,
        {
          params: {
            city: city,
            interestPost: interestPost,
            startdate: dateRange.startDate,
            enddate: dateRange.endDate,
            search: search,
            page: currentPage,
          },
        }
      );
      const data = response.data;
      setCandidates(data.candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const fetchAllFilters = async () => {
    try {
      const filterResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/candidate/filters`
      );
      setUniqueCities(filterResponse.data.cities);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  useCallback(() => {
    fetchAllFilters();
  }, []);

  useEffect(() => {
    fetchAllCandidates();
  }, []);

  useEffect(() => {
    fetchAllCandidates();
  }, [city, interestPost, dateRange, search]);

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
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); // This triggers the parent to re-fetch
  };

  // Calculate the range of page numbers to show
  const pageRange = 5;
  let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
  let endPage = startPage + pageRange - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - pageRange + 1);
  }

  if (totalPages <= pageRange) {
    startPage = 1;
    endPage = totalPages;
  }

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
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name or Mobile number"
              className="px-2 p-1 border border-[#cccccc] text-sm rounded-md"
            />
          </div>

          <div>
            <select
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Cities</option>
              {uniqueCities.map((cty, index) => (
                <option key={index} value={cty}>
                  {cty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="interestPost"
              value={interestPost}
              onChange={(e) => setInterestPost(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Interest Posts</option>
              {[
                "Business Development Executive",
                "Team Leader Sales",
                "Digital Marketing Executive",
                "Telecaller",
                "HR",
                "Content Writer",
                "UI / UX Developer",
                "Creative Graphics Designer",
                "Full Stack Developer",
                "App Developer",
              ].map((post, index) => (
                <option key={index} value={post}>
                  {post}
                </option>
              ))}
            </select>
          </div>

          <div
            className="px-2 p-1 bg-[#FF2722] text-white rounded-md text-sm font-medium cursor-pointer"
            onClick={openModal}
          >
            ADD
          </div>
        </div>
        <div>
          <ManageCandidate candidates={candidates} />
        </div>
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
              const pageNumber = startPage + i;
              return (
                <button
                  key={pageNumber}
                  className={`px-4 py-2 ${
                    currentPage === pageNumber
                      ? "text-[#D53F3A]"
                      : "text-[#777777]"
                  } font-bold rounded`}
                  onClick={() => handlePageChange(pageNumber)}
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
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Candidate Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        <AddCandidate onAddCandidates={handleNewCandidates} />
      </Modal>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageCandidate;
