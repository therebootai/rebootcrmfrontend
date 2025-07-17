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
  const [data, setData] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  // const itemsPerPage = 20;

  useEffect(() => {
    if (businesses && businesses.length > 0) {
      const sortedData = [...businesses].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setData(sortedData);
    } else {
      setData([]);
    }
  }, [businesses]);

  const handleView = async (id) => {
    try {
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
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/business/get/${id}`
      );
      setSelectedBusiness(response.data);
      setEditModalIsOpen(true);
    } catch (error) {
      console.error("Error fetching business details", error);
    }
  };

  const handleEditSuccess = (updatedBusiness) => {
    setData((prevData) =>
      prevData.map((business) =>
        business.businessId === updatedBusiness.businessId
          ? { ...business, ...updatedBusiness }
          : business
      )
    );
    setEditModalIsOpen(false);
    setSelectedBusiness(null);
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
          businessToDelete.businessId
        }`
      );
      setData((prevData) =>
        prevData.filter(
          (business) => business.businessId !== businessToDelete.businessId
        )
      );
      setDeleteModalIsOpen(false);
      setBusinessToDelete(null);
    } catch (error) {
      console.error("Error deleting business", error);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
    setBusinessToDelete(null);
  };

  const formatFollowUpDate = (dateString) => {
    if (!dateString) {
      return "Null";
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

  // Memoized Pagination logic
  // const currentItems = useMemo(() => {
  //   const indexOfLastItem = currentPage * itemsPerPage;
  //   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  //   return data.slice(indexOfFirstItem, indexOfLastItem);
  // }, [data, currentPage]);

  // const totalPages = useMemo(
  //   () => Math.ceil(data.length / itemsPerPage),
  //   [data]
  // );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
            const pageNumber = startPage + i; // Calculate the correct page number
            return (
              <button
                key={pageNumber}
                className={`px-4 py-2 ${
                  currentPage === pageNumber
                    ? "text-[#D53F3A]"
                    : "text-[#777777]"
                } font-bold rounded`}
                onClick={() => handlePageChange(pageNumber)} // Pass the correct page number
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
                  {data.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
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
                      <div className="flex-1">{row.city}</div>
                      <div className="flex-1">{row.category}</div>
                      <div className="flex-1">{row.source}</div>
                      <div className="flex-1">
                        {row.status === "Visited"
                          ? `Visited (${row.visit_result.reason})`
                          : row.status}
                      </div>
                      <div className="flex flex-1 flex-row items-center gap-2">
                        <button
                          className="text-[#00D23B]"
                          onClick={() => handleView(row.businessId)}
                        >
                          <MdOutlineVisibility />
                        </button>
                        <button
                          className="text-[#5BC0DE]"
                          onClick={() => handleEdit(row.businessId)}
                        >
                          <FiEdit />
                        </button>
                        {showdelete && (
                          <button
                            className="text-[#D53F3A]"
                            onClick={() => handleDeleteClick(row)}
                          >
                            <RiDeleteBin5Line />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
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
            &times;
          </button>
          {selectedBusiness && (
            <div className="flex flex-col gap-2">
              <div className="text-xl font-semibold">
                {selectedBusiness.buisnessname}- {selectedBusiness.businessId}
              </div>
              <div>Contact Person: {selectedBusiness.contactpersonName}</div>
              <div>Mobile Number: {selectedBusiness.mobileNumber}</div>
              <div>City: {selectedBusiness.city}</div>
              <div>Category: {selectedBusiness.category}</div>
              <div>Source: {selectedBusiness.source}</div>
              <div className=" flex flex-row gap-2 items-center">
                Status: {selectedBusiness.status}{" "}
                <span>
                  {selectedBusiness.visit_result?.update_location ? (
                    <Link
                      to={`https://maps.google.com/?q=${selectedBusiness.visit_result.update_location.latitude},${selectedBusiness.visit_result.update_location.longitude}`}
                      target="_blank"
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
            </div>
          )}
        </Modal>

        {/* Edit Modal */}
        {selectedBusiness && (
          <EditBusiness
            isOpen={editModalIsOpen}
            onClose={() => setEditModalIsOpen(false)}
            business={selectedBusiness}
            onSuccess={handleEditSuccess}
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
                  onClick={confirmDelete}
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
