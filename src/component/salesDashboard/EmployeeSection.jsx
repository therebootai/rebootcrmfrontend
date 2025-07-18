import React, { useState } from "react";
import Modal from "react-modal";
import AddTarget from "../adminbuisness/AddTarget";
import { DateRangePicker } from "react-date-range";
import { format } from "date-fns";
import EditTarget from "../adminbuisness/EditTarget";

const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0, // No decimal places for whole rupees
  maximumFractionDigits: 0,
});

const EmployeeSection = ({
  employees,
  dateRange,
  setDateRange,
  fetchtableData,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
  const [openFor, setOpenFor] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const openModal = (openFor, emp) => {
    setSelectedEmployee(emp);
    setOpenFor(openFor);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setOpenFor("");
    setIsModalOpen(false);
  };
  const headers = [
    "Employee Name",
    "Role",
    "Appointment",
    "Visit",
    "Deal Close",
    "Target",
    "Sales",
    "Collection",
    "Achievement",
  ];

  const getLatestTarget = (targets, startDate = null, endDate = null) => {
    if (!targets || targets.length === 0) return null;

    let filteredTargets = targets;

    // Check if a valid date range is provided
    const applyDateRangeFilter =
      startDate instanceof Date &&
      !isNaN(startDate) &&
      endDate instanceof Date &&
      !isNaN(endDate);

    if (applyDateRangeFilter) {
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1); // Normalize to start of month
      const end = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0); // Normalize to end of month

      filteredTargets = targets.filter((target) => {
        const targetDate = new Date(
          target.year,
          new Date(Date.parse(target.month + " 1, 2000")).getMonth(),
          1
        ); // Normalize target month/year to a Date object

        // Compare targetDate with the start and end of the filter range
        return targetDate >= start && targetDate <= end;
      });
    }

    // If after filtering, no targets remain, return null
    if (filteredTargets.length === 0) {
      return null;
    }

    // Find the latest target from the (potentially filtered) list
    const latestTarget = filteredTargets.reduce((latest, current) => {
      const currentTargetDate = new Date(current.month + " " + current.year);
      const latestTargetDate = latest
        ? new Date(latest.month + " " + latest.year)
        : null;

      return !latest || currentTargetDate > latestTargetDate ? current : latest;
    }, null);

    // Ensure 'achievement' property exists on the returned object, defaulting to 0 if missing
    if (latestTarget && latestTarget.achievement === undefined) {
      latestTarget.achievement = 0;
    }

    return latestTarget;
  };

  const getTotalCollection = (collection, filterDate = null) => {
    // If the collection is empty or not provided, return 0
    if (!collection || collection.length === 0) return 0;

    let totalCollection = 0;

    // Determine if a date filter should be applied
    // A filterDate is applied if it's a valid Date object.
    const applyDateFilter = filterDate instanceof Date && !isNaN(filterDate);

    let targetMonth = null;
    let targetYear = null;

    if (applyDateFilter) {
      targetMonth = filterDate.toLocaleString("en-IN", {
        month: "long",
      }); // e.g., "July"
      targetYear = filterDate.getFullYear();
    }

    collection.forEach((item) => {
      // Sum amounts from cleardAmount
      if (item.cleardAmount && item.cleardAmount.length > 0) {
        item.cleardAmount.forEach((clearItem) => {
          const paymentAmount = parseFloat(clearItem.amount || 0);

          if (applyDateFilter) {
            const paymentDate = new Date(clearItem.createdAt);
            const paymentMonth = paymentDate.toLocaleString("en-IN", {
              month: "long",
            });
            const paymentYear = paymentDate.getFullYear();

            if (paymentMonth === targetMonth && paymentYear === targetYear) {
              totalCollection += paymentAmount;
            }
          } else {
            // No date filter applied, sum all
            totalCollection += paymentAmount;
          }
        });
      }

      // Sum amounts from monthlyPaymentAmount
      if (item.monthlyPaymentAmount && item.monthlyPaymentAmount.length > 0) {
        item.monthlyPaymentAmount.forEach((monthlyItem) => {
          const paymentAmount = parseFloat(monthlyItem.totalAmount || 0);

          if (applyDateFilter) {
            const paymentDate = new Date(monthlyItem.createdAt);
            const paymentMonth = paymentDate.toLocaleString("en-IN", {
              month: "long",
            });
            const paymentYear = paymentDate.getFullYear();

            if (paymentMonth === targetMonth && paymentYear === targetYear) {
              totalCollection += paymentAmount;
            }
          } else {
            // No date filter applied, sum all
            totalCollection += paymentAmount;
          }
        });
      }
    });

    return totalCollection;
  };

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

  return (
    <div className=" flex flex-col gap-4">
      <div className=" flex flex-row gap-6 items-center">
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
                  rangeColors={["#0A5BFF"]}
                />
              </div>
            )}
          </div>

          <div className=" flex items-center gap-2">
            {!isDateFilterApplied ? (
              <button
                className="px-2 py-1 bg-[#0A5BFF] text-white rounded-md text-sm font-medium cursor-pointer"
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
        <button
          onClick={() => openModal("Add Target", null)}
          className=" h-[2rem] px-6 flex justify-center items-center bg-[#0A5BFF] rounded-md text-sm font-medium text-white"
        >
          Add Target
        </button>
      </div>
      <div className=" flex flex-col gap-2">
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
              };

              const achievementPercentage =
                latestTarget.amount && latestTarget.achievement
                  ? (
                      (latestTarget.achievement / latestTarget.amount) *
                      100
                    ).toFixed(2)
                  : 0;

              return (
                <div
                  key={rowIndex}
                  className="flex flex-row text-center gap-2 text-[#777777] text-sm font-medium flex-wrap"
                >
                  <div className="flex-1 line-clamp-1">{employee.name}</div>
                  <div className="flex-1">{employee.role}</div>
                  <div className="flex-1 cursor-pointer">
                    {employee.statuscount?.appointmentCount || "0"}
                  </div>

                  <div className="flex-1 cursor-pointer">
                    {employee.statuscount?.visitCount || "0"}
                  </div>

                  <div className="flex-1 cursor-pointer">
                    {employee.statuscount?.dealCloseCount || "0"}
                  </div>

                  <div className="flex-1">
                    {latestTarget.amount
                      ? rupeeFormatter.format(latestTarget.amount)
                      : "0"}
                  </div>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => openModal("Update Target", employee)}
                  >
                    {latestTarget.achievement
                      ? rupeeFormatter.format(latestTarget.achievement)
                      : "0"}
                  </div>
                  <div className="flex-1">
                    {rupeeFormatter.format(
                      getTotalCollection(employee.collections)
                    )}
                  </div>
                  <div className="flex-1">{achievementPercentage}%</div>
                </div>
              );
            })
          ) : (
            <div>No employees available</div>
          )}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Target Modal"
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
      </Modal>
    </div>
  );
};

export default EmployeeSection;
