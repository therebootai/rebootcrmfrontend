import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";

const ManageCategory = ({ categories, setCategories }) => {
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [animationDirection, setAnimationDirection] = useState(""); // For slide animation

  // Adjust tables per page based on screen size
  const categoriesPerPage =
    window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
  const totalPages = Math.ceil(categories.length / (categoriesPerPage * 15));

  useEffect(() => {
    const handleResize = () => {
      const newCategoriesPerPage =
        window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
      setCurrentPage(1); // Reset to first page on resize
      setAnimationDirection(""); // Reset animation on resize
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setEditedCategoryName(category.categoryname);
  };

  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/category/update/${
          editingCategory.categoryId
        }`,
        {
          categoryname: editedCategoryName,
        }
      );

      if (response.status === 200) {
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category.categoryId === editingCategory.categoryId
              ? { ...category, categoryname: editedCategoryName }
              : category
          )
        );
        setEditingCategory(null);
        setEditedCategoryName("");
      } else {
        console.error("Failed to update category:", response.data.error);
      }
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setEditingCategory(null);
    setEditedCategoryName("");
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/category/delete/${
          categoryToDelete.categoryId
        }`
      );
      if (response.status === 200) {
        setCategories((prevCategories) =>
          prevCategories.filter(
            (category) => category.categoryId !== categoryToDelete.categoryId
          )
        );
        setShowModal(false);
        setCategoryToDelete(null);
      } else {
        console.error("Failed to delete category:", response.data.error);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setCategoryToDelete(null);
  };

  const getPaginatedCategories = () => {
    const startIndex = (currentPage - 1) * categoriesPerPage * 15;
    return categories.slice(startIndex, startIndex + categoriesPerPage * 15);
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

  const paginatedCategories = getPaginatedCategories();

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
          categoriesPerPage === 3
            ? "grid-cols-3"
            : categoriesPerPage === 2
            ? "grid-cols-2"
            : "grid-cols-1"
        } gap-4 ${animationDirection}`}
      >
        {Array.from({ length: categoriesPerPage }).map((_, tableIndex) => (
          <div
            key={tableIndex}
            className="bg-white shadow-md rounded-lg sm:p-2 xl:p-4"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-row p-4 gap-4 font-medium text-base w-full border-b">
                <div className="w-[70%]">Category Name</div>
                <div className="w-[30%]">Action</div>
              </div>
              <div className="flex flex-col no-scrollbar bg-white overflow-auto">
                {paginatedCategories
                  .slice(tableIndex * 15, (tableIndex + 1) * 15)
                  .map((category) => (
                    <div
                      className="flex flex-row p-4 gap-4 font-medium text-base w-full"
                      key={category.categoryId}
                    >
                      {editingCategory &&
                      editingCategory.categoryId === category.categoryId ? (
                        <>
                          <div className="w-[70%]">
                            <input
                              type="text"
                              value={editedCategoryName}
                              onChange={(e) =>
                                setEditedCategoryName(e.target.value)
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
                          <div className="xl:text-sm md:text-xs sm:text-sm font-semibold w-[70%]">
                            {category.categoryname}
                          </div>
                          <div className="flex flex-row w-[30%] items-center font-semibold gap-5">
                            <button
                              className="text-[#5BC0DE]"
                              onClick={() => handleEditClick(category)}
                            >
                              <FiEdit />
                            </button>
                            <button
                              className="text-[#D53F3A]"
                              onClick={() => handleDeleteClick(category)}
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
            <p>Are you sure you want to delete this category?</p>
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

export default ManageCategory;
