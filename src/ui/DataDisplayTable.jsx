import axios from "axios";
import { useEffect, useState } from "react";
import { MdOutlineVisibility } from "react-icons/md";

const DataDisplayTable = ({
  headers,
  filteredData,
  openModal,
  handleViewDetails,
  dateRange,
}) => {
  const [visualData, setVisualData] = useState(filteredData);

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
      setVisualData(updatedData);
    } catch (error) {
      console.error("Error fetching business data:", error);
    }
  };

  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      fetchBusinessData(filteredData);
    } else {
      // If filteredData is empty, clear visualData
      setVisualData([]);
    }
  }, [filteredData, dateRange]);

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

  function calculateTotalDayCountByDate(attendanceList, targetDateObj = null) {
    let totalDayCount = 0;

    let useMonthYearFilter = false;
    let targetMonth = -1; // 0-indexed
    let targetYear = -1;

    // Determine if a valid targetDateObj was provided for filtering
    if (targetDateObj instanceof Date && !isNaN(targetDateObj.getTime())) {
      useMonthYearFilter = true;
      targetMonth = targetDateObj.getMonth();
      targetYear = targetDateObj.getFullYear();
    }

    if (!attendanceList || attendanceList.length === 0) {
      return totalDayCount;
    }

    attendanceList.forEach((record) => {
      // Ensure the record has a 'date' field and it's a valid date string from MongoDB
      if (record.date && record.date) {
        const recordDate = new Date(record.date);

        // Validate that the parsed recordDate is actually a valid Date
        if (isNaN(recordDate.getTime())) {
          console.warn(
            `Warning: Invalid date string '${record.date}' in attendance record. Skipping.`
          );
          return; // Skip this record
        }

        // Apply filter if a valid targetDateObj was provided
        if (useMonthYearFilter) {
          if (
            recordDate.getMonth() === targetMonth &&
            recordDate.getFullYear() === targetYear
          ) {
            const dayCountValue = parseFloat(record.day_count);
            if (!isNaN(dayCountValue)) {
              totalDayCount += dayCountValue;
            } else {
              console.warn(
                `Warning: Invalid day_count '${
                  record.day_count
                }' for record on ${
                  recordDate.toISOString().split("T")[0]
                }. Skipping.`
              );
            }
          }
        } else {
          // No valid targetDateObj, sum all day_count values
          const dayCountValue = parseFloat(record.day_count);
          if (!isNaN(dayCountValue)) {
            totalDayCount += dayCountValue;
          } else {
            console.warn(
              `Warning: Invalid day_count '${record.day_count}' for record on ${
                recordDate.toISOString().split("T")[0]
              }. Skipping.`
            );
          }
        }
      } else {
        console.warn(
          "Warning: Attendance record missing valid 'date.$date' field. Skipping."
        );
      }
    });

    return totalDayCount;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {headers.map((header, index) => (
          <div key={index} className="flex-1 text-center text-base font-medium">
            {header}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {visualData?.length > 0 ? (
          visualData?.map((employee, rowIndex) => {
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
                  {calculateTotalDayCountByDate(
                    employee.attendence_list,
                    dateRange.startDate
                  )}
                </div>
                <div className="flex-1">{employee.totalCount || "0"}</div>
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => openModal(employee, "Appointment Pending")}
                >
                  {employee.statuscount?.visitCount || "0"}
                </div>
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => openModal(employee, "Followup")}
                >
                  {employee.statuscount?.FollowupCount || "0"}
                </div>
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
