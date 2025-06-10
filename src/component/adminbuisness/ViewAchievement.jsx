import React from "react";

const ViewAchievement = ({ user }) => {
  return (
    <div className="p-4 flex flex-col w-full gap-6">
      <h2 className="text-lg font-medium">Employee Details</h2>
      <div className="flex flex-col">
        <label>Name:</label>
        <div className="bg-white rounded-sm p-4 border border-[#cccccc]">
          {user.name}
        </div>
      </div>
      <div className="flex flex-col">
        <label>Mobile Number:</label>
        <div className="bg-white rounded-sm p-4 border border-[#cccccc]">
          {user.mobileNumber}
        </div>
      </div>
      <div className="flex flex-col">
        <label>Role:</label>
        <div className="bg-white rounded-sm p-4 border border-[#cccccc]">
          {user.role}
        </div>
      </div>
      <div className="flex flex-col">
        <label>Targets:</label>
        <div className="bg-white rounded-sm p-4 border border-[#cccccc]">
          {user.targets.map((target, index) => (
            <div
              key={index}
              className="flex py-2 border-b border-dashed justify-between"
            >
              <span>
                {target.month} {target.year}
              </span>
              <span>INR {target.amount}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        <label>Achievements:</label>
        <div className="bg-white rounded-sm p-4 border border-[#cccccc]">
          {user.targets.map((target, index) => (
            <div
              key={index}
              className="flex py-2 border-b border-dashed justify-between"
            >
              <span>
                {target.month} {target.year}
              </span>
              <span>INR {target.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewAchievement;
