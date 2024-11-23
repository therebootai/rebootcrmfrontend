import React, { useState, useEffect } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useForm } from "react-hook-form";
import axios from "axios";

const EditBlog = ({ blog, onClose, fetchBlogs }) => {
  const [bulletPoints, setBulletPoints] = useState(
    blog.bulletPoints ? JSON.parse(blog.bulletPoints) : []
  );
  const [quillContent, setQuillContent] = useState(blog.writeBlog || ""); // Pre-fill blog content
  const [tempBulletPoint, setTempBulletPoint] = useState("");
  const [commaPressed, setCommaPressed] = useState(false);
  const [existingThumbnail, setExistingThumbnail] = useState(
    blog.blogThumbnails?.secure_url || null
  ); // Existing thumbnail

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      blogTitle: blog.blogTitle || "",
      publisherName: blog.publisherName || "",
      category: blog.category || "",
      publisherProfileLink: blog.publisherProfileLink || "",
      metadescription: blog.metadescription || "",
    },
  });

  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const baseURL = import.meta.env.VITE_BASE_URL;

  // Handle adding new bullet points
  const handleBulletPoint = (e) => {
    const value = e.target.value.trim();
    if (e.key === ",") {
      setCommaPressed(true);
    } else if (e.key === "Enter" && commaPressed) {
      e.preventDefault();
      if (value.endsWith(",")) {
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
      setBulletPoints((prev) => [...prev, value]);
      setTempBulletPoint("");
    }
  };

  const removeBulletPoint = (index) => {
    const updatedBulletPoints = bulletPoints.filter((_, i) => i !== index);
    setBulletPoints(updatedBulletPoints);
  };

  // Handle form submission for updating the blog
  const onSubmit = async (data) => {
    finalizeBulletPoints();
    setIsButtonClicked(true);
    try {
      const formData = new FormData();
      if (data.blogThumbnail && data.blogThumbnail[0]) {
        formData.append("blogThumbnail", data.blogThumbnail[0]);
      }
      formData.append("blogTitle", data.blogTitle);
      formData.append("publisherName", data.publisherName);
      formData.append("category", data.category);
      formData.append("bulletPoints", JSON.stringify(bulletPoints));
      formData.append("writeBlog", quillContent);
      formData.append("publisherProfileLink", data.publisherProfileLink);
      formData.append("metadescription", data.metadescription);

      // API Call to update the blog
      const response = await axios.put(
        `${baseURL}/api/blogs/update/${blog.blogId}`,
        formData
      );

      onClose();
      fetchBlogs();
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Error updating the blog. Please try again.");
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
        <h1 className="text-2xl font-semibold text-[#333333]">Edit Blog</h1>
        <button onClick={onClose} className="text-gray-600 text-2xl">
          <IoCloseCircleOutline />
        </button>
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((data) => {
          finalizeBulletPoints();
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
                required: "Publisher name is required",
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
                required: "Category is required",
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
              {...register("blogThumbnail")}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
            {existingThumbnail && (
              <div className="mt-2">
                <strong>Current Thumbnail:</strong>
                <img
                  src={existingThumbnail}
                  alt="Current Blog Thumbnail"
                  className="mt-2 max-w-[200px] max-h-[200px] object-cover"
                />
              </div>
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
              required: "meta description is required",
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
            <label>Bullet Points</label>
            <input
              type="text"
              value={tempBulletPoint}
              onChange={(e) => setTempBulletPoint(e.target.value)}
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
        <button
          type="submit"
          className="w-full flex justify-center items-center h-[3rem] rounded bg-[#FF27221A] text-[#FF2722]"
          disabled={isButtonClicked}
        >
          {isButtonClicked ? (
            <div className="animate-button"></div>
          ) : (
            "Update And Save"
          )}
        </button>
      </form>
    </div>
  );
};

export default EditBlog;
