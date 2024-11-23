import React, { useState } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useForm } from "react-hook-form";
import axios from "axios";

const AddNewBlog = ({ onClose, fetchBlogs }) => {
  const [bulletPoints, setBulletPoints] = useState([]);
  const [isDraft, setIsDraft] = useState(false);
  const [quillContent, setQuillContent] = useState("");
  const [tempBulletPoint, setTempBulletPoint] = useState("");
  const [commaPressed, setCommaPressed] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const baseURL = import.meta.env.VITE_BASE_URL;

  const handleBulletPoint = (e) => {
    const value = e.target.value.trim();

    if (e.key === ",") {
      setCommaPressed(true);
    } else if (e.key === "Enter" && commaPressed) {
      e.preventDefault();
      if (value.endsWith(",")) {
        // Remove the trailing comma
        const cleanValue = value.slice(0, -1).trim();
        setBulletPoints((prev) => [...prev, cleanValue]);
      } else if (value) {
        setBulletPoints((prev) => [...prev, value]);
      }
      setTempBulletPoint("");
      setCommaPressed(false);
    } else {
      setCommaPressed(false);
    }
  };

  const finalizeBulletPoints = () => {
    const value = tempBulletPoint.trim();
    if (value) {
      console.log("Finalizing bullet point:", value);
      setBulletPoints((prev) => [...prev, value]);
      setTempBulletPoint("");
    }
  };

  const removeBulletPoint = (index) => {
    const updatedBulletPoints = bulletPoints.filter((_, i) => i !== index);
    setBulletPoints(updatedBulletPoints);
  };

  // Handle form submission
  const onSubmit = async (data, isDraft) => {
    finalizeBulletPoints();
    setIsButtonClicked(true);
    try {
      const formData = new FormData();
      if (data.blogThumbnail && data.blogThumbnail[0]) {
        formData.append("blogThumbnail", data.blogThumbnail[0]);
      }
      formData.append("blogTitle", data.blogTitle);
      formData.append("publisherName", data.publisherName || "");
      formData.append("category", data.category || "");
      formData.append("bulletPoints", JSON.stringify(bulletPoints));
      formData.append("isDraft", isDraft ? "true" : "false");
      formData.append("writeBlog", quillContent);
      formData.append("publisherProfileLink", data.publisherProfileLink);
      formData.append("metadescription", data.metadescription);

      // API Call
      const response = await axios.post(
        `${baseURL}/api/blogs/create`,
        formData
      );

      onClose();
      fetchBlogs();
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Error creating the blog. Please try again.");
      setIsButtonClicked(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "font",
    "list",
    "bullet",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "align",
    "color",
    "background",
    "link",
    "image",
    "video",
  ];

  return (
    <div className="bg-white xl:p-8 p-4 flex flex-col gap-8">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#333333]">Add New Blog</h1>
        <button onClick={onClose} className="text-gray-600 text-2xl">
          <IoCloseCircleOutline />
        </button>
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((data) => {
          finalizeBulletPoints(); // Add any remaining bullet points
          onSubmit(data);
        })}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label>Enter Title</label>
            <input
              type="text"
              {...register("blogTitle", {
                required: "Blog title is required",
              })}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
            {errors.blogTitle && (
              <span className="text-red-500">{errors.blogTitle.message}</span>
            )}
          </div>
          <div className="flex flex-col">
            <label>Publisher Name</label>
            <input
              type="text"
              {...register("publisherName", {
                required: isDraft ? false : "Publisher name is required",
              })}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
            {errors.publisherName && (
              <span className="text-red-500">
                {errors.publisherName.message}
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label>Category</label>
            <select
              {...register("category", {
                required: isDraft ? false : "Category is required",
              })}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            >
              <option value="">Select Category</option>
              <option value="App Development">App Development</option>
              <option value="SaaS Development">SaaS Development</option>
              <option value="AI & ML">AI & ML</option>
              <option value="Web Development">Web Development</option>
              <option value="Performance Marketing">
                Performance Marketing
              </option>
              <option value="Google Marketing & SEO">
                Google Marketing & SEO
              </option>
              <option value="Social Media Marketing">
                Social Media Marketing
              </option>
              <option value="Technology Trends">Technology Trends</option>
              <option value="Case Studies and Success Stories">
                Case Studies and Success Stories
              </option>
              <option value="How-To Guides and Tutorials">
                How-To Guides and Tutorials
              </option>
              <option value="FAQs and Solutions">FAQs and Solutions</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
            {errors.category && (
              <span className="text-red-500">{errors.category.message}</span>
            )}
          </div>
          <div className="flex flex-col">
            <label>Upload Thumbnail</label>
            <input
              type="file"
              {...register("blogThumbnail", {
                required: isDraft ? false : "Thumbnail is required",
              })}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
            {errors.blogThumbnail && (
              <span className="text-red-500">
                {errors.blogThumbnail.message}
              </span>
            )}
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col">
            <label>Publisher Profile Link</label>
            <input
              type="text"
              {...register("publisherProfileLink")}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label>Meta Description</label>
          <input
            type="text"
            {...register("metadescription", {
              required: isDraft ? false : "meta description is required",
            })}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
          {errors.metadescription && (
            <span className="text-red-500">
              {errors.metadescription.message}
            </span>
          )}
        </div>

        <div className="w-full">
          <div className="flex flex-col">
            <label>Tags</label>
            <input
              type="text"
              value={tempBulletPoint}
              onChange={(e) => {
                console.log("Input value:", e.target.value); // Debug log
                setTempBulletPoint(e.target.value);
              }}
              onKeyDown={handleBulletPoint}
              placeholder="Type, press Comma and then Enter to save"
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {bulletPoints.map((point, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-200 rounded-full cursor-pointer"
                  onClick={() => removeBulletPoint(index)}
                >
                  {point} &times;
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col">
            <label>Write Blog</label>
            <ReactQuill
              modules={modules}
              formats={formats}
              value={quillContent}
              onChange={setQuillContent}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
          </div>
        </div>
        <div className="flex flex-row gap-8">
          <button
            type="button"
            onClick={() => {
              setIsDraft(true);
              handleSubmit((data) => onSubmit(data, true))();
            }}
            className={`w-[40%] flex justify-center items-center h-[3rem] rounded bg-[#0000001A] text-[#333333] ${
              isButtonClicked ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isButtonClicked} // Disable button after click
          >
            {isButtonClicked ? (
              <div className="animate-button"></div>
            ) : (
              "Save As Draft"
            )}
          </button>

          <button
            type="submit"
            onClick={() => {
              setIsDraft(false);
              handleSubmit((data) => onSubmit(data, false))();
            }}
            className={`w-[40%] flex justify-center items-center h-[3rem] rounded bg-[#FF27221A] text-[#FF2722] ${
              isButtonClicked ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isButtonClicked} // Disable button after click
          >
            {isButtonClicked ? <div className="animate-button"></div> : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewBlog;
