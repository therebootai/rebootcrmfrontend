import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { DateRangePicker } from "react-date-range";
import { format } from "date-fns";
import Modal from "react-modal";
import { GoDotFill } from "react-icons/go";
import InfiniteScroll from "../InfiniteScroll";
import DataDisplayTable from "../../ui/DataDisplayTable";
import { FaMapLocationDot } from "react-icons/fa6";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-IN", options) + " ";
};

const DashboardEmployeeSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalPage, setModalPage] = useState(1);
  const [openFor, setOpenFor] = useState("");
  const [allModalPages, setAllModalPages] = useState(1);
  const [bdeData, setBdeData] = useState([]);
  const [telecallerData, setTelecallerData] = useState([]);
  const [digitalMarketerData, setDigitalMarketerData] = useState([]);

  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(true);

  const fetchEmployeeBusinessData = useCallback(
    async (
      role,
      employeeId,
      status,
      currentDateRange,
      page = 1,
      leadByUserId
    ) => {
      try {
        setModalData([]);
        setModalPage(1);

        const formattedStartDate = currentDateRange.startDate
          ? new Date(
              currentDateRange.startDate.getTime() -
                currentDateRange.startDate.getTimezoneOffset() * 60000
            ).toISOString()
          : "";
        const formattedEndDate = currentDateRange.endDate
          ? new Date(
              currentDateRange.endDate.getTime() -
                currentDateRange.endDate.getTimezoneOffset() * 60000
            ).toISOString()
          : "";

        let url = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?page=${page}`;

        if (status === "New Data") {
          url += `&createdBy=${leadByUserId}`;
        } else {
          url += `&status=${status}`;

          if (role === "telecaller") {
            url += `&assignedTo=${employeeId}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
          } else if (role === "digitalmarketer") {
            url += `&assignedTo=${employeeId}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
          } else if (role === "bde") {
            url += `&assignedTo=${employeeId}&appointmentstartdate=${formattedStartDate}&appointmentenddate=${formattedEndDate}`;
            url += `&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
            // REMOVED: &byTagAppointment=true
          }
        }

        const response = await axios.get(url);

        if (response.data.success) {
          setModalData(response.data.businesses);
          setModalPage(response.data.currentPage);
          setAllModalPages(response.data.totalPages);
        } else {
          console.error(
            "Failed to fetch business data:",
            response.data.message
          );
          setModalData([]);
          setModalPage(1);
          setAllModalPages(1);
        }
      } catch (error) {
        console.error("Error fetching business data:", error);
        setModalData([]);
        setModalPage(1);
        setAllModalPages(1);
      }
    },
    []
  );

  const loadMoreModalData = useCallback(async () => {
    if (modalPage < allModalPages) {
      const nextPage = modalPage + 1;
      try {
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

        let url = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?page=${nextPage}`;
        if (openFor === "New Data") {
          url += `&createdBy=${selectedEmployee._id}`;
        } else {
          url += `&status=${openFor}`;
          if (selectedEmployee.role.toLowerCase() === "telecaller") {
            url += `&assignedTo=${selectedEmployee._id}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
          } else if (
            selectedEmployee.role.toLowerCase() === "digitalmarketer"
          ) {
            url += `&assignedTo=${selectedEmployee._id}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
          } else if (selectedEmployee.role.toLowerCase() === "bde") {
            url += `&assignedTo=${selectedEmployee._id}&appointmentstartdate=${formattedStartDate}&appointmentenddate=${formattedEndDate}`;
            url += `&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
            // REMOVED: &byTagAppointment=true
          }
        }

        console.log("Loading more modal data URL (corrected):", url);
        const response = await axios.get(url);
        if (response.data.success) {
          setModalData((prevData) => [
            ...prevData,
            ...response.data.businesses,
          ]);
          setModalPage(response.data.currentPage);
          setAllModalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error loading more business data:", error);
      }
    }
  }, [modalPage, allModalPages, dateRange, openFor, selectedEmployee]);

  const openModal = (emp, openForStatus) => {
    setSelectedEmployee(emp);
    setOpenFor(openForStatus);
    setIsModalOpen(true);
    fetchEmployeeBusinessData(
      emp.role.toLowerCase(),
      emp._id,
      openForStatus,
      dateRange,
      1,
      emp._id
    );
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
    setModalData([]);
    setModalPage(1);
    setAllModalPages(1);
    setOpenFor("");
  };

  const fetchEmployeeData = useCallback(async () => {
    try {
      const [telecallersResponse, bdesResponse, digitalMarketersResponse] =
        await Promise.all([
          axios.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/api/users/get?designation=Telecaller`
          ),
          axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/users/get?designation=BDE`
          ),
          axios.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/api/users/get?designation=digital%20marketer`
          ),
        ]);

      setBdeData(
        bdesResponse.data.users.map((item) => ({
          ...item,
          role: "BDE",
          name: item.name,
        }))
      );

      setTelecallerData(
        telecallersResponse.data.users.map((item) => ({
          ...item,
          role: "Telecaller",
          name: item.name,
        }))
      );

      setDigitalMarketerData(
        digitalMarketersResponse.data.users.map((item) => ({
          ...item,
          role: "Digital Marketer",
          name: item.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  }, []);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  const handleDateRangeChange = (ranges) => {
    setDateRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: "selection",
    });
    setIsDateFilterApplied(false);
  };

  const applyDateFilter = () => {
    setIsDateFilterApplied(true);
    setShowDatePicker(false);
    fetchEmployeeData();
  };

  const clearDateFilter = () => {
    setDateRange({
      startDate: null,
      endDate: null,
      key: "selection",
    });
    setIsDateFilterApplied(false);
    fetchEmployeeData();
  };

  const handleViewDetails = (id, role) => {
    const roleSlug = role.toLowerCase().replace(/\s+/g, "");
    navigate(`/employee-details/${roleSlug}/${id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="py-4 border-b border-[#cccccc] w-full flex flex-row gap-4 items-center relative flex-wrap">
        <h1 className="text-[#777777] text-lg font-semibold">Filter</h1>
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
                  setShowDatePicker(false);
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
      </div>
      <div className="flex flex-col gap-8">
        <DataDisplayTable
          headers={[
            "BDE Name",
            "Login",
            "Logout",
            "Day Count",
            "Total Data",
            "Appointments",
            "Followup",
            "Visit",
            "Deal Close",
            "New Data",
            "Target",
            "Achievement",
            "Action",
          ]}
          filteredData={bdeData}
          openModal={openModal}
          handleViewDetails={handleViewDetails}
          dateRange={dateRange}
        />
        <hr className="border border-[#CCCCCC]" />
        <DataDisplayTable
          headers={[
            "Telecaller Name",
            "Login",
            "Logout",
            "Day Count",
            "Total Data",
            "Appointments",
            "Followup",
            "Deal Close",
            "New Data",
            "Target",
            "Achievement",
            "Action",
          ]}
          filteredData={telecallerData}
          openModal={openModal}
          handleViewDetails={handleViewDetails}
          dateRange={dateRange}
        />
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
        <div className="grid place-items-stretch justify-items-stretch gap-4">
          {modalData && modalData.length > 0 ? (
            modalData.map((data) => (
              <div
                key={data._id}
                className="bg-white text-[#2F2C49] rounded-lg border border-[#CCCCCC] text-sm font-medium flex justify-between p-4"
              >
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex justify-between w-full items-center">
                    <div className="flex items-center gap-2">
                      <span>
                        <GoDotFill />
                      </span>
                      <span className="line-clamp-2">{data.buisnessname}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      <GoDotFill />
                    </span>
                    <a href={`tel:${data.mobileNumber}`}>{data.mobileNumber}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      <GoDotFill />
                    </span>
                    <span className=" flex flex-row items-center gap-2">
                      {data.status} - (
                      {formatDate(
                        data.followUpDate || data.visit_result?.visit_time || ""
                      )}
                      )
                      <span>
                        {data.visit_result?.update_location ? (
                          <Link
                            to={`https://maps.google.com/?q=${data.visit_result.update_location.latitude},${data.visit_result.update_location.longitude}`}
                            target="_blank"
                          >
                            <FaMapLocationDot className=" text-green-800 text-lg" />
                          </Link>
                        ) : (
                          ""
                        )}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      <GoDotFill />
                    </span>
                    <span>{data.category.categoryname}</span>
                  </div>
                  <div className="flex  justify-between w-full items-center ">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span>
                          <GoDotFill />
                        </span>
                        <span>{data.city.cityname}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex gap-2 p-2 items-center justify-center font-semibold text-lg">
              <h1>No Data Found</h1>
            </div>
          )}
          <InfiniteScroll
            modalPage={modalPage}
            fn={() =>
              fetchEmployeeBusinessData(
                selectedEmployee.role.toLowerCase(),
                selectedEmployee.telecallerId ??
                  selectedEmployee.bdeId ??
                  selectedEmployee.digitalMarketerId,
                openFor,
                dateRange,
                modalPage + 1,
                selectedEmployee._id
              )
            }
            allModalPages={allModalPages}
          />
        </div>
      </Modal>
    </div>
  );
};

export default DashboardEmployeeSection;
