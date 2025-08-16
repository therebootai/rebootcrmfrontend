import React, { useEffect, useRef, useState } from "react";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import Modal from "react-modal";
import AddClient from "../component/clientModule/AddClient";
import ManageClient from "../component/clientModule/ManageClient";
import axios from "axios";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import ClientGraph from "../component/clientModule/ClientGraph";
const AddAndManageClient = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);
  const openModal = () => setIsModalOpen(true);
  const [allClient, setAllClients] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bdes, setBdes] = useState([]);
  const [telecalers, setTelecalers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBde, setSelectedBde] = useState("");
  const [selectedTme, setSelectedTme] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
  const datePickerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const bdeResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/users/get?designation=BDE`
      );
      setBdes(bdeResponse.data.users);
      const tmeResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/users/get?designation=Telecaller`
      );
      setTelecalers(tmeResponse.data.users);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchAllClients = async () => {
    try {
      setFetchLoading(true);
      const limit = 20;

      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", limit);
      params.append("search", debouncedSearch);

      if (selectedBde) params.append("bdeName", selectedBde);
      if (selectedTme) params.append("tmeLeads", selectedTme);
      if (selectedStartDate && selectedEndDate) {
        params.append("startDate", format(selectedStartDate, "yyyy-MM-dd"));
        params.append("endDate", format(selectedEndDate, "yyyy-MM-dd"));
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/client/get?${params.toString()}`
      );

      const data = response.data;
      setAllClients(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching client:", error);
    } finally {
      setFetchLoading(false);
    }
  };
  useEffect(() => {
    fetchAllClients();
  }, [
    currentPage,
    selectedBde,
    selectedTme,
    debouncedSearch,
    selectedStartDate,
    selectedEndDate,
  ]);

  const clearDateFilter = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setIsDateFilterApplied(false);
    fetchAllClients();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <AdminDashboardTemplate>
      <div className=" flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <div className=" flex flex-row gap-4 w-[80%]">
            <div className="flex items-center gap-2 w-[30%]">
              <div className="relative w-[80%]">
                <input
                  type="text"
                  value={
                    selectedStartDate && selectedEndDate
                      ? `${format(selectedStartDate, "dd/MM/yyyy")} - ${format(
                          selectedEndDate,
                          "dd/MM/yyyy"
                        )}`
                      : ""
                  }
                  onClick={() => setShowDatePicker(true)}
                  placeholder="Choose Date"
                  readOnly
                  className="md:px-2 h-[3rem] w-full outline-none flex justify-center items-center text-sm border border-[#CCCCCC]"
                />

                {showDatePicker && (
                  <div className="absolute z-10" ref={datePickerRef}>
                    <DateRangePicker
                      onChange={(ranges) => {
                        const start = ranges.selection?.startDate;
                        const end = ranges.selection?.endDate;

                        if (start && end) {
                          setSelectedStartDate(start);
                          setSelectedEndDate(end);
                        }
                      }}
                      ranges={[
                        {
                          startDate: selectedStartDate || new Date(),
                          endDate: selectedEndDate || new Date(),
                          key: "selection",
                        },
                      ]}
                      moveRangeOnFirstSelection={false}
                      rangeColors={["#0A5BFF"]}
                    />
                  </div>
                )}
              </div>

              <div className=" flex items-center gap-2 w-[20%]">
                {!isDateFilterApplied ? (
                  <button
                    onClick={() => {
                      const start = selectedStartDate || new Date();
                      const end = selectedEndDate || new Date();

                      setSelectedStartDate(start);
                      setSelectedEndDate(end);
                      setIsDateFilterApplied(true);
                      setShowDatePicker(false);

                      fetchAllClients();
                    }}
                    className="px-2 py-1 bg-[#5BC0DE] text-white rounded-md text-sm font-medium cursor-pointer"
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
            <div className=" w-[30%]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Using Mobile & Business name"
                className="h-[3rem] px-2 border border-[#CCCCCC] outline-none text-xs xl:text-sm w-full"
              />
            </div>
            <div className="w-[20%]">
              <select
                value={selectedBde}
                onChange={(e) => {
                  setSelectedBde(e.target.value);
                  setCurrentPage(1);
                }}
                className=" h-[3rem] px-2 border border-[#CCCCCC] outline-none text-sm w-full"
              >
                <option value="">Filter BDE</option>
                {bdes.map((item) => (
                  <option value={item._id} key={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-[20%]">
              <select
                value={selectedTme}
                onChange={(e) => {
                  setSelectedTme(e.target.value);
                  setCurrentPage(1);
                }}
                className=" h-[3rem] px-2 border border-[#CCCCCC] outline-none text-sm w-full "
              >
                <option value="">Filter TME</option>
                {telecalers.map((item) => (
                  <option value={item._id} key={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className=" flex flex-row gap-2 items-center">
            <button
              onClick={openModal}
              className=" h-[2.5rem] w-fit px-4 flex justify-center items-center bg-[#0A5BFF] text-white rounded-md"
            >
              + Add
            </button>
          </div>
        </div>
        <div>
          <ClientGraph />
        </div>
        <div>
          <ManageClient
            allClient={allClient}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            fetchAllClients={fetchAllClients}
            fetchLoading={fetchLoading}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Business Modal"
        className="modal-content no-scrollbar"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        <AddClient closeModal={closeModal} fetchAllClients={fetchAllClients} />
      </Modal>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageClient;
