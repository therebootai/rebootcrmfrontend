import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdOutlineVisibility } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // Import date picker styles
import "react-date-range/dist/theme/default.css"; // Import theme styles
import { format, isSameDay, startOfDay, endOfDay } from "date-fns";

const DashboardEmployeeSection = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: startOfDay(new Date()), // Set start date to the start of today
    endDate: endOfDay(new Date()), // Set end date to the end of today
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();

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

  const fetchBusinessData = async (employees, startDate, endDate) => {
    try {
      const businessPromises = employees.map((employee) => {
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
        return axios.get(url).then((response) => ({
          id: employee.id,
          role: employee.role,
          businessData: response.data,
        }));
      });

      const results = await Promise.all(businessPromises);

      const updatedData = employees.map((employee) => {
        const result = results.find((res) => res.id === employee.id);
        if (result) {
          const { businessData } = result;

          const totaldata = businessData.length || 0;

          const filteredBusinessData = businessData.businesses.filter(
            (item) => {
              const followUpDate = new Date(item.followUpDate);
              return followUpDate >= startDate && followUpDate <= endDate;
            }
          );

          const appointment =
            filteredBusinessData.filter(
              (item) => item.status === "Appointment Generated"
            ).length || 0;

          const followup =
            filteredBusinessData.filter((item) => item.status === "Followup")
              .length || 0;

          return {
            ...employee,
            totaldata,
            appointment,
            followup,
            targets: employee.targets || [],
          };
        }
        return employee;
      });

      setFilteredData(updatedData);
    } catch (error) {
      console.error("Error fetching business data:", error);
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

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  // React to date range changes
  useEffect(() => {
    if (data.length > 0) {
      fetchBusinessData(data, dateRange.startDate, dateRange.endDate);
    }
  }, [dateRange, data]);

  const headers = [
    "Employee Name",
    "Role",
    "Total Data",
    "Appointment",
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

  const handleDateRangeChange = (ranges) => {
    setDateRange(ranges.selection);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="py-4 border-b border-[#cccccc] w-full flex flex-row gap-4 items-center relative flex-wrap">
        <h1 className="text-[#777777] text-lg font-semibold">Filter</h1>
        <div className="relative ">
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
            className="w-full border px-2 py-1"
          />
          {showDatePicker && (
            <div className="absolute z-10 w-full sm:w-auto">
              <DateRangePicker
                ranges={[dateRange]}
                moveRangeOnFirstSelection={false}
                onChange={handleDateRangeChange}
                rangeColors={["#ff2722"]}
                // staticRanges={[]}
                // inputRanges={[]}
              />
            </div>
          )}
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
                  <div className="flex-1">{employee.totaldata || "0"}</div>
                  <div className="flex-1">{employee.appointment || "0"}</div>
                  <div className="flex-1">{employee.followup || "0"}</div>
                  <div className="flex-1">{employee.dealclose || "0"}</div>
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
    </div>
  );
};

export default DashboardEmployeeSection;
