import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../../template/AdminDashboardTemplate";
import { MdOutlineVisibility } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";
import ViewApplication from "./ViewApplication";

const AllApplication = () => {
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [limit] = useState(10); // Limit per page
  const [visiblePages, setVisiblePages] = useState([]); // For visible page numbers
  const maxVisiblePages = 5; // Show only 5 pages at a time

  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [openViewApplicationModel, setOpenViewApplicationModel] =
    useState(false);
  const [selectedApllication, setSelectedApplication] = useState(null);

  const fetchApplications = async (page) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/applications/get`,
        {
          params: {
            page,
            limit,
          },
        }
      );

      const data = response.data;

      setApplications(data.applications);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);

      // Set visible page numbers
      const pages = [];
      const startPage = Math.max(
        Math.min(
          page - Math.floor(maxVisiblePages / 2),
          totalPages - maxVisiblePages + 1
        ),
        1
      );
      const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      setVisiblePages(pages);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openDeleteConfirmation = (applicationId) => {
    setApplicationToDelete(applicationId);
    setDeletePopupVisible(true);
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    try {
      await axios.delete(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/applications/delete/${applicationToDelete}`
      );

      // Refetch applications after successful delete
      fetchApplications(currentPage);
      setDeletePopupVisible(false);
      setApplicationToDelete(null);
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const closeDeletePopup = () => {
    setDeletePopupVisible(false);
    setApplicationToDelete(null);
  };

  const handleOpenViewApplicationModel = (application) => {
    setSelectedApplication(application);
    setOpenViewApplicationModel(true);
  };

  const handleCloseViewApplicationModel = () => {
    setOpenViewApplicationModel(false);
    setSelectedApplication(null);
  };

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            All Applications
          </h1>
          <div className="w-full overflow-x-auto">
            <div className="xlg:min-w-[1000px] sm:min-w-[900px] flex flex-col">
              <div className="flex gap-4 sm:text-xs md:text-sm font-medium py-4 border-y border-[#CCCCCC] text-[#333333]">
                <div className="w-[10%]">Date</div>
                <div className="w-[20%]">Name</div>
                <div className="w-[20%]">Mobile Number</div>
                <div className="w-[15%]">Post Name</div>
                <div className="w-[10%]">Experience</div>
                <div className="w-[10%]">Location</div>
                <div className="w-[15%]">Actions</div>
              </div>

              {/* Application List */}
              {isLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.applicationId}
                    className="flex gap-4 sm:text-xs md:text-sm py-4 border-b border-[#CCCCCC] text-[#333333]"
                  >
                    <div className="w-[10%]">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                    <div className="w-[20%]">{app.name}</div>
                    <div className="w-[20%]">{app.mobileNumber}</div>
                    <div className="w-[15%]">{app.jobPostName}</div>
                    <div className="w-[10%]">{app.totalExperience}</div>
                    <div className="w-[10%]">{app.location}</div>
                    <div className="w-[15%] flex flex-row gap-2 items-center text-lg ">
                      <a
                        href={app.uploadCV.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline text-base"
                      >
                        View CV
                      </a>
                      <button
                        onClick={() => handleOpenViewApplicationModel(app)}
                        className="text-[#00D23B]"
                      >
                        <MdOutlineVisibility />
                      </button>
                      <button
                        onClick={() =>
                          openDeleteConfirmation(app.applicationId)
                        }
                        className="text-red-500"
                      >
                        <RiDeleteBin5Line />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              className={`px-4 py-2 bg-gray-200 text-gray-600 rounded ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {visiblePages.map((page) => (
              <button
                key={page}
                className={`px-4 py-2 rounded ${
                  page === currentPage
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button
              className={`px-4 py-2 bg-gray-200 text-gray-600 rounded ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {openViewApplicationModel && (
        <div
          className={`fixed top-0 right-0 h-screen w-[75%] xl:w-[60%] overflow-scroll no-scrollbar bg-[#EDF4F7] shadow-lg transform transition-transform duration-300 ease-in-out ${
            openViewApplicationModel ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ViewApplication
            application={selectedApllication}
            onClose={handleCloseViewApplicationModel}
          />
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deletePopupVisible && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">
              Are you sure you want to delete this application?
            </h2>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleDeleteApplication}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Yes
              </button>
              <button
                onClick={closeDeletePopup}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardTemplate>
  );
};

export default AllApplication;
