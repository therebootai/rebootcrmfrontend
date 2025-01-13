import React from "react";

import TelecallerDashboardTemplate from "../../template/TelecallerDashboardTemplate";
import TelecallerCallingData from "../../component/telecaller/TelecallerCallingData";

const TelecallerDashboard = () => {
  return (
    <TelecallerDashboardTemplate>
      <div>
        <TelecallerCallingData />
      </div>
    </TelecallerDashboardTemplate>
  );
};

export default TelecallerDashboard;
