import React from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

const ViewBlog = ({ blog, onClose }) => {
  return (
    <div className="bg-white xl:p-8 p-4 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#333333]">
          View Blog: {blog.blogId || ""}
        </h1>
        <button onClick={onClose} className="text-gray-600 text-2xl">
          <IoCloseCircleOutline />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <strong>Blog Title:</strong> {blog.blogTitle || "Not Provided"}
        </div>
        <div>
          <strong>Publisher Name:</strong>{" "}
          {blog.publisherName || "Not Provided"}
        </div>
        <div>
          <strong>Category:</strong> {blog.category || "Not Provided"}
        </div>
        <div>
          <strong>Bullet Points:</strong>
          {blog.bulletPoints && JSON.parse(blog.bulletPoints).length > 0 ? (
            <ul>
              {JSON.parse(blog.bulletPoints).map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          ) : (
            <span>Not Provided</span>
          )}
        </div>
        <div>
          <strong>Blog Content:</strong>
          {blog.writeBlog && blog.writeBlog.trim() !== "" ? (
            <div
              className="p-4 border border-[#cccccc] rounded"
              dangerouslySetInnerHTML={{ __html: blog.writeBlog }}
            ></div>
          ) : (
            <span>Not Provided</span>
          )}
        </div>
        <div>
          <strong>Thumbnail:</strong>
          {blog.blogThumbnails && blog.blogThumbnails.secure_url ? (
            <img
              src={blog.blogThumbnails.secure_url}
              alt="Blog Thumbnail"
              className="w-full h-auto mt-2"
            />
          ) : (
            <span>Not Provided</span>
          )}
        </div>
        <div>
          <strong>Status:</strong>{" "}
          {blog.isdraft ? "Draft" : blog.active ? "Active" : "Inactive"}
        </div>
      </div>
    </div>
  );
};

export default ViewBlog;
