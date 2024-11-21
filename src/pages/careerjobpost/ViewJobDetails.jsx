import React from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

const ViewJobDetails = ({ job, onClose }) => {
  return (
    <div className="p-6">
      <div className="flex justify-end items-end">
        <button
          onClick={onClose}
          className="text-2xl font-semibold  text-red-500"
        >
          <IoCloseCircleOutline />
        </button>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold">{job.jobPostName}</h3>
        <p className="text-lg mt-2">
          {" "}
          <strong>Role:</strong> {job.jobrole}
        </p>
        <p className="text-lg">
          {" "}
          <strong>Location:</strong> {job.jobLocation}
        </p>
        <div className="mt-2">
          <p className="font-medium">
            <strong>Job Tags:</strong>
          </p>
          <div className="flex flex-row items-center gap-4">
            {job.jobTags &&
              job.jobTags.map((tag, index) => <li key={index}>{tag}</li>)}
          </div>
        </div>
        <div className="mt-2">
          <p className="font-medium">Job Description:</p>
          <div
            className="text-md mt-2"
            dangerouslySetInnerHTML={{ __html: job.jobDescription }}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewJobDetails;
