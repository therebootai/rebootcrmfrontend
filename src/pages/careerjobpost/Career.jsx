import React, { useState, useEffect } from "react";
import AdminDashboardTemplate from "../../template/AdminDashboardTemplate";
import PostJob from "./PostJob";
import axios from "axios";
import { MdOutlineVisibility } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import EditJobDetails from "./EditJobDetails";
import ViewJobDetails from "./ViewJobDetails";

const Career = () => {
  const [openJobpostModel, setOpenJobpostModel] = useState(false);
  const [jobPosts, setJobPosts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [openEditModel, setOpenEditModel] = useState(false);
  const [openViewJobModel, setOpenViewJobModel] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const baseURL = import.meta.env.VITE_BASE_URL;

  // Fetch job posts with pagination
  const fetchJobPosts = async (page = 1) => {
    try {
      const response = await axios.get(`${baseURL}/api/jobpost/get`, {
        params: { page, limit: 10 },
      });
      setJobPosts(response.data.data);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error("Error fetching job posts:", error);
    }
  };

  // Handle active status toggle
  const handleStatusToggle = async (jobpostId, currentStatus) => {
    try {
      await axios.put(`${baseURL}/api/jobpost/update/${jobpostId}`, {
        active: !currentStatus,
      });
      fetchJobPosts(pagination.currentPage); // Refetch posts after update
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  // Handle job deletion
  const handleDeleteJob = async (jobpostId) => {
    try {
      await axios.delete(`${baseURL}/api/jobpost/delete/${jobpostId}`);
      setShowDeleteConfirmation(false);
      fetchJobPosts(pagination.currentPage);
    } catch (error) {
      console.error("Error deleting job post:", error);
    }
  };

  // Open modal for posting job
  const handleOpenJobPostModel = () => {
    setOpenJobpostModel(true);
  };

  // Close modal for posting job
  const handleCloseJobPostModel = () => {
    setOpenJobpostModel(false);
  };

  // Open modal for editing job
  const handleOpenEditModel = (job) => {
    setSelectedJob(job);
    setOpenEditModel(true);
  };

  // Close edit job modal
  const handleCloseEditModel = () => {
    setOpenEditModel(false);
    setSelectedJob(null);
  };

  const handleOpenViewJobModel = (job) => {
    // Open View Job model
    setSelectedJob(job);
    setOpenViewJobModel(true);
  };

  const handleCloseViewJobModel = () => {
    // Close View Job model
    setOpenViewJobModel(false);
    setSelectedJob(null);
  };

  // Open delete confirmation popup
  const openDeleteConfirmation = (jobId) => {
    setJobToDelete(jobId);
    setShowDeleteConfirmation(true);
  };

  // Close delete confirmation popup
  const closeDeleteConfirmation = () => {
    setJobToDelete(null);
    setShowDeleteConfirmation(false);
  };

  useEffect(() => {
    fetchJobPosts();
  }, []);

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-row gap-4 justify-between items-center">
          <div></div>
          <button
            onClick={handleOpenJobPostModel}
            className="flex h-[2rem] px-4 justify-center items-center rounded text-white bg-[#FF2722] text-base font-medium"
          >
            Post Job
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="w-full overflow-x-auto">
            <div className="xlg:min-w-[1000px] sm:min-w-[900px] flex flex-col">
              <div className="flex gap-4 sm:text-xs md:text-sm font-medium py-4 border-y border-[#CCCCCC] text-[#333333]">
                <div className="w-[15%]">Date & Time</div>
                <div className="w-[25%]">Job/Post Name</div>
                <div className="w-[20%]">Timing / Shift</div>
                <div className="w-[15%]">Location</div>
                <div className="w-[10%]">Status</div>
                <div className="w-[15%]">Actions</div>
              </div>
              {jobPosts.map((job) => (
                <div
                  key={job.jobpostId}
                  className="flex gap-4 sm:text-xs md:text-sm py-4"
                >
                  <div className="w-[15%]">
                    {new Date(job.createdAt).toLocaleString()}
                  </div>
                  <div className="w-[25%]">{job.jobPostName}</div>
                  <div className="w-[20%]">
                    {job.jobTags || "Not specified"}
                  </div>
                  <div className="w-[15%]">{job.jobLocation}</div>
                  <div className="w-[10%]">
                    <button
                      onClick={() =>
                        handleStatusToggle(job.jobpostId, job.active)
                      }
                      className={`w-fit px-4 py-1 rounded ${
                        job.active ? "bg-green-500" : "bg-red-500"
                      } text-white`}
                    >
                      {job.active ? "Active" : "Deactive"}
                    </button>
                  </div>
                  <div className="w-[15%] flex flex-row gap-4 text-lg">
                    <button
                      onClick={() => handleOpenViewJobModel(job)}
                      className="text-[#00D23B]"
                    >
                      <MdOutlineVisibility />
                    </button>
                    <button
                      onClick={() => handleOpenEditModel(job)}
                      className="text-[#004dd2]"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => openDeleteConfirmation(job.jobpostId)}
                      className="text-red-500"
                    >
                      <RiDeleteBin5Line />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex gap-4 justify-center items-center py-4">
            <button
              onClick={() => fetchJobPosts(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
            >
              Prev
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchJobPosts(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 h-screen w-[75%] xl:w-[60%] overflow-scroll no-scrollbar bg-[#EDF4F7] shadow-lg transform transition-transform duration-300 ease-in-out ${
          openJobpostModel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {openJobpostModel && <PostJob onClose={handleCloseJobPostModel} />}
      </div>

      {openEditModel && (
        <div
          className={`fixed top-0 right-0 h-screen w-[75%] xl:w-[60%] overflow-scroll no-scrollbar bg-[#EDF4F7] shadow-lg transform transition-transform duration-300 ease-in-out ${
            openEditModel ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <EditJobDetails
            jobData={selectedJob}
            onClose={handleCloseEditModel}
            onUpdate={fetchJobPosts}
          />
        </div>
      )}
      {openViewJobModel && (
        <div
          className={`fixed top-0 right-0 h-screen w-[75%] xl:w-[60%] overflow-scroll no-scrollbar bg-[#EDF4F7] shadow-lg transform transition-transform duration-300 ease-in-out ${
            openViewJobModel ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ViewJobDetails job={selectedJob} onClose={handleCloseViewJobModel} />
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded shadow-lg">
            <h3 className="text-lg font-semibold">
              Are you sure you want to delete this job post?
            </h3>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleDeleteJob(jobToDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={closeDeleteConfirmation}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardTemplate>
  );
};

export default Career;
