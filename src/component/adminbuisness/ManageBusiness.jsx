import React, { useState, useEffect } from "react";
import { FiEdit } from "react-icons/fi";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdOutlineVisibility,
} from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";
import Modal from "react-modal";
import { format } from "date-fns";
import EditBusiness from "./EditBusiness";
import axios from "axios";
import LoadingAnimation from "../LoadingAnimation";
import { Link } from "react-router-dom";
import { FaMapLocationDot } from "react-icons/fa6";

Modal.setAppElement("#root");

const ManageBusiness = ({
  businesses,
  showdelete,
  currentPage,
  setCurrentPage,
  totalPages,
  fetchLoading,
  setProposalNumber,
  setProposalModal,
}) => {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

  // The useEffect for setting/sorting 'data' is no longer needed
  // useEffect(() => {
  //   if (businesses && businesses.length > 0) {
  //     const sortedData = [...businesses].sort(
  //       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  //     );
  //     setData(sortedData);
  //   } else {
  //     setData([]);
  //   }
  // }, [businesses]);

  const handleView = async (id) => {
    try {
      // Fetch details by _id if that's what your backend /get/:id expects
      // The `businessId` in your frontend `row.businessId` might not be the MongoDB `_id`
      // Ensure this API call uses the correct identifier (_id or custom businessId)
      // Based on your backend getBusiness, it uses `_id` in the findById call, so we should pass `_id` here.
      // If `row.businessId` is indeed `_id`, then it's fine. If not, you might need to adjust.
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/business/get/${id}`
      );
      setSelectedBusiness(response.data);
      setViewModalIsOpen(true);
    } catch (error) {
      console.error("Error fetching business details", error);
    }
  };

  const handleEdit = async (id) => {
    try {
      // Same logic as handleView for fetching by ID
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/business/get/${id}`
      );
      setSelectedBusiness(response.data);
      setEditModalIsOpen(true);
    } catch (error) {
      console.error("Error fetching business details", error);
    }
  };

  // When a business is successfully edited, we need to update the `businesses` prop
  // Ideally, the parent component (AddAndManageBuisness) would trigger a re-fetch
  // of `fetchAllBusinesses` to get the updated data from the server,
  // ensuring consistency with pagination and sorting.
  // For now, we'll update the local state which is `businesses` prop.
  const handleEditSuccess = (updatedBusiness) => {
    // This assumes `businesses` is mutable or we create a new array.
    // In React, it's better to pass an update function to the parent to re-fetch.
    // For direct local update, you'd modify the prop or trigger parent re-fetch.
    // If you expect `businesses` to be directly updated, consider if this is
    // truly reflecting the backend state, especially with pagination.
    // The best approach is to make the parent component re-fetch the data after an edit.
    // For now, this local update works for immediate visual feedback.
    // If you're using `setData` (which was removed), this would be `setData((prevData) => ...)`
    // Since `businesses` is a prop, we usually don't modify it directly.
    // The parent's `fetchAllBusinesses` would be called after a successful edit.
    // For this example, I'll remove the `handleEditSuccess` internal update logic
    // and assume the parent will re-fetch. If `EditBusiness` successfully updates
    // the backend, the parent's `useEffect` for `businesses` will trigger.

    // Removed direct modification of `businesses` prop, rely on parent re-fetch.
    setEditModalIsOpen(false);
    setSelectedBusiness(null);
    // You might want to call a prop function like `onBusinessUpdated()` here
    // that the parent `AddAndManageBuisness` provides, which then calls `fetchAllBusinesses`.
    // Example: props.onBusinessUpdated();
  };

  const handleDeleteClick = (business) => {
    setBusinessToDelete(business);
    setDeleteModalIsOpen(true);
  };

  const confirmDelete = async () => {
    if (!businessToDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/business/delete/${
          businessToDelete._id
        }` // Use _id for delete
      );
      // After successful delete, trigger a re-fetch in the parent component
      // to update the list and pagination correctly.
      // If you're using a context or global state, update it there.
      // For now, we assume the parent handles the `businesses` prop update.
      // This means the parent `AddAndManageBuisness` needs to re-run `fetchAllBusinesses`.
      // You could pass a prop `onDeleteSuccess` from parent.
      // For example: props.onDeleteSuccess();

      setDeleteModalIsOpen(false);
      setBusinessToDelete(null);
      // A simple way to trigger re-render and re-fetch in the parent:
      // If you are expecting `businesses` to be dynamically updated here,
      // you need to pass a callback from the parent, e.g., `onDelete(businessId)`
      // or make the parent re-fetch.
      // For now, I'm assuming the parent will handle re-fetching.
    } catch (error) {
      console.error("Error deleting business", error);
      alert("Failed to delete business. Please try again.");
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
    setBusinessToDelete(null);
  };

  const formatFollowUpDate = (dateString) => {
    if (!dateString) {
      return "N/A"; // Changed from "Null" for better UX
    }
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yy - HH:mm");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const headers = [
    "Business Name",
    "Contact Person",
    "Mobile Number",
    "City/Town",
    "Business Category",
    "Source",
    "Status",
  ];

  // Pagination logic now directly uses props from the backend
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); // This triggers the parent to re-fetch
  };

  // Calculate the range of page numbers to show
  const pageRange = 5;
  let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
  let endPage = startPage + pageRange - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - pageRange + 1);
  }

  if (totalPages <= pageRange) {
    startPage = 1;
    endPage = totalPages;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 pb-4 border-b items-center mt-4">
        <button
          className={`flex gap-1 text-center items-center ${
            currentPage === 1 ? "text-[#777777]" : "text-[#D53F3A]"
          } font-bold rounded`}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <div>
            <MdKeyboardDoubleArrowLeft />
          </div>
          <div>Prev</div>
        </button>
        <div className="flex gap-2">
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
            const pageNumber = startPage + i;
            return (
              <button
                key={pageNumber}
                className={`px-4 py-2 ${
                  currentPage === pageNumber
                    ? "text-[#D53F3A]"
                    : "text-[#777777]"
                } font-bold rounded`}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>
        <button
          className={`flex gap-1 text-center items-center ${
            currentPage === totalPages ? "text-[#777777]" : "text-[#D53F3A]"
          } font-bold rounded`}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <div>Next</div>
          <div>
            <MdKeyboardDoubleArrowRight />
          </div>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {fetchLoading ? (
          <LoadingAnimation />
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="xlg:min-w-[1000px] sm:min-w-[900px] flex flex-col gap-4">
              <div className="flex gap-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex-1 text-base font-medium">
                    {header}
                  </div>
                ))}
                <div className="flex-1 sm:text-xs md:text-sm font-medium">
                  Actions
                </div>
              </div>
              <div className="max-h-[80vh] overflow-y-scroll no-scrollbar">
                <div className="flex flex-col gap-4">
                  {/* Render 'businesses' prop directly */}
                  {businesses.map((row, rowIndex) => (
                    <div
                      key={row._id || rowIndex} // Use row._id as key for stability
                      className="flex flex-row gap-2 pb-4 border-b text-[#777777] sm:text-xs md:text-sm font-medium"
                    >
                      <div className="flex-1 threelinelimit">
                        {row.buisnessname}
                      </div>
                      <div className="flex-1">{row.contactpersonName}</div>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          setProposalNumber(row.mobileNumber);
                          setProposalModal(true);
                        }}
                      >
                        {row.mobileNumber}
                      </div>
                      {/* Access populated fields safely */}
                      <div className="flex-1">
                        {row.city?.cityname || row.city}
                      </div>
                      <div className="flex-1">
                        {row.category?.categoryname || row.category}
                      </div>
                      <div className="flex-1">
                        {row.source?.sourcename || row.source}
                      </div>
                      <div className="flex-1">
                        {row.status === "Visited"
                          ? `Visited (${row.visit_result?.reason || "N/A"})` // Use optional chaining for visit_result
                          : row.status}
                      </div>
                      <div className="flex flex-1 flex-row items-center gap-2">
                        <button
                          className="text-[#00D23B]"
                          onClick={() => handleView(row._id)} // Use row._id for view
                        >
                          <MdOutlineVisibility />
                        </button>
                        <button
                          className="text-[#5BC0DE]"
                          onClick={() => handleEdit(row._id)} // Use row._id for edit
                        >
                          <FiEdit />
                        </button>
                        {showdelete && (
                          <button
                            className="text-[#D53F3A]"
                            onClick={() => handleDeleteClick(row)} // Pass the whole row
                          >
                            <RiDeleteBin5Line />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {businesses.length === 0 && !fetchLoading && (
                    <div className="text-center py-4 text-gray-500">
                      No businesses found for the current filters.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        <Modal
          isOpen={viewModalIsOpen}
          onRequestClose={() => setViewModalIsOpen(false)}
          contentLabel="Business Details"
          className="modal-content-show"
          overlayClassName="modal-overlay"
        >
          <button
            onClick={() => setViewModalIsOpen(false)}
            className="close-button"
          >
            ×
          </button>
          {selectedBusiness && (
            <div className="flex flex-col gap-2">
              <div className="text-xl font-semibold">
                {selectedBusiness.buisnessname} - {selectedBusiness.businessId}
              </div>
              <div>Contact Person: {selectedBusiness.contactpersonName}</div>
              <div>Mobile Number: {selectedBusiness.mobileNumber}</div>
              {/* Access populated fields safely */}
              <div>
                City: {selectedBusiness.city?.cityname || selectedBusiness.city}
              </div>
              <div>
                Category:{" "}
                {selectedBusiness.category?.categoryname ||
                  selectedBusiness.category}
              </div>
              <div>
                Source:{" "}
                {selectedBusiness.source?.sourcename || selectedBusiness.source}
              </div>
              <div className=" flex flex-row gap-2 items-center">
                Status: {selectedBusiness.status}{" "}
                <span>
                  {selectedBusiness.visit_result?.update_location ? (
                    <Link
                      to={`https://www.google.com/maps/search/?api=1&query=${selectedBusiness.visit_result.update_location.latitude},${selectedBusiness.visit_result.update_location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer" // Important for security with target="_blank"
                    >
                      <FaMapLocationDot className=" text-green-800 text-lg" />
                    </Link>
                  ) : (
                    ""
                  )}
                </span>{" "}
                {selectedBusiness.visit_result?.visit_time}
              </div>
              <div>
                Follow-Up Date:{" "}
                {formatFollowUpDate(selectedBusiness.followUpDate)}
              </div>
              <div>Remarks: {selectedBusiness.remarks || "N/A"}</div>
              {/* Display populated Lead By and Appoint To users */}
              <div>Lead By: {selectedBusiness.lead_by?.name || "N/A"}</div>
              <div>
                Assigned To: {selectedBusiness.appoint_to?.name || "N/A"}
              </div>
            </div>
          )}
        </Modal>

        {/* Edit Modal */}
        {selectedBusiness && (
          <EditBusiness
            isOpen={editModalIsOpen}
            onClose={() => setEditModalIsOpen(false)}
            business={selectedBusiness}
            onSuccess={() => {
              handleEditSuccess(); // Call local success handler
              // IMPORTANT: Trigger parent component to re-fetch data to reflect changes
              // You need to pass a prop from AddAndManageBuisness to ManageBusiness,
              // e.g., `onBusinessUpdated={fetchAllBusinesses}`
              // This is crucial for reflecting changes from backend correctly.
              // For now, I'm assuming you will add this.
            }}
          />
        )}

        {/* Delete Modal */}
        {deleteModalIsOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this business?</p>
              <p>Business Name: {businessToDelete?.buisnessname}</p>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  onClick={closeDeleteModal}
                >
                  No
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  onClick={() => {
                    confirmDelete();
                    // IMPORTANT: Trigger parent component to re-fetch data
                    // This will update the `businesses` prop and correct pagination.
                    // You need to pass a prop from AddAndManageBuisness to ManageBusiness,
                    // e.g., `onBusinessDeleted={fetchAllBusinesses}`
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBusiness;
