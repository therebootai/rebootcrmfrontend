import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";

const ManageLeave = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newApprovalStatus, setNewApprovalStatus] = useState("");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/leave/requests`
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
  }, []);

  const handleEdit = (userId, leaveApproval) => {
    setEditingId(userId);
    setNewApprovalStatus(leaveApproval);
  };

  const handleSave = async (userId, recordId) => {
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/leave/requests/${userId}/${recordId}`,
        {
          leave_approval: newApprovalStatus,
        }
      );

      if (response.data.success) {
        const updatedRequests = leaveRequests.map((request) =>
          request.userId === userId
            ? { ...request, leave_approval: newApprovalStatus }
            : request
        );
        setLeaveRequests(updatedRequests);
        setEditingId(null); // Reset editing state
      }
    } catch (error) {
      console.error("Error updating leave request:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AdminDashboardTemplate>
      <div className=" flex flex-col ">
        <div className=" flex flex-row gap-2 text-xs xl:text-xs font-medium items-center text-[#333333] p-2 xl:p-3 border-b border-t border-[#cccccc]">
          <div className=" flex-1">User Name</div>
          <div className="flex-1">Mobile Number</div>
          <div className="flex-1">Date</div>
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
            <div className="flex-1">
              {new Date(request.date).toLocaleDateString()}
            </div>
            <div className="flex-1">{request.leave_reason}</div>
            <div className="flex-1">
              {editingId === request.userId ? (
                <select
                  value={newApprovalStatus}
                  onChange={(e) => setNewApprovalStatus(e.target.value)}
                  className="border p-1 rounded"
                >
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending">Pending</option>
                </select>
              ) : (
                request.leave_approval
              )}
            </div>
            <div className="flex-1">
              {editingId === request.userId ? (
                <button
                  className="text-blue-900"
                  onClick={() =>
                    handleSave(request.userId, request.attendanceRecordId)
                  }
                >
                  Save
                </button>
              ) : (
                <button
                  className="text-blue-900"
                  onClick={() =>
                    handleEdit(request.userId, request.leave_approval)
                  }
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminDashboardTemplate>
  );
};

export default ManageLeave;
