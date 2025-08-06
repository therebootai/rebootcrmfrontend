import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit } from "react-icons/fi";
import { MdOutlineVisibility } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";
import Modal from "react-modal";
import EditCandidte from "./EditCandidte";
import { Link } from "react-router-dom";
import SendSingleProposal from "./SendSingleProposal";

Modal.setAppElement("#root"); // Set the root element for accessibility

const ManageCandidate = ({ candidates }) => {
  const [data, setData] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [proposalModal, setProposalModal] = useState(false);
  const [proposalNumber, setProposalNumber] = useState(null);

  const closeModal = () => {
    setViewModalIsOpen(false);
    setEditModalIsOpen(false);
    setDeleteModalIsOpen(false);
  };

  const handleUpdatedCandidate = (updatedCandidate) => {
    setData((prevCandidates) => {
      return prevCandidates.map((candidate) =>
        candidate.candidateId === updatedCandidate.candidateId
          ? updatedCandidate
          : candidate
      );
    });
    closeModal();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/candidate/get`
        );
        setData(
          response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      } catch (error) {
        console.error("Error fetching candidate data", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setData(
      candidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  }, [candidates]);

  const handleView = async (candidateId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/candidate/get/${candidateId}`
      );
      setSelectedCandidate(response.data);
      setViewModalIsOpen(true);
    } catch (error) {
      console.error("Error fetching candidate details", error);
    }
  };

  const handleEdit = async (candidateId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/candidate/get/${candidateId}`
      );
      setSelectedCandidate(response.data);
      setEditModalIsOpen(true);
    } catch (error) {
      console.error("Error fetching candidate details", error);
    }
  };

  const handleDeleteClick = (candidate) => {
    setCandidateToDelete(candidate);
    setDeleteModalIsOpen(true);
  };

  const confirmDelete = async () => {
    if (!candidateToDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/candidate/delete/${
          candidateToDelete.candidateId
        }`
      );
      setData((prevData) =>
        prevData.filter(
          (candidate) => candidate.candidateId !== candidateToDelete.candidateId
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error deleting candidate", error);
    }
  };

  const headers = [
    "Name",
    "Mobile Number",
    "City/Town",
    "Interested Position",
    "Experience",
    "Remarks",
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {headers.map((header, index) => (
          <div key={index} className="flex-1 text-base font-medium">
            {header}
          </div>
        ))}
        <div className="flex-1 text-sm font-medium">Actions</div>
      </div>
      <div className="flex flex-col gap-4">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-row gap-2 text-[#777777] text-sm font-medium"
          >
            <div className="flex-1">{row.candidatename}</div>
            <div
              className="flex-1 cursor-pointer"
              onClick={() => {
                setProposalModal(true);
                setProposalNumber(row.mobileNumber);
              }}
            >
              {row.mobileNumber}
            </div>
            <div className="flex-1">{row.city}</div>
            <div className="flex-1">{row.interestPost}</div>
            <div className="flex-1">{row.experience}</div>
            <div className="flex-1">{row.remarks ?? "-"}</div>
            <div className="flex flex-1 flex-row items-center gap-2">
              <button
                className="text-[#00D23B]"
                onClick={() => handleView(row.candidateId)}
              >
                <MdOutlineVisibility />
              </button>
              <button
                className="text-[#5BC0DE]"
                onClick={() => handleEdit(row.candidateId)}
              >
                <FiEdit />
              </button>
              <button
                className="text-[#D53F3A]"
                onClick={() => handleDeleteClick(row)}
              >
                <RiDeleteBin5Line />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      <Modal
        isOpen={viewModalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Candidate Details"
        className="modal-content-show"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        {selectedCandidate && (
          <div className="flex flex-col gap-2">
            <p>
              <strong>Candidate Id:</strong> {selectedCandidate.candidateId}
            </p>
            <p>
              <strong>Name:</strong> {selectedCandidate.candidatename}
            </p>
            <p>
              <strong>Mobile Number:</strong> {selectedCandidate.mobileNumber}
            </p>
            <p>
              <strong>Alternative Mobile Number:</strong>{" "}
              {selectedCandidate.altMobileNumber}
            </p>
            <p>
              <strong>City/Town:</strong> {selectedCandidate.city}
            </p>
            <p>
              <strong>Interested Post:</strong> {selectedCandidate.interestPost}
            </p>
            <p>
              <strong>Last Qualification:</strong>{" "}
              {selectedCandidate.lastQualification}
            </p>
            <p>
              <strong>Experience:</strong> {selectedCandidate.experience}
            </p>

            <p>
              <strong>Remarks:</strong> {selectedCandidate.remarks}
            </p>
            <p>
              <strong>CV:</strong>{" "}
              {selectedCandidate.cv ? (
                <Link
                  to={selectedCandidate.cv.secure_url}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View CV
                </Link>
              ) : (
                "Not Uploaded"
              )}
            </p>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Candidate"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        {selectedCandidate && (
          <EditCandidte
            candidateId={selectedCandidate.candidateId}
            onClose={closeModal}
            onAddCandidates={handleUpdatedCandidate}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteModalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this candidate?</p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={closeModal}
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
      <Modal
        isOpen={proposalModal}
        onRequestClose={() => setProposalModal(false)}
        contentLabel="Send Proposal Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button
          onClick={() => setProposalModal(false)}
          className="close-button"
        >
          &times;
        </button>
        <SendSingleProposal phoneNumber={proposalNumber} />
      </Modal>
    </div>
  );
};

export default ManageCandidate;
