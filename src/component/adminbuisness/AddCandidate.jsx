import React, { useState, useEffect } from "react";
import axios from "axios";

import "react-datepicker/dist/react-datepicker.css";

const AddCandidate = ({ onAddCandidates }) => {
  const [formData, setFormData] = useState({
    candidatename: "",
    mobileNumber: "",
    altMobileNumber: "",
    city: "",
    interestPost: "",
    lastQualification: "",
    experience: "",
    remarks: "",
    cv: null,
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobileNumber" && value.length > 10) {
      return; // Prevent input more than 10 digits
    }
    if (name === "altMobileNumber" && value.length > 10) {
      return; // Prevent input more than 10 digits
    }
    if (name === "cv") {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        cv: file,
      });
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    let formValid = true;
    const newErrors = {};

    if (!formData.candidatename.trim()) {
      newErrors.candidatename = "Candidate Name name is required";
      formValid = false;
    }

    if (!formData.mobileNumber.trim() || formData.mobileNumber.length !== 10) {
      newErrors.mobileNumber = "Mobile Number must be a 10-digit number";
      formValid = false;
    }

    if (!formData.city) {
      newErrors.city = "City is required";
      formValid = false;
    }

    if (!formData.interestPost) {
      newErrors.interestPost = "Interest Post is required";
      formValid = false;
    }

    setErrors(newErrors);

    const submitedFormData = new FormData();

    submitedFormData.append("candidatename", formData.candidatename);
    submitedFormData.append("mobileNumber", formData.mobileNumber);
    submitedFormData.append("altMobileNumber", formData.altMobileNumber);
    submitedFormData.append("city", formData.city);
    submitedFormData.append("interestPost", formData.interestPost);
    submitedFormData.append("lastQualification", formData.lastQualification);
    submitedFormData.append("experience", formData.experience);
    submitedFormData.append("remarks", formData.remarks);
    submitedFormData.append("cv", formData.cv);

    if (formValid) {
      try {
        // Send data to backend
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/candidate/create`,
          submitedFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        onAddCandidates(response.data);
        window.location.reload();
        // Optionally, reset form data
        setFormData({
          candidatename: "",
          mobileNumber: "",
          altMobileNumber: "",
          city: "",
          interestPost: "",
          lastQualification: "",
          experience: "",
          remarks: "",
          cv: null,
        });
      } catch (error) {
        console.error("Error creating Candidate Details:", error);
        if (
          error.response &&
          error.response.data.error === "Mobile number already exists"
        ) {
          setErrors({ mobileNumber: "Mobile number already exists" });
        } else {
          alert("Failed to create Candidate details. Please try again.");
        }
      }
    }
  };

  return (
    <div className="p-4 flex flex-col w-full gap-6">
      <form
        className="grid sm:grid-cols-1 w-full md:grid-cols-2 sm:gap-4 xl:gap-8"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col">
          <label>Candidate Name</label>
          <input
            type="text"
            name="candidatename"
            value={formData.candidatename}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
          {errors.candidatename && (
            <span className="text-red-500">{errors.candidatename}</span>
          )}
        </div>

        <div className="flex flex-col ">
          <label>Mobile Number</label>
          <input
            type="text"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
          {errors.mobileNumber && (
            <span className="text-red-500">{errors.mobileNumber}</span>
          )}
        </div>

        <div className="flex flex-col ">
          <label>Alternate Number</label>
          <input
            type="text"
            name="altMobileNumber"
            value={formData.altMobileNumber}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
          {errors.altMobileNumber && (
            <span className="text-red-500">{errors.altMobileNumber}</span>
          )}
        </div>

        <div className="flex flex-col ">
          <label>City/Town</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          ></input>
          {errors.city && <span className="text-red-500">{errors.city}</span>}
        </div>
        <div className="flex flex-col ">
          <label>Interest Post</label>
          <select
            name="interestPost"
            value={formData.interestPost}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          >
            <option value="">Choose</option>
            {[
              "Business Development Executive",
              "Team Leader Sales",
              "Digital Marketing Executive",
              "Telecaller",
              "HR",
              "Content Writer",
              "UI / UX Developer",
              "Creative Graphics Designer",
              "Full Stack Developer",
              "App Developer",
            ].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.interestPost && (
            <span className="text-red-500">{errors.interestPost}</span>
          )}
        </div>
        <div className="flex flex-col ">
          <label>Last Qualification </label>
          <input
            type="text"
            name="lastQualification"
            value={formData.lastQualification}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          ></input>
          {errors.lastQualification && (
            <span className="text-red-500">{errors.lastQualification}</span>
          )}
        </div>
        <div className="flex flex-col ">
          <label>Experience (Optional)</label>
          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          ></input>
        </div>

        <div className="flex flex-col">
          <label>CV (Optional)</label>
          <input
            type="file"
            name="cv"
            accept=".pdf, .doc, .docx"
            value={formData.cv}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
        </div>

        <div className="flex flex-col col-span-2">
          <label>Remarks (Optional)</label>
          <textarea
            type="text"
            name="remarks"
            rows={5}
            value={formData.remarks}
            onChange={handleInputChange}
            className="bg-white rounded-sm p-4 border border-[#cccccc]"
          />
        </div>

        <div className="flex flex-col ">
          <div className="text-transparent">submit</div>
          <button
            type="submit"
            className="w-[50%] bg-[#FF27221A] p-4 flex justify-center items-center text-[#FF2722] text-base rounded-sm"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCandidate;
