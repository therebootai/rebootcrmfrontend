import React from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

const ViewApplication = ({ application, onClose }) => {
  if (!application) return null;

  return (
    <div className="p-6">
      {/* Close Button */}
      <div className="flex justify-end items-end">
        <button
          onClick={onClose}
          className="text-2xl font-semibold text-red-500"
        >
          <IoCloseCircleOutline />
        </button>
      </div>

      {/* Application Details */}
      <div className="mt-4 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Application Details
        </h1>

        <div className="flex flex-col gap-4">
          <p>
            <strong>Name:</strong> {application.name}
          </p>
          <p>
            <strong>Mobile Number:</strong> {application.mobileNumber}
          </p>
          <p>
            <strong>Applying For:</strong> {application.applyingFor}
          </p>
          <p>
            <strong>Last Qualification:</strong> {application.lastQualification}
          </p>
          <p>
            <strong>Total Experience:</strong> {application.totalExperience}
          </p>
          <p>
            <strong>Location:</strong> {application.location}
          </p>
          <p>
            <strong>Job Post Name:</strong> {application.jobPostName}
          </p>
          <p>
            <strong>Job Role:</strong> {application.jobrole}
          </p>
          <p>
            <strong>Created At:</strong>
            {new Date(application.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* CV Link */}
        <div className="mt-4">
          <a
            href={application.uploadCV.secure_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Uploaded CV
          </a>
        </div>
      </div>
    </div>
  );
};

export default ViewApplication;
