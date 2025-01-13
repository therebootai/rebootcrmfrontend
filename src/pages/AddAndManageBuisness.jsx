import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import Modal from "react-modal";
import AddBuisness from "../component/adminbuisness/AddBuisness";
import ManageBusiness from "../component/adminbuisness/ManageBusiness";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DuplicatePopup from "../component/DuplicatePopup";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";

const AddAndManageBuisness = () => {
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
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [duplicateNumbers, setDuplicateNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isNewDataImport, setIsNewDataImport] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const handleNewBusiness = (newBusinessResponse) => {
    const newBusiness = newBusinessResponse.newBusiness;

    const updatedBusinesses = [...allBusinesses, newBusiness];

    setAllBusinesses(updatedBusinesses);
    setFilteredBusinesses(applyFilters(updatedBusinesses));
    // setUniqueFilters(updatedBusinesses);

    closeModal();
  };

  const fetchAllBusinesses = async (
    status,
    category,
    city,
    mobileNumber,
    dateRange = { startDate: "", endDate: "" }
  ) => {
    try {
      setFetchLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?page=${currentPage}&status=${status}&category=${category}&city=${city}&mobileNumber=${mobileNumber}&createdstartdate=${
          dateRange.startDate
            ? new Date(
                dateRange.startDate.getTime() -
                  dateRange.startDate.getTimezoneOffset() * 60000
              ).toISOString()
            : ""
        }&createdenddate=${
          dateRange.endDate
            ? new Date(
                dateRange.endDate.getTime() -
                  dateRange.endDate.getTimezoneOffset() * 60000
              ).toISOString()
            : ""
        }`
      );
      const data = response.data;

      setAllBusinesses(data.businesses);

      setTotalPages(data.totalPages);
      setIsNewDataImport(false);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBusinesses(status, category, city, mobileNumber, dateRange);
  }, [status, category, city, mobileNumber, dateRange, currentPage]);

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
    fetchAllBusinesses(category, status, city, mobileNumber, 1, emptyDateRange);
  };

  // // Apply filters when any filter or business data changes
  // useEffect(() => {
  //   // setFilteredBusinesses(applyFilters(allBusinesses));

  //   fetchAllBusinesses(status, category, city, mobileNumber);

  //   // setCurrentPage(1);  Reset to the first page when filters are applied
  // }, [mobileNumber, city, category, status, isNewDataImport]);

  // // const setUniqueFilters = (data) => {
  // //   const cities = [...new Set(data.map((item) => item.city))];
  // //   const categories = [...new Set(data.map((item) => item.category))];
  // //   const statuses = [...new Set(data.map((item) => item.status))];
  // //   setUniqueCities(cities);
  // //   setUniqueCategories(categories);
  // //   setUniqueStatuses(statuses);
  // // };

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
        setIsNewDataImport(false);
      } catch (error) {
        console.log(error);
      }
    }
    getFilters();
  }, [isNewDataImport]);

  const applyFilters = (data) => {
    let filteredData = data;

    if (mobileNumber) {
      filteredData = filteredData.filter((business) =>
        business.mobileNumber.includes(mobileNumber)
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

    return filteredData;
  };

  const handleExport = () => {
    const exportData = (
      filteredBusinesses.length > 0 ? filteredBusinesses : allBusinesses
    ).map((business) => ({
      "Business Id": business.businessId,
      "Business Name": business.buisnessname,
      "Contact Person": business.contactpersonName,
      "Mobile Number": business.mobileNumber,
      "City/Town": business.city,
      "Business Category": business.category,
      Status: business.status,
      Source: business.source,
      "Follow-up Date": new Date(business.createdAt).toLocaleString(),
      Remarks: business.remarks,
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

  const handleImport = async (event) => {
    const file = event.target.files[0];
    const allowedExtensions = /(\.csv)$/i;

    if (!file) {
      console.error("No file selected");
      return;
    }

    if (!allowedExtensions.exec(file.name)) {
      alert("Please upload a valid CSV file");
      event.target.value = ""; // Reset file input
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
        ...response.data.duplicatesInFile,
        ...response.data.duplicatesInDB,
      ];

      if (allDuplicates.length > 0) {
        setDuplicateNumbers(allDuplicates);
        openPopup();
      }

      setIsNewDataImport(true);

      // const newBusinesses = response.data.createdBusinesses || [];
      // if (newBusinesses.length > 0) {
      //   const updatedBusinesses = [...allBusinesses, ...newBusinesses];
      //   setAllBusinesses(updatedBusinesses);
      //   setFilteredBusinesses(applyFilters(updatedBusinesses));
      //   setUniqueFilters(updatedBusinesses);
      // }
    } catch (error) {
      console.error(
        "Error importing businesses:",
        error.response?.data || error.message
      );
      alert(
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
              onChange={(e) => {
                setCurrentPage(1);
                setCity(e.target.value);
              }}
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
                <div className="loader mr-2"></div> // Display loader
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

      <DuplicatePopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        duplicates={duplicateNumbers}
      />
    </AdminDashboardTemplate>
  );
};

export default AddAndManageBuisness;
