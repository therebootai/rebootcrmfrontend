import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";

const ManageSource = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [editedSourceName, setEditedSourceName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState(null);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/source/get`
      );
      setSources(response.data);
    } catch (error) {
      console.error("Error fetching sources:", error);
    }
  };

  const handleEditClick = (source) => {
    setEditingSource(source);
    setEditedSourceName(source.sourcename);
  };

  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/source/update/${
          editingSource.sourceId
        }`,
        {
          sourcename: editedSourceName,
        }
      );

      if (response.status === 200) {
        fetchSources();
        setEditingSource(null);
        setEditedSourceName("");
      }
    } catch (error) {
      console.error("Error updating source:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setEditingSource(null);
    setEditedSourceName("");
  };

  const handleDeleteClick = (source) => {
    setSourceToDelete(source);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!sourceToDelete) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/source/delete/${
          sourceToDelete.sourceId
        }`
      );
      if (response.status === 200) {
        fetchSources();
        setShowModal(false);
        setSourceToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting source:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setSourceToDelete(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="lg:w-[90%] sm:w-full">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row p-4 gap-4 font-medium text-base w-full border-b">
            <div className="w-[20%]">Source Name</div>
            <div className="w-[20%]">Actions</div>
          </div>
          <div className="flex flex-col h-screen no-scrollbar bg-white overflow-auto">
            {sources.map((source) => (
              <div
                className="flex flex-row p-4 gap-4 font-medium text-base w-full"
                key={source.sourceId}
              >
                {editingSource && editingSource.sourceId === source.sourceId ? (
                  <>
                    <div className="w-[20%]">
                      <input
                        type="text"
                        value={editedSourceName}
                        onChange={(e) => setEditedSourceName(e.target.value)}
                        className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#5BC0DE] bg-[white] border  text-[#FF2722] rounded-sm"
                      />
                    </div>
                    <div className="flex flex-row items-center w-[20%] font-semibold gap-5">
                      <button
                        className="text-[#5BC0DE]"
                        disabled={loading}
                        onClick={handleSaveClick}
                      >
                        {loading ? "Uploading..." : <FaCheck />}
                      </button>
                      <button
                        className="text-[#D53F3A]"
                        onClick={handleCancelClick}
                      >
                        <RxCross2 />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold w-[20%]">
                      {source.sourcename}
                    </div>
                    <div className="flex flex-row w-[20%] items-center font-semibold gap-5">
                      <button
                        className="text-[#5BC0DE]"
                        onClick={() => handleEditClick(source)}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="text-[#D53F3A]"
                        onClick={() => handleDeleteClick(source)}
                      >
                        <RiDeleteBin5Line />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this source?</p>
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
  );
};

export default ManageSource;
