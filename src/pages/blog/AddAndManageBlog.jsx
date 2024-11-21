import React, { useState, useEffect } from "react";
import AdminDashboardTemplate from "../../template/AdminDashboardTemplate";
import AddNewBlog from "./AddNewBlog";
import axios from "axios";
import { format } from "date-fns";
import { MdOutlineVisibility } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import ViewBlog from "./ViewBlog";
import EditBlog from "./EditBlog";
import LoadingAnimation from "../../component/LoadingAnimation";

const AddAndManageBlog = () => {
  const [addBlogModel, setAddBlogModel] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
    search: "",
    isdraft: null,
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [viewBlogModel, setViewBlogModel] = useState(false);
  const [editBlogModel, setEditBlogModel] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
  const baseURL = import.meta.env.VITE_BASE_URL;

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/api/blogs/category-dropdown`
      );
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/api/blogs/get`, {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          category: filters.category,
          blogTitle: filters.search,
          page,
          isdraft: filters.isdraft,
        },
      });

      setBlogs(response.data.data || []);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (blogId, currentStatus) => {
    try {
      const response = await axios.put(
        `${baseURL}/api/blogs/update/${blogId}`,
        {
          active: !currentStatus,
        }
      );
      fetchBlogs();
    } catch (error) {
      console.error("Error toggling blog status:", error);
    }
  };

  const handleShowFilter = () => {
    if (dateRange.startDate && dateRange.endDate) {
      setFilters((prev) => ({
        ...prev,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      }));
      setPage(1);
      setIsDateFilterApplied(true); // Show "Clear" button
    }
  };

  const handleClearFilter = () => {
    setFilters((prev) => ({
      ...prev,
      startDate: "",
      endDate: "",
    }));
    setDateRange({
      startDate: null,
      endDate: null,
      key: "selection",
    });
    setIsDateFilterApplied(false); // Reset to "Show" button
    fetchBlogs();
  };

  const toggleIsDraftFilter = () => {
    setFilters((prev) => ({
      ...prev,
      isdraft: prev.isdraft === "true" ? null : "true",
    }));
    setPage(1);
  };

  const handleDeleteConfirmation = (blogId) => {
    setBlogToDelete(blogId);
    setShowDeleteModal(true);
  };

  const deleteBlog = async () => {
    try {
      await axios.delete(`${baseURL}/api/blogs/delete/${blogToDelete}`);
      setShowDeleteModal(false);
      setBlogToDelete(null);
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handleViewBlog = (blog) => {
    setSelectedBlog(blog);
    setViewBlogModel(true); // Open the view blog slide
  };

  const handleEditBlog = (blog) => {
    setBlogToEdit(blog);
    setEditBlogModel(true);
  };

  // Handle pagination click
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  // Handle opening and closing the Add Blog modal
  const handleAddClickOpen = () => {
    setAddBlogModel(true);
  };

  const handleCloseAddBlog = () => {
    setAddBlogModel(false);
    fetchBlogs(); // Refresh blogs after adding a new one
  };

  // Fetch data on mount
  useEffect(() => {
    fetchCategories();
    fetchBlogs();
  }, []);

  // Fetch blogs when filters or page change
  useEffect(() => {
    fetchBlogs();
  }, [filters, page]);

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-row gap-4 justify-between items-center">
          {/* Filters */}
          <div className="py-6 flex border-b border-[#cccccc] items-center flex-wrap gap-6">
            <span className="text-lg font-semibold text-[#777777]">Filter</span>
            <div className="relative">
              <input
                type="text"
                value={
                  dateRange.startDate && dateRange.endDate
                    ? `${format(dateRange.startDate, "dd/MM/yyyy")} - ${format(
                        dateRange.endDate,
                        "dd/MM/yyyy"
                      )}`
                    : "Select Date Range"
                }
                readOnly
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
              />
              {showDatePicker && (
                <div className="absolute z-10">
                  <DateRangePicker
                    ranges={[dateRange]}
                    onChange={(ranges) => {
                      setDateRange({
                        ...dateRange,
                        startDate: ranges.selection.startDate,
                        endDate: ranges.selection.endDate,
                      });
                    }}
                    rangeColors={["#ff2722"]}
                  />
                </div>
              )}
            </div>
            {isDateFilterApplied ? (
              <>
                <button
                  onClick={handleClearFilter}
                  className="px-4 py-1 bg-gray-200 text-black rounded"
                >
                  Clear
                </button>
              </>
            ) : (
              <button
                onClick={handleShowFilter}
                className="px-4 py-1 bg-[#FF2722] text-white rounded"
              >
                Show
              </button>
            )}

            <input
              type="text"
              placeholder="Search by title"
              className="px-4 p-1 border border-[#5f5151] text-sm rounded-md"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
            <select
              name="category"
              className="px-4 p-1 border border-[#5f5151] text-sm rounded-md"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button
              onClick={toggleIsDraftFilter}
              className={`p-1 px-4 rounded text-sm ${
                filters.isdraft === "true"
                  ? "bg-[#FF2722] text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {filters.isdraft === "true" ? "Draft On" : "Draft Off"}
            </button>
          </div>

          <button
            onClick={handleAddClickOpen}
            className="flex h-[2rem] px-4 justify-center items-center rounded text-white bg-[#FF2722] text-base font-medium"
          >
            Add Blog
          </button>
        </div>

        {/* Blogs Table */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <LoadingAnimation />
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="xlg:min-w-[1000px] sm:min-w-[900px] flex flex-col">
                <div className="flex gap-4 sm:text-xs md:text-sm font-medium py-4 border-y border-[#CCCCCC] text-[#333333]">
                  <div className="w-[15%]">Date & Time</div>
                  <div className="w-[25%]">Blog Title</div>
                  <div className="w-[20%]">Category</div>
                  <div className="w-[15%]">Published By</div>
                  <div className="w-[15%]">Status</div>
                  <div className="w-[10%]">Actions</div>
                </div>
                {blogs.length > 0 ? (
                  blogs.map((blog) => (
                    <div
                      key={blog.blogId}
                      className="flex gap-4 sm:text-xs md:text-sm py-2 border-b border-[#CCCCCC] text-[#333333]"
                    >
                      <div className="w-[15%]">
                        {format(new Date(blog.createdAt), "dd-MM-yyyy HH:mm")}
                      </div>
                      <div className="w-[25%]">{blog.blogTitle}</div>
                      <div className="w-[20%]">{blog.category}</div>
                      <div className="w-[15%]">{blog.publisherName}</div>
                      <div className="w-[15%]">
                        {blog.isdraft ? (
                          "Draft"
                        ) : (
                          <button
                            onClick={() =>
                              toggleStatus(blog.blogId, blog.active)
                            }
                            className={`px-2 py-1 rounded text-white ${
                              blog.active ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            {blog.active ? "Active" : "Deactive"}
                          </button>
                        )}
                      </div>
                      <div className="w-[10%] flex gap-4 text-lg">
                        <button
                          onClick={() => handleViewBlog(blog)}
                          className="text-[#00D23B]"
                        >
                          <MdOutlineVisibility />
                        </button>
                        <button
                          onClick={() => handleEditBlog(blog)}
                          className="text-[#004dd2]"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirmation(blog.blogId)}
                          className="text-red-600"
                        >
                          <RiDeleteBin5Line />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No blogs available</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-4 py-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border border-[#cccccc] rounded-md"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 border ${
                page === index + 1
                  ? "border-[#FF2722] text-[#FF2722]"
                  : "border-[#cccccc]"
              } rounded-md`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 border border-[#cccccc] rounded-md"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Blog Modal */}
      <div
        className={`fixed top-0 right-0 h-screen w-[75%] xl:w-[60%] overflow-scroll no-scrollbar bg-[#EDF4F7] shadow-lg transform transition-transform duration-300 ease-in-out ${
          addBlogModel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {addBlogModel && <AddNewBlog onClose={handleCloseAddBlog} />}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg font-semibold">
              Are you sure you want to delete this blog?
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                No
              </button>
              <button
                onClick={deleteBlog}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {viewBlogModel && (
        <div
          className={`fixed top-0 right-0 h-screen w-[75%] xl:w-[60%] overflow-scroll no-scrollbar bg-[#EDF4F7] shadow-lg transform transition-transform duration-300 ease-in-out`}
        >
          <ViewBlog
            blog={selectedBlog}
            onClose={() => setViewBlogModel(false)}
          />
        </div>
      )}

      {editBlogModel && (
        <div
          className={`fixed top-0 right-0 h-screen w-[75%] xl:w-[60%] overflow-scroll no-scrollbar bg-[#EDF4F7] shadow-lg transform transition-transform duration-300 ease-in-out`}
        >
          <EditBlog
            blog={blogToEdit}
            onClose={() => setEditBlogModel(false)}
            fetchBlogs={fetchBlogs}
          />
        </div>
      )}
    </AdminDashboardTemplate>
  );
};

export default AddAndManageBlog;
