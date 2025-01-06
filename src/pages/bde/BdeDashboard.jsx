import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import BdeDashboardTemplate from "../../template/BdeDashboardTemplate";
import BdeAppointmentData from "../../component/bde/BdeAppointmentData";

const BdeDashboard = () => {
  const { bdeId } = useParams();
  const [businesses, setBusinesses] = useState([]);

  const [counts, setCounts] = useState({
    totalBusiness: 0,
    followUps: 0,
    visits: 0,
    dealCloses: 0,
  });

  const fetchBusinesses = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?bdeId=${bdeId}&byTagAppointment=true`
      );
      const businessData = response.data;

      setBusinesses(businessData.businesses);

      calculateCounts(businessData);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [bdeId]);

  const calculateCounts = (data) => {
    const totalBusiness = data.totalCount;
    const followUps = data.statuscount.FollowupCount;
    const visits = data.statuscount.dealCloseCount;
    const dealCloses = data.statuscount.visitCount;

    setCounts({
      totalBusiness,
      followUps,
      visits,
      dealCloses,
    });
  };

  const dashboard = [
    { name: "Total Business", number: counts.totalBusiness },
    { name: "Follow Ups", number: counts.followUps },
    { name: "Visit", number: counts.visits },
    { name: "Deal Close", number: counts.dealCloses },
  ];
  return (
    <BdeDashboardTemplate>
      <div className=" flex flex-col gap-4">
        <div className="flex flex-wrap md:gap-6 sm:gap-3 lg:gap-8">
          {dashboard.map((item, index) => (
            <div
              key={index}
              className="p-4 sm:px-6 lg:px-10 text-center border border-[#CCCCCC] flex flex-col gap-0 boxsh"
            >
              <span className="md:text-xl sm:text-lg font-semibold text-[#777777]">
                {item.name}
              </span>
              <span className="md:text-lg sm:text-base font-semibold text-[#FF2722]">
                {item.number}
              </span>
            </div>
          ))}
        </div>
        <div>
          <BdeAppointmentData />
        </div>
      </div>
    </BdeDashboardTemplate>
  );
};

export default BdeDashboard;
