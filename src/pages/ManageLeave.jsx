import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import { DateRangePicker } from "react-date-range";
import { format } from "date-fns";

const ManageLeave = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newApprovalStatus, setNewApprovalStatus] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateRangeSelected, setIsDateRangeSelected] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
  const [bdeData, setBdeData] = useState([]);
  const [telecallerData, setTelecallerData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const fetchEmployeeData = async () => {
    try {
      const [telecallers, bdes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/telecaller/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/bde/get`),
      ]);

      setBdeData([
        ...bdes.data.map((item) => ({
          ...item,
          role: "BDE",
          name: item.bdename,
          id: item._id,
          targets: item.targets || [],
        })),
      ]);

      setTelecallerData([
        ...telecallers.data.map((item) => ({
          ...item,
          role: "Telecaller",
          name: item.telecallername,
          id: item._id,
          targets: item.targets || [],
        })),
      ]);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const combinedData = [...bdeData, ...telecallerData].map((employee) => ({
    ...employee,
    label: `${employee.name} (${employee.role})`,
  }));

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/users/leave/requests`,
          {
            params: {
              userId: selectedEmployee,
              startDate: dateRange.startDate
                ? new Date(
                    dateRange.startDate.getTime() -
                      dateRange.startDate.getTimezoneOffset() * 60000
                  ).toISOString()
                : "",
              endDate: dateRange.endDate
                ? new Date(
                    dateRange.endDate.getTime() -
                      dateRange.endDate.getTimezoneOffset() * 60000
                  ).toISOString()
                : "",
            },
          }
        );
        if (response.data.success) {
          setLeaveRequests(response.data.leaveRequests);
        }
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [dateRange, selectedEmployee]);

  const handleApprovalChange = async (user, newStatus) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/users/leave/requests/${
          user.userId
        }/${user.attendanceRecordId}`,
        {
          leave_approval: newStatus,
        }
      );

      if (response.data.success) {
        const updatedRequests = leaveRequests.map((request) =>
          request.userId === user.userId
            ? { ...request, leave_approval: newStatus }
            : request
        );
        setLeaveRequests(updatedRequests);
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/send-notification`,
          {
            targetUserId: user.userId,
            title: `Your leave request has been ${newStatus}`,
            body: `Your leave request of ${new Date(
              user.date
            ).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })} has been ${newStatus}.`,
          }
        );
      }
    } catch (error) {
      console.error("Error updating leave request:", error);
    }
  };

  const handleDateRangeChange = (ranges) => {
    setDateRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: "selection",
    });
    setIsDateRangeSelected(true); // Mark date range as selected
    setIsDateFilterApplied(false); // Reset filter applied state
  };

  const clearDateFilter = () => {
    setDateRange({
      startDate: null,
      endDate: null,
      key: "selection",
    });
    setIsDateRangeSelected(false); // Reset date range selected flag
    setIsDateFilterApplied(false); // Reset filter applied state
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    };

    return date.toLocaleDateString("en-GB", options);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4">
        <div className=" flex flex-row items-center gap-4">
          <div className="relative">
            <input
              type="text"
              value={
                isDateRangeSelected
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
          <div className="flex-1">
            <select
              onChange={(e) => setSelectedEmployee(e.target.value)} // Update the selected employee on change
              className="border p-1 rounded"
            >
              <option value="">Select Employee</option>
              {combinedData.map((employee) => (
                <option key={employee.id} value={employee._id}>
                  {employee.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className=" flex flex-col ">
          <div className=" flex flex-row gap-2 text-xs xl:text-xs font-medium items-center text-[#333333] p-2 xl:p-3 border-b border-t border-[#cccccc]">
            <div className=" flex-1">User Name</div>
            <div className="flex-1">Mobile Number</div>
            <div className="flex-1">Designation</div>

            <div className="flex-1">Leave Date</div>
            <div className="flex-1">Leave Reason</div>
            <div className="flex-1">Leave Approval</div>
            <div className="flex-1">Action</div>
          </div>

          {leaveRequests.map((request) => (
            <div
              className=" flex flex-row gap-2 text-xs   xl:text-xs p-2 xl:p-3 text-[#333333] border-b border-[#eeeeee]"
              key={request.attendanceRecordId}
            >
              <div className="flex-1">{request.userName}</div>
              <div className=" flex-1">{request.userNumber}</div>
              <div className=" flex-1">{request.userType}</div>

              <div className="flex-1">{formatDate(request.date)}</div>
              <div className="flex-1">{request.leave_reason}</div>
              <div className="flex-1 capitalize">{request.leave_approval}</div>
              <div className="flex-1">
                <div>
                  <button
                    className="text-blue-900 cursor-pointer"
                    onClick={() => handleApprovalChange(request, "approved")}
                  >
                    Approve
                  </button>{" "}
                  /
                  <button
                    className="text-red-600 ml-1 cursor-pointer"
                    onClick={() => handleApprovalChange(request, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminDashboardTemplate>
  );
};

export default ManageLeave;
