import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";

const ManageCityAndTown = ({ cities, setCities }) => {
  const [loading, setLoading] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [editedCityName, setEditedCityName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [animationDirection, setAnimationDirection] = useState(""); // For slide animation

  // Adjust tables per page based on screen size
  const citiesPerPage =
    window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
  const totalPages = Math.ceil(cities.length / (citiesPerPage * 15));

  useEffect(() => {
    const handleResize = () => {
      setCurrentPage(1); // Reset to first page on resize
      setAnimationDirection(""); // Reset animation on resize
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleEditClick = (city) => {
    setEditingCity(city);
    setEditedCityName(city.cityname);
  };

  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/city/update/${
          editingCity.cityId
        }`,
        {
          cityname: editedCityName,
        }
      );

      if (response.status === 200) {
        setCities((prevCities) =>
          prevCities.map((city) =>
            city.cityId === editingCity.cityId
              ? { ...city, cityname: editedCityName }
              : city
          )
        );
        setEditingCity(null);
        setEditedCityName("");
      } else {
        console.error("Failed to update city:", response.data.error);
      }
    } catch (error) {
      console.error("Error updating city:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setEditingCity(null);
    setEditedCityName("");
  };

  const handleDeleteClick = (city) => {
    setCityToDelete(city);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!cityToDelete) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/city/delete/${
          cityToDelete.cityId
        }`
      );
      if (response.status === 200) {
        setCities((prevCities) =>
          prevCities.filter((city) => city.cityId !== cityToDelete.cityId)
        );
        setShowModal(false);
        setCityToDelete(null);
      } else {
        console.error("Failed to delete city:", response.data.error);
      }
    } catch (error) {
      console.error("Error deleting city:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setCityToDelete(null);
  };

  const getPaginatedCities = () => {
    const startIndex = (currentPage - 1) * citiesPerPage * 15;
    return cities.slice(startIndex, startIndex + citiesPerPage * 15);
  };

  const handlePageClick = (pageNumber) => {
    setAnimationDirection(
      pageNumber > currentPage ? "slide-left" : "slide-right"
    );
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setAnimationDirection("slide-left");
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setAnimationDirection("slide-right");
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedCities = getPaginatedCities();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex lg:flex-row sm:flex-col sm:gap-4 lg:gap-0 justify-between items-center">
        <h2 className="text-xl font-bold">Manage Categories</h2>
        <div className="flex gap-4">
          <button
            className={`text-lg  ${
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
              className={` text-lg font-semibold ${
                currentPage === index + 1 ? "text-[#D53F3A]" : "text-[#777777]"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            className={` text-lg ${
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
          citiesPerPage === 3
            ? "grid-cols-3"
            : citiesPerPage === 2
            ? "grid-cols-2"
            : "grid-cols-1"
        } gap-4 ${animationDirection}`}
      >
        {Array.from({ length: citiesPerPage }).map((_, tableIndex) => (
          <div key={tableIndex} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row p-4 gap-4 font-medium text-base w-full border-b">
                <div className="w-[70%]">City/Town Name</div>
                <div className="w-[30%]">Action</div>
              </div>
              <div className="flex flex-col no-scrollbar bg-white overflow-auto">
                {paginatedCities
                  .slice(tableIndex * 15, (tableIndex + 1) * 15)
                  .map((city) => (
                    <div
                      className="flex flex-row p-4 gap-4 font-medium text-base w-full"
                      key={city.cityId}
                    >
                      {editingCity && editingCity.cityId === city.cityId ? (
                        <>
                          <div className="w-[70%]">
                            <input
                              type="text"
                              value={editedCityName}
                              onChange={(e) =>
                                setEditedCityName(e.target.value)
                              }
                              className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#5BC0DE] bg-[white] border text-[#FF2722] rounded-sm"
                            />
                          </div>
                          <div className="flex flex-row items-center w-[30%] font-semibold gap-5">
                            <button
                              className="text-[#5BC0DE]"
                              disabled={loading}
                              onClick={handleSaveClick}
                            >
                              {loading ? "Saving..." : <FaCheck />}
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
                          <div className="text-sm font-semibold w-[70%]">
                            {city.cityname}
                          </div>
                          <div className="flex flex-row w-[30%] items-center font-semibold gap-5">
                            <button
                              className="text-[#5BC0DE]"
                              onClick={() => handleEditClick(city)}
                            >
                              <FiEdit />
                            </button>
                            <button
                              className="text-[#D53F3A]"
                              onClick={() => handleDeleteClick(city)}
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
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this city?</p>
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

export default ManageCityAndTown;
