import React, { useState, useEffect } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useForm } from "react-hook-form";
import axios from "axios";

const EditJobDetails = ({ jobData, onClose, onUpdate }) => {
  const [jobTags, setJobTags] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [commaPressed, setCommaPressed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const baseURL = import.meta.env.VITE_BASE_URL;
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  // Prefill data when the component is mounted
  useEffect(() => {
    if (jobData) {
      setValue("jobPostName", jobData.jobPostName);
      setValue("jobrole", jobData.jobrole);
      setValue("jobLocation", jobData.jobLocation);
      setJobTags(jobData.jobTags || []);
      setJobDescription(jobData.jobDescription);
    }
  }, [jobData, setValue]);

  // Handling tag input change
  const handleTagsChange = (e) => {
    const value = e.target.value.trim();
    if (e.key === ",") {
      setCommaPressed(true);
    } else if (e.key === "Enter" && commaPressed) {
      e.preventDefault();
      if (value.endsWith(",")) {
        const cleanValue = value.slice(0, -1).trim();
        setJobTags((prev) => [...prev, cleanValue]);
      } else if (value) {
        setJobTags((prev) => [...prev, value]);
      }
      e.target.value = ""; // Reset input field
      setCommaPressed(false);
    } else {
      setCommaPressed(false);
    }
  };

  // Removing a tag
  const handleRemoveTag = (index) => {
    const updatedTags = jobTags.filter((_, i) => i !== index);
    setJobTags(updatedTags);
  };

  // Form submission handler
  const handleSubmitJob = async (data) => {
    setIsButtonClicked(true);
    try {
      const updatedJobData = {
        jobPostName: data.jobPostName,
        jobrole: data.jobrole,
        jobTags,
        jobDescription,
        jobLocation: data.jobLocation,
      };

      const response = await axios.put(
        `${baseURL}/api/jobpost/update/${jobData.jobpostId}`,
        updatedJobData
      );

      onUpdate(response.data.data);
      onClose();
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Error updating job post");
      setIsButtonClicked(false);
    }
  };

  return (
    <div className="bg-white xl:p-8 p-4 flex flex-col gap-8">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#333333]">Edit Job Post</h1>
        <button onClick={onClose} className="text-gray-600 text-2xl">
          <IoCloseCircleOutline />
        </button>
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(handleSubmitJob)}
      >
        {/* Job Post Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label>Post Name</label>
            <input
              type="text"
              {...register("jobPostName", {
                required: "Job Post Name is required",
              })}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
            {errors.jobPostName && (
              <span className="text-red-500">{errors.jobPostName.message}</span>
            )}
          </div>

          {/* Job Role */}
          <div className="flex flex-col">
            <label>Select Role</label>
            <select
              {...register("jobrole", {
                required: "Job Role is required",
              })}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            >
              <option value="">Select Role</option>
              <option value="Sales & Marketing">Sales & Marketing</option>

              <option value="Web Developer">Web Developer</option>
              <option value="App Development">App Development</option>

              <option value="HR">HR</option>
              <option value="Accounts">Accounts</option>
            </select>
            {errors.jobrole && (
              <span className="text-red-500">{errors.jobrole.message}</span>
            )}
          </div>
        </div>

        {/* Job Location */}
        <div className="w-full flex flex-col gap-2">
          <label>Job Location</label>
          <input
            type="text"
            {...register("jobLocation")}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
        </div>

        {/* Tags */}
        <div className="w-full flex flex-col gap-2">
          <label>Tags</label>
          <input
            type="text"
            onKeyDown={handleTagsChange}
            placeholder="Type, press Comma and then Enter to save"
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {jobTags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 rounded-full cursor-pointer"
                onClick={() => handleRemoveTag(index)}
              >
                {tag} &times;
              </span>
            ))}
          </div>
        </div>

        {/* Job Description */}
        <div className="w-full">
          <div className="flex flex-col">
            <label>Job Description</label>
            <ReactQuill
              value={jobDescription}
              onChange={setJobDescription}
              className="bg-white rounded-sm p-4 border border-[#cccccc]"
            />
            {jobDescription === "" && (
              <span className="text-red-500">Job Description is required</span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isButtonClicked}
          className="w-[40%] flex justify-center items-center h-[3rem] rounded bg-[#FF27221A] text-[#FF2722]"
        >
          {isButtonClicked ? (
            <div className="animate-button"></div>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
};

export default EditJobDetails;
