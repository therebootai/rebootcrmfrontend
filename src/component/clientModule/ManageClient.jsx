import { useState } from "react";
import { FiEdit } from "react-icons/fi";
import {
  MdDeleteForever,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdOutlineVisibility,
} from "react-icons/md";
import AddClient from "./AddClient";
import Modal from "react-modal";
import ViewClient from "./ViewClient";
import LoadingAnimation from "../LoadingAnimation";
import axios from "axios";

const ManageClient = ({
  allClient,
  currentPage,
  setCurrentPage,
  totalPages,
  fetchAllClients,
  fetchLoading,
}) => {
  const [editingClient, setEditingClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewClient, setViewClient] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleEditClick = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const handleViewClick = (client) => {
    setViewClient(client);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewClient(null);
  };
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (client) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${
        client.businessNameDoc?.buisnessname || "this client"
      }"?`
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/client/delete/${client.clientId}`
      );

      if (response.data.success) {
        fetchAllClients();
      } else {
        alert("Failed to delete the client.");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Something went wrong while deleting the client.");
    }
  };

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
    <div className="flex flex-col">
      <div className="flex flex-row gap-2 text-xs xl:text-xs font-medium items-center text-[#333333] p-2 xl:p-3 border-b border-t border-[#cccccc]">
        <div className="flex-1">Client Name</div>
        <div className="flex-1">Mobile Number</div>
        <div className="flex-1">Service Taken</div>
        <div className="flex-1">BDE Name</div>
        <div className="flex-1">TME Name</div>
        <div className="flex-1">Website</div>
        <div className="flex-1">Expire</div>

        <div className="flex-1">Deal Amount</div>
        <div className="flex-1">Cleared</div>
        <div className="flex-1">Total Value</div>
        <div className="flex-1">Action</div>
      </div>

      <div className="flex flex-col">
        {fetchLoading ? (
          <LoadingAnimation />
        ) : (
          <div className=" flex flex-col">
            {allClient && allClient.length > 0 ? (
              allClient.map((client, index) => (
                <div
                  key={index}
                  className="flex flex-row gap-2 text-xs   xl:text-xs p-2 xl:p-3 text-[#333333] border-b border-[#eeeeee]"
                >
                  <div className="flex-1 line-clamp-1">
                    {client.businessNameDoc.buisnessname || ""}
                  </div>
                  <div className="flex-1 line-clamp-1">
                    {client.businessNameDoc.mobileNumber || ""}
                  </div>
                  <div className="flex-1 line-clamp-1">
                    {client.serviceTaken || ""}
                  </div>
                  <div className="flex-1 line-clamp-1">
                    {" "}
                    {client.bdeName?.bdename}
                  </div>
                  <div className="flex-1 line-clamp-1">
                    {client.tmeLeads?.telecallername || ""}
                  </div>
                  <div className="flex-1 line-clamp-1  break-words break-all ">
                    {client.website || ""}
                  </div>
                  <div className="flex-1 line-clamp-1">
                    {" "}
                    {client.expiryDate
                      ? new Date(client.expiryDate).toLocaleDateString("en-GB")
                      : ""}
                  </div>

                  <div className="flex-1 line-clamp-1">{client.dealAmount}</div>
                  <div className="flex-1 line-clamp-1">
                    {Array.isArray(client.cleardAmount)
                      ? client.cleardAmount.reduce(
                          (sum, item) => sum + (item.amount || 0),
                          0
                        )
                      : ""}
                  </div>
                  <div className="flex-1 line-clamp-1  break-words break-all ">
                    {client.totalAmount || ""}
                  </div>
                  <div className="flex-1 flex gap-2 items-center text-base">
                    <button
                      onClick={() => handleViewClick(client)}
                      className="text-[#00D23B]"
                    >
                      <MdOutlineVisibility />
                    </button>
                    <button
                      onClick={() => handleEditClick(client)}
                      className="text-[#5BC0DE]"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(client)}
                      className="text-[#a92828]"
                    >
                      <MdDeleteForever />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No clients found In this Filter
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 pb-4 items-center mt-4 text-sm">
        <button
          className={`flex gap-1 text-center items-center ${
            currentPage === 1 ? "text-[#333333]" : "text-[#0A5BFF]"
          } font-medium rounded`}
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
                    ? "text-[#0A5BFF]"
                    : "text-[#333333]"
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
            currentPage === totalPages ? "text-[#333333]" : "text-[#0A5BFF]"
          } font-medium rounded`}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <div>Next</div>
          <div>
            <MdKeyboardDoubleArrowRight />
          </div>
        </button>
      </div>
      {showModal && (
        <Modal
          isOpen={showModal}
          onRequestClose={closeModal}
          contentLabel="Add Business Modal"
          className="modal-content no-scrollbar"
          overlayClassName="modal-overlay"
        >
          <button onClick={closeModal} className="close-button">
            &times;
          </button>
          <AddClient
            closeModal={closeModal}
            existingData={editingClient}
            fetchAllClients={fetchAllClients}
          />
        </Modal>
      )}

      {showViewModal && (
        <Modal
          isOpen={showViewModal}
          onRequestClose={closeViewModal}
          contentLabel="View Client Modal"
          className="modal-content no-scrollbar"
          overlayClassName="modal-overlay"
        >
          <button onClick={closeViewModal} className="close-button">
            &times;
          </button>
          <ViewClient
            viewClient={viewClient}
            setViewClient={setViewClient}
            fetchAllClients={fetchAllClients}
          />
        </Modal>
      )}
    </div>
  );
};

export default ManageClient;
