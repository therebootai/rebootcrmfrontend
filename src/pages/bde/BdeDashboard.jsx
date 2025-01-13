import React from "react";

import BdeDashboardTemplate from "../../template/BdeDashboardTemplate";
import BdeAppointmentData from "../../component/bde/BdeAppointmentData";

const BdeDashboard = () => {
  return (
    <BdeDashboardTemplate>
      <div className=" flex flex-col gap-4">
        <div>
          <BdeAppointmentData />
        </div>
      </div>
    </BdeDashboardTemplate>
  );
};

export default BdeDashboard;
