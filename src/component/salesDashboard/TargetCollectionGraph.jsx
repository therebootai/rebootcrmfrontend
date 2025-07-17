import React from "react";
import ClientGraph from "../clientModule/ClientGraph";

const TargetCollectionGraph = () => {
  return (
    <div className=" flex flex-col gap-8">
      <h1 className=" text-3xl font-medium text-[#333333]">
        1 year Target Vs Collections
      </h1>
      <div>
        <ClientGraph />
      </div>
    </div>
  );
};

export default TargetCollectionGraph;
