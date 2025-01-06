import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { DateRangePicker } from "react-date-range";
import TelecallerDashboardTemplate from "../../template/TelecallerDashboardTemplate";
import TelecallerCallingData from "../../component/telecaller/TelecallerCallingData";

const TelecallerDashboard = () => {
  const { telecallerId } = useParams(); // Retrieve digitalMarketerId from URL
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [counts, setCounts] = useState({
    totalBusiness: 0,
    followUps: 0,
    visits: 0,
    dealCloses: 0,
  });
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/business/get?telecallerId=${telecallerId}`
        );
        const businessData = response.data;
        setBusinesses(businessData.businesses);

        calculateCounts(businessData);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };

    fetchBusinesses();
  }, [telecallerId]);

  const calculateCounts = (data) => {
    const totalBusiness = data.totalCount;
    const followUps = data.statuscount.FollowupCount;
    const visits = data.statuscount.visitCount;
    const dealCloses = data.statuscount.dealCloseCount;

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
    { name: "Appointment Generated", number: counts.visits },
    { name: "Deal Close", number: counts.dealCloses },
  ];
  return (
    <TelecallerDashboardTemplate>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-8">
          {dashboard.map((item, index) => (
            <div
              key={index}
              className="p-4 px-10 text-center border border-[#CCCCCC] flex flex-col gap-0 boxsh"
            >
              <span className="text-xl font-semibold text-[#777777]">
                {item.name}
              </span>
              <span className="text-lg font-semibold text-[#FF2722]">
                {item.number}
              </span>
            </div>
          ))}
        </div>
        <div>
          <TelecallerCallingData />
        </div>
      </div>
    </TelecallerDashboardTemplate>
  );
};

export default TelecallerDashboard;
