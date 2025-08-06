import axios from "axios";
import { useEffect, useState } from "react";
import { MdOutlineVisibility } from "react-icons/md";
import { Link } from "react-router-dom";

const getISTDateString = (dateValue) => {
  if (!dateValue) return null;
  try {
    const d = new Date(dateValue); // Attempt to parse into a Date object
    if (isNaN(d.getTime())) return null; // Check for invalid date

    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Kolkata", // Crucial for IST
    };
    return new Intl.DateTimeFormat("en-CA", options).format(d); // 'en-CA' gives YYYY-MM-DD
  } catch (e) {
    console.error("Error formatting date to IST string:", e);
    return null;
  }
};

// Formats a date value (Date object or string) into a 12-hour time string for IST.
const formatTo12HourFormat = (timeValue) => {
  if (!timeValue) return "N/A";

  let dateObj;

  if (timeValue instanceof Date) {
    dateObj = timeValue; // Already a Date object, no parsing needed
  } else if (typeof timeValue === "string") {
    dateObj = new Date(timeValue);

    if (isNaN(dateObj.getTime())) {
      console.warn(
        "Direct parsing failed for:",
        timeValue,
        "Attempting robust manual parse."
      );

      const parts = timeValue.match(
        /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),\s(\d{4}),\s(\d{2}:\d{2}:\d{2})/
      );

      if (parts && parts.length === 5) {
        const [, day, monthStr, year, time] = parts;
        const monthMap = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };
        const month = monthMap[monthStr];

        dateObj = new Date(
          Date.UTC(
            year,
            month,
            day,
            parseInt(time.substring(0, 2)) - 5,
            parseInt(time.substring(3, 5)) - 30,
            parseInt(time.substring(6, 8))
          )
        );

        const isoLikeString = `${year}-${(month + 1)
          .toString()
          .padStart(2, "0")}-${day.padStart(2, "0")}T${time}`;
        dateObj = new Date(isoLikeString);
      } else {
        console.error(
          "Manual parsing failed: Could not extract parts from:",
          timeValue
        );
        return "Invalid Time";
      }
    }
  } else {
    // If timeValue is neither Date nor string
    return "N/A";
  }

  // If we reach here, dateObj should be a valid Date object
  if (isNaN(dateObj.getTime())) {
    console.error(
      "Final check: Invalid Date object after parsing attempts:",
      timeValue
    );
    return "Invalid Time";
  }

  // Now format the valid Date object to the desired 12-hour time for IST
  return dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata", // Ensure correct timezone is applied for display
  });
};

// Gets attendance record for a specific date, considering IST.
const getAttendanceForDate = (attendanceList, targetDate) => {
  let effectiveTargetDate = targetDate;

  if (!effectiveTargetDate) {
    effectiveTargetDate = new Date(); // Defaults to today if no date provided
  }

  const targetDateISTString = getISTDateString(effectiveTargetDate);

  if (!targetDateISTString) {
    console.error("Could not determine target date in IST for comparison.");
    return {
      entryTime: "nd",
      exitTime: "nd",
      entryLocation: null,
      exitLocation: null,
    };
  }

  // Filter attendance records by comparing their IST date strings
  const filteredAttendance = attendanceList.filter((record) => {
    const recordDateISTString = getISTDateString(record.date);
    return recordDateISTString === targetDateISTString;
  });

  if (filteredAttendance.length > 0) {
    const record = filteredAttendance[0]; // Assuming only one valid record per day

    const entryTime = record.entry_time
      ? formatTo12HourFormat(record.entry_time)
      : "nd";
    const exitTime = record.exit_time
      ? formatTo12HourFormat(record.exit_time)
      : "nd";

    const entryLocation = {
      latitude: record.entry_time_location?.latitude ?? null,
      longitude: record.entry_time_location?.longitude ?? null,
    };
    const exitLocation = {
      latitude: record.exit_time_location?.latitude ?? null,
      longitude: record.exit_time_location?.longitude ?? null,
    };

    return { entryTime, exitTime, entryLocation, exitLocation };
  }

  return {
    entryTime: "nd",
    exitTime: "nd",
    entryLocation: null,
    exitLocation: null,
  };
};

const DataDisplayTable = ({
  headers,
  filteredData,
  openModal,
  handleViewDetails,
  dateRange,
}) => {
  const [visualData, setVisualData] = useState([]);

  const fetchBusinessData = async (employees) => {
    try {
      const businessPromises = employees.map((employee) => {
        const formattedStartDate = dateRange.startDate
          ? new Date(
              dateRange.startDate.getTime() -
                dateRange.startDate.getTimezoneOffset() * 60000
            )
              .toISOString()
              .split("T")[0]
          : "";
        const formattedEndDate = dateRange.endDate
          ? new Date(
              dateRange.endDate.getTime() -
                dateRange.endDate.getTimezoneOffset() * 60000
            )
              .toISOString()
              .split("T")[0]
          : "";

        const params = {
          createdstartdate: formattedStartDate,
          createdenddate: formattedEndDate,
          appointmentstartdate: formattedStartDate,
          appointmentenddate: formattedEndDate,
          followupstartdate: formattedStartDate,
          followupenddate: formattedEndDate,
          visitdatestart: formattedStartDate,
          visitdateend: formattedEndDate,
        };

        const safeParams = Object.fromEntries(
          Object.entries(params).map(([key, val]) => [key, String(val)])
        );

        let url = "";
        if (employee.role === "Telecaller") {
          url = `${import.meta.env.VITE_BASE_URL}/api/business/get?leadBy=${
            employee.id
          }`;
        } else if (employee.role === "Digital Marketer") {
          url = `${import.meta.env.VITE_BASE_URL}/api/business/get?leadBy=${
            employee.id
          }`;
        } else if (employee.role === "BDE") {
          url = `${import.meta.env.VITE_BASE_URL}/api/business/get?assignedTo=${
            employee.id
          }&byTagAppointment=true`;
        }
        console.log("Request params:", params);
        return axios
          .get(url, { params: safeParams })
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
      setVisualData(updatedData);
    } catch (error) {
      console.error("Error fetching business data:", error);
    }
  };

  useEffect(() => {
    // Only fetch if filteredData is available and has items
    if (filteredData && filteredData.length > 0) {
      fetchBusinessData(filteredData);
    } else {
      setVisualData([]); // Clear visual data if filteredData is empty
    }
  }, [filteredData, dateRange]); // Re-run when filteredData or dateRange changes

  // Get the latest target for an employee based on month and year
  const getLatestTarget = (targets) => {
    if (!targets || targets.length === 0) return null;

    // Use a consistent Date object for comparison to handle timezone correctly
    return targets.reduce((latest, current) => {
      // Create a Date object from "Month Year" string, ensure it's comparable
      const currentDate = new Date(`${current.month} 1, ${current.year}`);
      const latestDate = latest
        ? new Date(`${latest.month} 1, ${latest.year}`)
        : null;

      // Handle invalid dates from parsing if any
      if (isNaN(currentDate.getTime())) return latest;

      if (
        !latestDate ||
        isNaN(latestDate.getTime()) ||
        currentDate.getTime() > latestDate.getTime()
      ) {
        return current;
      }
      return latest;
    }, null);
  };

  // Calculate total day count for attendance within a given date range (IST-aware)
  function calculateTotalDayCountByDate(
    attendanceList,
    targetDateRange = null
  ) {
    let totalDayCount = 0;

    if (!attendanceList || attendanceList.length === 0) {
      return totalDayCount;
    }

    let filterStartDateIST = null;
    let filterEndDateIST = null;

    // Determine if valid startDate and endDate were provided for filtering
    if (
      targetDateRange &&
      targetDateRange.startDate instanceof Date &&
      !isNaN(targetDateRange.startDate.getTime()) &&
      targetDateRange.endDate instanceof Date &&
      !isNaN(targetDateRange.endDate.getTime())
    ) {
      // Get the IST date strings for the start and end of the filter range
      filterStartDateIST = getISTDateString(targetDateRange.startDate);
      filterEndDateIST = getISTDateString(targetDateRange.endDate);
    }

    attendanceList.forEach((record) => {
      if (record.date) {
        const recordDateISTString = getISTDateString(record.date); // Get IST date for record

        if (!recordDateISTString) {
          console.warn(
            `Warning: Invalid date in attendance record for IST comparison. Skipping: ${record.date}`
          );
          return;
        }

        if (filterStartDateIST && filterEndDateIST) {
          // Compare IST date strings for range inclusion
          if (
            recordDateISTString >= filterStartDateIST &&
            recordDateISTString <= filterEndDateIST
          ) {
            const dayCountValue = parseFloat(record.day_count);
            if (!isNaN(dayCountValue)) {
              totalDayCount += dayCountValue;
            } else {
              console.warn(
                `Warning: Invalid day_count '${record.day_count}' for record on ${recordDateISTString}. Skipping.`
              );
            }
          }
        } else {
          // If no specific date range filter is active, sum all day_count values
          const dayCountValue = parseFloat(record.day_count);
          if (!isNaN(dayCountValue)) {
            totalDayCount += dayCountValue;
          } else {
            console.warn(
              `Warning: Invalid day_count '${record.day_count}'. Skipping.`
            );
          }
        }
      } else {
        console.warn(
          "Warning: Attendance record missing valid 'date' field. Skipping."
        );
      }
    });

    return totalDayCount;
  }

  const isBDE = (employee) => employee.designation === "BDE";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {headers.map((header, index) => (
          <div key={index} className="flex-1 text-center text-sm font-medium">
            {header}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {filteredData?.length > 0 ? (
          filteredData?.map((employee, rowIndex) => {
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
                <div className="flex-1">
                  {getAttendanceForDate(
                    employee.attendence_list,
                    dateRange.startDate
                  ).entryLocation &&
                  getAttendanceForDate(
                    employee.attendence_list,
                    dateRange.startDate
                  )?.entryLocation.latitude &&
                  getAttendanceForDate(
                    employee.attendence_list,
                    dateRange.startDate
                  )?.entryLocation.longitude ? (
                    <Link
                      to={`https://maps.google.com/?q=${
                        getAttendanceForDate(
                          employee.attendence_list,
                          dateRange.startDate
                        )?.entryLocation.latitude
                      },${
                        getAttendanceForDate(
                          employee.attendence_list,
                          dateRange.startDate
                        )?.entryLocation.longitude
                      }`}
                      target="_blank"
                    >
                      {
                        getAttendanceForDate(
                          employee.attendence_list,
                          dateRange.startDate
                        )?.entryTime
                      }
                    </Link>
                  ) : (
                    <span>
                      {
                        getAttendanceForDate(
                          employee.attendence_list,
                          dateRange.startDate
                        )?.entryTime
                      }
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  {getAttendanceForDate(
                    employee.attendence_list,
                    dateRange.startDate
                  ).exitLocation &&
                  getAttendanceForDate(
                    employee.attendence_list,
                    dateRange.startDate
                  )?.exitLocation.latitude &&
                  getAttendanceForDate(
                    employee.attendence_list,
                    dateRange.startDate
                  )?.exitLocation.longitude ? (
                    <Link
                      to={`https://maps.google.com/?q=${
                        getAttendanceForDate(
                          employee.attendence_list,
                          dateRange.startDate
                        )?.exitLocation.latitude
                      },${
                        getAttendanceForDate(
                          employee.attendence_list,
                          dateRange.startDate
                        ).exitLocation.longitude
                      }`}
                      target="_blank"
                    >
                      {
                        getAttendanceForDate(
                          employee.attendence_list,
                          dateRange.startDate
                        )?.exitTime
                      }
                    </Link>
                  ) : (
                    <span>
                      {
                        getAttendanceForDate(
                          employee.attendence_list,
                          dateRange.startDate
                        )?.exitTime
                      }
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  {calculateTotalDayCountByDate(
                    employee.attendence_list,
                    dateRange
                  )}
                </div>
                <div className="flex-1">{employee.totalCount || "0"}</div>
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => openModal(employee, "Appointment Generated")}
                >
                  {employee.statuscount?.appointmentCount || "0"}
                </div>
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => openModal(employee, "Followup")}
                >
                  {employee.statuscount?.FollowupCount || "0"}
                </div>

                {isBDE(employee) && (
                  <div
                    onClick={() => openModal(employee, "Visited")}
                    className="flex-1 cursor-pointer"
                  >
                    {employee.statuscount?.visitCount || "0"}
                  </div>
                )}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => openModal(employee, "Deal Closed")}
                >
                  {employee.statuscount?.dealCloseCount || "0"}
                </div>

                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => openModal(employee, "New Data")}
                >
                  {employee.statuscount?.created_business_count || "0"}
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
  );
};

export default DataDisplayTable;
