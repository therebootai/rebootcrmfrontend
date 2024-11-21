import React from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

const ViewWebsiteLeads = ({ lead, onClose }) => {
  if (!lead) return null;

  return (
    <div className="bg-white xl:p-16 p-8">
      <button
        onClick={onClose}
        className="  text-gray-600 text-2xl flex justify-end items-end w-full"
      >
        <IoCloseCircleOutline />
      </button>
      <div className="bg-white p-4 rounded-md  h-screen">
        <div className="mt-4 flex flex-col gap-6">
          <div>
            <strong>Name:</strong> {lead.name}
          </div>
          <div>
            <strong>Mobile Number:</strong> {lead.mobileNumber}
          </div>
          <div>
            <strong>Email:</strong> {lead.email}
          </div>
          <div>
            <strong>Consultation For:</strong> {lead.consultationFor}
          </div>
          <div>
            <strong>Message:</strong> {lead.massage || "N/A"}
          </div>
          <div>
            <strong>Status:</strong> {lead.status}
          </div>
        </div>
        <div className="mt-4 flex justify-end"></div>
      </div>
    </div>
  );
};

export default ViewWebsiteLeads;
