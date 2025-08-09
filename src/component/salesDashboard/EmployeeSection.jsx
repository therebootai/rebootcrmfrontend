import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import AddTarget from "../adminbuisness/AddTarget";
import { DateRangePicker } from "react-date-range";
import { format } from "date-fns";
import EditTarget from "../adminbuisness/EditTarget";
import InfiniteScroll from "../InfiniteScroll";
import axios from "axios";
import { GoDotFill } from "react-icons/go";
import { Link } from "react-router-dom";
import { FaMapLocationDot } from "react-icons/fa6";

const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

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

const toUTCISOStringForQuery = (date, isEndDate = false) => {
  if (!date) return "";
  const d = new Date(date);
  if (isEndDate) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
};

const EmployeeSection = ({
  employees,
  dateRange, // This is the dateRange for the overall dashboard filters
  setDateRange, // Function to update the overall dashboard dateRange
  fetchtableData, // Function to re-fetch employee table data
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
  const [openFor, setOpenFor] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalPage, setModalPage] = useState(1);
  const [allModalPages, setAllModalPages] = useState(1);

  const openModal = (openForType, emp) => {
    setSelectedEmployee(emp);
    setOpenFor(openForType);
    setIsModalOpen(true);
  };

  const openBusinessModal = async (openForStatus, emp) => {
    setSelectedEmployee(emp);
    setOpenFor(openForStatus);
    setIsModalOpen(true);
    await fetchEmployeeBusinessData(
      emp.designation.toLowerCase(),
      emp._id,
      openForStatus,
      dateRange,
      1,
      emp._id
    );
  };

  const closeModal = () => {
    setOpenFor("");
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };

  const headers = [
    "Employee Name",
    "Role",
    "Appointment",
    "Visit",
    "Deal Close",
    "Target", // Clarified
    "Sales", // Clarified
    "Collection", // Now distinct from Sales Achievement
    "Achievement %",
  ];

  // This function finds the latest target object within a given date range
  const getLatestTarget = (targets, startDate = null, endDate = null) => {
    if (!targets || targets.length === 0) return null;

    let filteredTargets = targets;

    const applyDateRangeFilter =
      startDate instanceof Date &&
      !isNaN(startDate) &&
      endDate instanceof Date &&
      !isNaN(endDate);

    if (applyDateRangeFilter) {
      const startOfMonthFilter = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
      );
      const endOfMonthFilter = new Date(
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        0
      );

      filteredTargets = targets.filter((target) => {
        const targetDate = new Date(
          target.year,
          new Date(Date.parse(target.month + " 1, 2000")).getMonth(),
          1
        );

        return (
          targetDate >= startOfMonthFilter && targetDate <= endOfMonthFilter
        );
      });
    }

    if (filteredTargets.length === 0) {
      return null;
    }

    const latestTarget = filteredTargets.reduce((latest, current) => {
      const currentTargetDate = new Date(current.month + " 1, " + current.year);
      const latestTargetDate = latest
        ? new Date(latest.month + " 1, " + latest.year)
        : null;

      return !latest || currentTargetDate > latestTargetDate ? current : latest;
    }, null);

    // Ensure all expected properties exist, defaulting to 0 if missing
    if (latestTarget) {
      latestTarget.amount = latestTarget.amount ?? 0;
      latestTarget.achievement = latestTarget.achievement ?? 0;
      latestTarget.collection = latestTarget.collection ?? 0; // Ensure collection is also defaulted
    }

    return latestTarget;
  };

  // --- REMOVED: getCollectionValue is no longer needed as employee.collections is already the sum ---

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
      startDate: null,
      endDate: null,
      key: "selection",
    };
    setDateRange(emptyDateRange);
    setIsDateFilterApplied(false);
  };

  useEffect(() => {
    fetchtableData();
  }, [dateRange, fetchtableData]);

  const fetchEmployeeBusinessData = useCallback(
    async (role, employeeId, status, currentDateRange, page = 1) => {
      try {
        setModalData([]);
        setModalPage(1);

        const formattedStartDate = toUTCISOStringForQuery(
          currentDateRange.startDate
        );
        const formattedEndDate = toUTCISOStringForQuery(
          currentDateRange.endDate,
          true
        );

        let url = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?page=${page}`;

        if (status === "New Data") {
          url += `&createdBy=${employeeId}&createdstartdate=${formattedStartDate}&createdenddate=${formattedEndDate}`;
        } else if (status === "Followup") {
          if (role === "telecaller" || role === "digitalmarketer") {
            url += `&leadBy=${employeeId}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
          } else if (role === "bde") {
            url += `&assignedTo=${employeeId}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
          }
        } else if (status === "Appointment Generated") {
          if (role === "bde") {
            url += `&status=Appointment Generated&assignedTo=${employeeId}&appointmentstartdate=${formattedStartDate}&appointmentenddate=${formattedEndDate}`;
          } else if (role === "telecaller" || role === "digitalmarketer") {
            url += `&status=Appointment Generated&leadBy=${employeeId}&appointmentstartdate=${formattedStartDate}&appointmentenddate=${formattedEndDate}`;
          }
        } else if (status === "Visited") {
          if (role === "bde") {
            url += `&status=Visited&assignedTo=${employeeId}&visitdatestart=${formattedStartDate}&visitdateend=${formattedEndDate}`;
          } else if (role === "telecaller" || role === "digitalmarketer") {
            url += `status=Visited&leadBy=${employeeId}&visitdatestart=${formattedStartDate}&visitdateend=${formattedEndDate}`;
          }
        } else if (status === "Deal Closed") {
          if (role === "bde") {
            url += `&status=Deal Closed&assignedTo=${employeeId}&visitdatestart=${formattedStartDate}&visitdateend=${formattedEndDate}`;
          } else if (role === "telecaller" || role === "digitalmarketer") {
            url += `&status=Deal Closed&leadBy=${employeeId}&visitdatestart=${formattedStartDate}&visitdateend=${formattedEndDate}`;
          }
        } else {
          url += `&status=${status}`;

          if (status === "") {
          }

          if (role === "telecaller") {
            url += `&leadBy=${employeeId}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
          } else if (role === "digitalmarketer") {
            url += `&leadBy=${employeeId}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
          } else if (role === "bde") {
            url += `&assignedTo=${employeeId}&appointmentstartdate=${formattedStartDate}&appointmentenddate=${formattedEndDate}`;
            url += `&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
            url += `&visitdatestart=${formattedStartDate}&visitdateend=${formattedEndDate}`;
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-6 items-center">
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
              className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC] cursor-pointer"
            />

            {showDatePicker && (
              <div className="absolute z-10 top-full mt-2 left-0">
                <DateRangePicker
                  ranges={[dateRange]}
                  onChange={handleDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  rangeColors={["#0A5BFF"]}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isDateFilterApplied ? (
              <button
                className="px-2 py-1 bg-[#0A5BFF] text-white rounded-md text-sm font-medium cursor-pointer"
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
        <button
          onClick={() => openModal("Add Target", null)}
          className="h-[2rem] px-6 flex justify-center items-center bg-[#0A5BFF] rounded-md text-sm font-medium text-white"
        >
          Add Target
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {headers.map((header, index) => (
            <div key={index} className="flex-1 text-center text-sm font-medium">
              {header}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {employees?.length > 0 ? (
            employees?.map((employee, rowIndex) => {
              const latestTarget = getLatestTarget(
                employee.targets,
                dateRange.startDate,
                dateRange.endDate
              ) || {
                amount: 0,
                achievement: 0,
                collection: 0, // Ensure collection is also defaulted here
              };

              // employee.collections is now the pre-calculated sum of target.collection for the tableDateRange
              const totalCollectionForPeriod =
                parseFloat(employee.collections) || 0;

              const achievementPercentage =
                latestTarget.amount && latestTarget.amount > 0
                  ? (
                      (latestTarget.achievement / latestTarget.amount) *
                      100
                    ).toFixed(2)
                  : 0;

              return (
                <div
                  key={employee._id}
                  className="flex flex-row text-center gap-2 text-[#777777] text-sm font-medium flex-wrap border-b py-2"
                >
                  <div className="flex-1 line-clamp-1">{employee.name}</div>
                  <div className="flex-1">{employee.designation}</div>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      openBusinessModal("Appointment Generated", employee)
                    }
                  >
                    {employee.statuscount?.appointmentCount || "0"}
                  </div>

                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => openBusinessModal("Followup", employee)}
                  >
                    {employee.statuscount?.visitCount || "0"}
                  </div>

                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => openBusinessModal("Deal Closed", employee)}
                  >
                    {employee.statuscount?.dealCloseCount || "0"}
                  </div>

                  <div className="flex-1">
                    {rupeeFormatter.format(latestTarget.amount)}
                  </div>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => openModal("Update Target", employee)}
                  >
                    {rupeeFormatter.format(latestTarget.achievement)}
                  </div>
                  <div className="flex-1">
                    {rupeeFormatter.format(totalCollectionForPeriod)}
                  </div>
                  <div className="flex-1">{achievementPercentage}%</div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">
              No employees available.
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Target Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        {openFor === "Add Target" && (
          <AddTarget
            closeModal={closeModal}
            onUpdate={async () => await fetchtableData()}
          />
        )}
        {openFor === "Update Target" && (
          <EditTarget
            user={selectedEmployee}
            onClose={closeModal}
            onUpdate={async () => await fetchtableData()}
            updateDate={dateRange.startDate}
          />
        )}
        {(openFor === "Appointment Generated" ||
          openFor === "Followup" ||
          openFor === "Deal Closed") && (
          <>
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
                          <span className="line-clamp-2">
                            {data.buisnessname}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          <GoDotFill />
                        </span>
                        <a href={`tel:${data.mobileNumber}`}>
                          {data.mobileNumber}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          <GoDotFill />
                        </span>
                        <span className=" flex flex-row items-center gap-2">
                          {data.status} - (
                          {formatDate(
                            data.followUpDate ||
                              data.visit_result?.visit_time ||
                              ""
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
                fn={async () =>
                  await fetchEmployeeBusinessData(
                    selectedEmployee.designation.toLowerCase(),
                    selectedEmployee._id,
                    openFor,
                    dateRange,
                    modalPage + 1,
                    selectedEmployee._id
                  )
                }
                allModalPages={allModalPages}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeSection;
