import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdOutlineVisibility } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // Import date picker styles
import "react-date-range/dist/theme/default.css"; // Import theme styles
import { format, isSameDay, startOfDay, endOfDay } from "date-fns";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import { GoDotFill } from "react-icons/go";

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

const DashboardEmployeeSection = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalData, setModalData] = useState([]);

  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(true);

  const fetchEmployeeBusinessData = async (role, id, status, dateRange) => {
    try {
      let url = "";
      if (role === "telecaller") {
        url = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?telecallerId=${id}&status=${status}&followupstartdate=${
          dateRange.startDate
            ? new Date(
                dateRange.startDate.getTime() -
                  dateRange.startDate.getTimezoneOffset() * 60000
              ).toISOString()
            : ""
        }&followupenddate=${
          dateRange.endDate
            ? new Date(
                dateRange.endDate.getTime() -
                  dateRange.endDate.getTimezoneOffset() * 60000
              ).toISOString()
            : ""
        }`;
      } else if (role === "digitalmarketer") {
        url = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?digitalMarketerId=${id}&status=${status}&category=${category}&followupstartdate=${
          dateRange.startDate
            ? new Date(
                dateRange.startDate.getTime() -
                  dateRange.startDate.getTimezoneOffset() * 60000
              ).toISOString()
            : ""
        }&followupenddate=${
          dateRange.endDate
            ? new Date(
                dateRange.endDate.getTime() -
                  dateRange.endDate.getTimezoneOffset() * 60000
              ).toISOString()
            : ""
        }`;
      } else if (role === "bde") {
        url = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?bdeId=${id}&byTagAppointment=true&status=${status}&appointmentstartdate=${
          dateRange.startDate
            ? new Date(
                dateRange.startDate.getTime() -
                  dateRange.startDate.getTimezoneOffset() * 60000
              ).toISOString()
            : ""
        }&appointmentenddate=${
          dateRange.endDate
            ? new Date(
                dateRange.endDate.getTime() -
                  dateRange.endDate.getTimezoneOffset() * 60000
              ).toISOString()
            : ""
        }`;
      }

      const response = await axios.get(url);
      console.log(response.data.businesses);
      setModalData(response.data.businesses);
    } catch (error) {
      console.error("Error fetching business data:", error);
    }
  };

  const openModal = (emp, openFor) => {
    setSelectedEmployee(emp);
    fetchEmployeeBusinessData(
      emp.role.toLowerCase(),
      emp.telecallerId ?? emp.bdeId ?? emp.digitalMarketerId,
      openFor,
      dateRange
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };

  const fetchEmployeeData = async () => {
    try {
      const [telecallers, digitalMarketers, bdes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/telecaller/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/digitalmarketer/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/bde/get`),
      ]);

      const combinedData = [
        ...telecallers.data.map((item) => ({
          ...item,
          role: "Telecaller",
          name: item.telecallername,
          id: item.telecallerId,
          targets: item.targets || [],
        })),
        ...digitalMarketers.data.map((item) => ({
          ...item,
          role: "Digital Marketer",
          name: item.digitalMarketername,
          id: item.digitalMarketerId,
          targets: item.targets || [],
        })),
        ...bdes.data.map((item) => ({
          ...item,
          role: "BDE",
          name: item.bdename,
          id: item.bdeId,
          targets: item.targets || [],
        })),
      ];

      setData(combinedData);
      // Fetch and filter data for today's date by default
      fetchBusinessData(
        combinedData,
        startOfDay(new Date()),
        endOfDay(new Date())
      );
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const getLatestTarget = (targets) => {
    if (!targets || targets.length === 0) return null;
    return targets.reduce((latest, current) => {
      return !latest ||
        new Date(current.month + " " + current.year) >
          new Date(latest.month + " " + latest.year)
        ? current
        : latest;
    }, null);
  };

  const fetchBusinessData = async (employees) => {
    try {
      const businessPromises = employees.map((employee) => {
        const params = {
          createdstartdate: dateRange.startDate
            ? new Date(
                dateRange.startDate.getTime() -
                  dateRange.startDate.getTimezoneOffset() * 60000
              ).toISOString()
            : null,
          createdenddate: dateRange.endDate
            ? new Date(
                dateRange.endDate.getTime() -
                  dateRange.endDate.getTimezoneOffset() * 60000
              ).toISOString()
            : null,
        };

        let url = "";

        if (employee.role === "Telecaller") {
          url = `${
            import.meta.env.VITE_BASE_URL
          }/api/business/get?telecallerId=${employee.id}`;
        } else if (employee.role === "Digital Marketer") {
          url = `${
            import.meta.env.VITE_BASE_URL
          }/api/business/get?digitalMarketerId=${employee.id}`;
        } else if (employee.role === "BDE") {
          url = `${import.meta.env.VITE_BASE_URL}/api/business/get?bdeId=${
            employee.id
          }&byTagAppointment=true`;
        }

        // Attach query params
        return axios
          .get(url, { params })
          .then((response) => ({
            ...employee,
            businessData: response.data.businesses,
            statuscount: response.data.statuscount,
            totalCount: response.data.totalCount || 0,
          }))
          .catch((err) => {
            console.error(
              `Error fetching business data for ${employee.role}:`,
              err
            );
            return {
              ...employee,
              businessData: [],
              statuscount: {},
              totalCount: 0,
            };
          });
      });

      const updatedData = await Promise.all(businessPromises);
      setFilteredData(updatedData);
    } catch (error) {
      console.error("Error fetching business data:", error);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  // React to date range changes
  useEffect(() => {
    if (data.length > 0) {
      fetchBusinessData(data);
    }
  }, [dateRange, data]);

  const handleDateRangeChange = (ranges) => {
    setDateRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: "selection",
    });
    setIsDateFilterApplied(false);
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

  const headers = [
    "Employee Name",
    "Role",
    "Total Data",
    "Appointments",
    "Followup",
    "Deal Close",
    "Target",
    "Achievement",
    "Action",
  ];

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
                  if (data.length > 0) {
                    fetchBusinessData(data);
                  }
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
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap">
          {headers.map((header, index) => (
            <div
              key={index}
              className="flex-1 text-center text-base font-medium"
            >
              {header}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {filteredData.length > 0 ? (
            filteredData.map((employee, rowIndex) => {
              const latestTarget = getLatestTarget(employee.targets) || {
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
                  <div className="flex-1">{employee.name}</div>
                  <div className="flex-1">{employee.role}</div>
                  <div className="flex-1">{employee.totalCount || "0"}</div>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => openModal(employee, "Appointment Pending")}
                  >
                    {employee.statuscount?.visitCount || "0"}
                  </div>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => openModal(employee, "Followup  ")}
                  >
                    {employee.statuscount?.FollowupCount || "0"}
                  </div>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => openModal(employee, "Deal Closed")}
                  >
                    {employee.statuscount?.dealCloseCount || "0"}
                  </div>

                  <div className="flex-1">{latestTarget.amount || "0"}</div>
                  <div className="flex-1">
                    {achievementPercentage}% ({latestTarget.achievement || "0"})
                  </div>
                  <div className="flex-1">
                    <button
                      className="text-[#00D23B]"
                      onClick={() =>
                        handleViewDetails(employee.id, employee.role)
                      }
                    >
                      <MdOutlineVisibility />
                    </button>
                  </div>
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
        contentLabel="Add Business Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        <div className="grid grid-cols-3 place-items-stretch gap-4">
          {modalData && modalData.length > 0 ? (
            modalData.map((data) => (
              <div
                key={data._id}
                className="bg-white text-[#2F2C49] w-full rounded-lg border border-[#CCCCCC] text-sm font-medium flex justify-between p-4"
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
                    <span>
                      {data.status} - ({formatDate(data.followUpDate ?? "")})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      <GoDotFill />
                    </span>
                    <span>{data.category}</span>
                  </div>
                  <div className="flex  justify-between w-full items-center ">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span>
                          <GoDotFill />
                        </span>
                        <span>{data.city}</span>
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
        </div>
        <Link
          to={`/employee-details/${selectedEmployee?.role.toLowerCase()}/${
            selectedEmployee?.telecallerId ??
            selectedEmployee?.bdeId ??
            selectedEmployee?.digitalMarketerId
          }`}
          className={`text-blue-600 underline float-right mt-4`}
        >
          {modalData.length > 0 ? "View More" : "View All"}
        </Link>
      </Modal>
    </div>
  );
};

export default DashboardEmployeeSection;
