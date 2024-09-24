import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaFilePdf, FaRegFilePdf } from "react-icons/fa";

const WhatsAppTemplateImageUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Adjust files per page based on screen size
  const filesPerPage =
    window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
  const totalPages = Math.ceil(uploadedFiles.length / (filesPerPage * 4));

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/waimage/get`
      );
      setUploadedFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(
      (file) =>
        file.type.startsWith("image/") || file.type === "application/pdf"
    );

    if (validFiles.length !== selectedFiles.length) {
      setError(
        "Invalid file type selected. Please choose images or PDFs only."
      );
    } else {
      setError(""); // Clear any previous errors
    }

    setFiles(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (files.length === 0) {
      setError("Please select at least one file to upload.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("documents", file);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/waimage/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setMessage(response.data.message);
        setUploadedFiles([...uploadedFiles, ...response.data.savedFiles]);
        setFiles([]); // Clear file input after successful upload
      } else {
        setError(response.data.error || "Failed to upload files");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setError(error.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/waimage/delete/${
          fileToDelete.waimageId
        }`
      );
      if (response.status === 200) {
        setUploadedFiles((prevFiles) =>
          prevFiles.filter((file) => file.waimageId !== fileToDelete.waimageId)
        );
        setShowModal(false);
        setFileToDelete(null);
      } else {
        console.error("Failed to delete file:", response.data.error);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setFileToDelete(null);
  };

  const getPaginatedFiles = () => {
    const startIndex = (currentPage - 1) * filesPerPage * 4;
    return uploadedFiles.slice(startIndex, startIndex + filesPerPage * 4);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedFiles = getPaginatedFiles();

  return (
    <AdminDashboardTemplate>
      <div className="p-4 flex flex-col gap-6 ">
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-2 py-4"
        >
          <label className="text-lg text-black">Upload Files</label>
          <div className="w-full flex items-center gap-4">
            <input
              type="file"
              multiple
              onChange={handleFilesChange}
              className="xl:w-[40%] lg:w-[50%] sm:w-[60%] h-[3.5rem] p-2 focus:outline-none outline-[#191919] bg-[white] text-black rounded-sm border border-[#CCCCCC]"
              accept="image/*,application/pdf"
            />
            <button
              type="submit"
              disabled={loading}
              className="xl:w-[15%] lg:w-[25%] sm:w-[30%] h-[3.5rem] bg-[#FF27221A] rounded-sm text-lg text-[#FF2722] font-medium flex justify-center items-center"
            >
              {loading ? "Uploading..." : "Submit"}
            </button>
          </div>
          {error && <p className="text-red-600">{error}</p>}{" "}
          {/* Display error */}
          {message && <p className="text-black">{message}</p>}
        </form>

        <div className="flex lg:flex-row sm:flex-col sm:gap-4 lg:gap-0 justify-between items-center">
          <h2 className="text-xl font-bold">Manage Files</h2>
          <div className="flex gap-4">
            <button
              className={`text-lg ${
                currentPage === 1
                  ? "text-[#777777] font-semibold"
                  : "text-[#D53F3A] font-bold"
              }`}
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageClick(index + 1)}
                className={`text-lg font-semibold ${
                  currentPage === index + 1
                    ? "text-[#D53F3A]"
                    : "text-[#777777]"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              className={`text-lg ${
                currentPage === totalPages
                  ? "text-[#777777] font-semibold"
                  : "text-[#D53F3A] font-bold"
              }`}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        <div
          className={`grid ${
            filesPerPage === 3
              ? "grid-cols-3"
              : filesPerPage === 2
              ? "grid-cols-2"
              : "grid-cols-1"
          } gap-4`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-row p-4 gap-4 font-medium text-base w-full border-b">
              <div className="w-[70%]">File</div>
              <div className="w-[30%]">Action</div>
            </div>
            <div className="flex flex-col no-scrollbar bg-white overflow-auto">
              {paginatedFiles.map((file) => {
                // Use the original filename if available
                const fileName = `${file.waimagename.secure_url}.pdf`;
                const secureUrlWithExtension = `${file.waimagename.secure_url}.pdf`;

                return (
                  <div
                    className="flex flex-row p-4 gap-4 font-medium text-base w-full"
                    key={file.waimageId}
                  >
                    <>
                      <div className="xl:text-sm md:text-xs sm:text-sm font-semibold w-[70%] flex items-center gap-2">
                        {file.waimagename.secure_url.endsWith(".pdf") ||
                        file.waimagename.secure_url.includes("/raw/") ? (
                          <a
                            href={`${file.waimagename.secure_url}?download=true`} // This can trigger a download in some cases
                            download={true} // Force download
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaFilePdf className="text-red-500" />
                            <span>{file.waimagename.original_filename}</span>
                          </a>
                        ) : (
                          <img
                            src={file.waimagename.secure_url}
                            alt={file.waimageId}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </div>
                      <div className="flex flex-row w-[30%] items-center font-semibold gap-5">
                        <button
                          className="text-[#D53F3A]"
                          onClick={() => handleDeleteClick(file)}
                        >
                          <RiDeleteBin5Line />
                        </button>
                      </div>
                    </>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this file?</p>
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
    </AdminDashboardTemplate>
  );
};

export default WhatsAppTemplateImageUpload;
