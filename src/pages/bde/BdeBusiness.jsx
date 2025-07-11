import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

import Modal from "react-modal";
import AddBuisness from "../../component/adminbuisness/AddBuisness";
import ManageBusiness from "../../component/adminbuisness/ManageBusiness";
import BdeDashboardTemplate from "../../template/BdeDashboardTemplate";
import { useParams } from "react-router-dom";
import { DateRangePicker } from "react-date-range";

import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import SendSingleProposal from "../../component/adminbuisness/SendSingleProposal";

const BdeBusiness = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [proposalModal, setProposalModal] = useState(false);
  const [proposalNumber, setProposalNumber] = useState("");

  const { bdeId } = useParams();

  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
  const [allSources, setAllSources] = useState([]);
  const [currentSource, setCurrentSource] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNewBusiness = (newBusinessResponse) => {
    const newBusiness = newBusinessResponse.newBusiness;

    const updatedBusinesses = [...allBusinesses, newBusiness];

    setAllBusinesses(updatedBusinesses);
    setFilteredBusinesses(applyFilters(updatedBusinesses));

    closeModal();
  };

  const fetchAllBusinesses = async (
    status,
    category,
    city,
    mobileNumber,
    currentPage,
    bdeId,
    customDateRange = dateRange,
    currentSource
  ) => {
    try {
      setFetchLoading(true);

      const params = {
        page: currentPage,
        status: status || "",
        category: category || "",
        city: city || "",
        mobileNumber: mobileNumber || "",
        bdeId,
        byTagAppointment: true,
        source: currentSource || "",
      };

      // Only add date filters if they are defined
      if (
        customDateRange.startDate &&
        customDateRange.endDate &&
        customDateRange.startDate !== "" &&
        customDateRange.endDate !== ""
      ) {
        params.appointmentstartdate = new Date(
          customDateRange.startDate.getTime() -
            customDateRange.startDate.getTimezoneOffset() * 60000
        ).toISOString();
        params.appointmentenddate = new Date(
          customDateRange.endDate.getTime() -
            customDateRange.endDate.getTimezoneOffset() * 60000
        ).toISOString();
        params.followupstartdate = new Date(
          customDateRange.startDate.getTime() -
            customDateRange.startDate.getTimezoneOffset() * 60000
        ).toISOString();
        params.followupenddate = new Date(
          customDateRange.endDate.getTime() -
            customDateRange.endDate.getTimezoneOffset() * 60000
        ).toISOString();
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/business/get`,
        {
          params,
        }
      );

      const data = response.data;

      setAllBusinesses(data.businesses);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBusinesses(
      status,
      category,
      city,
      mobileNumber,
      currentPage,
      bdeId,
      dateRange,
      currentSource
    );
  }, [mobileNumber, city, category, status, currentPage, bdeId, currentSource]);

  useEffect(() => {
    setCurrentPage(1);
  }, [mobileNumber, city, category, status, dateRange, currentSource]);

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

    fetchAllBusinesses(
      status,
      category,
      city,
      mobileNumber,
      1,
      bdeId,
      emptyDateRange
    );
  };

  useMemo(() => {
    async function getFilters() {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/business/getfilter?bdeId=${bdeId}`
        );
        const sourcesResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/source/get`
        );
        const data = response.data;
        setUniqueCities(data.cities);
        setUniqueCategories(data.businessCategories);
        setUniqueStatuses(data.status);
        setAllSources(sourcesResponse.data);
      } catch (error) {
        console.log(error);
      }
    }
    getFilters();
  }, []);

  return (
    <BdeDashboardTemplate>
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
                      status,
                      category,
                      city,
                      mobileNumber,
                      currentPage,
                      bdeId
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
              onChange={(e) => setMobileNumber(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md text-[#FF2722]"
            />
          </div>
          <div>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
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
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
          <div
            className="px-2 p-1 bg-[#FF2722] text-white rounded-md text-sm font-medium cursor-pointer"
            onClick={openModal}
          >
            ADD
          </div>
        </div>
        <div>
          <ManageBusiness
            businesses={allBusinesses}
            showdelete={false}
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
    </BdeDashboardTemplate>
  );
};

export default BdeBusiness;
