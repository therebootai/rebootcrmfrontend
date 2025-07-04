import axios from "axios";
import { useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const ClientGraph = () => {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    try {
      const [telecallers, bdes, collectionRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/telecaller/get`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/bde/get`),
        axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/client/collection-summary`
        ),
      ]);

      const allUsers = [...telecallers.data, ...bdes.data];
      const allTargets = allUsers.flatMap((user) => user.targets || []);
      const collectionData = collectionRes.data.data;

      const monthShortToFull = {
        JAN: "January",
        FEB: "February",
        MARCH: "March",
        APRIL: "April",
        MAY: "May",
        JUNE: "June",
        JULY: "July",
        AUG: "August",
        SEP: "September",
        OCT: "October",
        NOV: "November",
        DEC: "December",
      };

      const monthlyTargets = allTargets.reduce((acc, target) => {
        const key = `${target.month}_${target.year}`;
        acc[key] = (acc[key] || 0) + (target.amount || 0);
        return acc;
      }, {});

      const collectionForYear = collectionData.find(
        (item) => item.year === selectedYear
      );

      const updatedGraphs = Object.entries(monthShortToFull).map(
        ([shortMonth, fullMonth]) => {
          const key = `${fullMonth}_${selectedYear}`;
          const target = monthlyTargets[key] || 0;
          const clearedAmount =
            collectionForYear?.months?.find((m) => m.month === fullMonth)
              ?.totalAmount || 0;

          return {
            month: shortMonth,
            target,
            clearedAmount,
          };
        }
      );

      setData(updatedGraphs);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const calculatePercentage = (target, clearedAmount) => {
    if (!target) return 0;
    const percentage = (clearedAmount / target) * 100;
    return percentage > 100 ? 100 : percentage;
  };
  return (
    <div className=" flex flex-row gap-4 items-center ">
      <div className=" flex flex-row gap-4 text-lg items-center w-[5%] rotate-90 ">
        <button onClick={() => setSelectedYear((prev) => prev - 1)}>
          <LuChevronLeft className="text-[#0A5BFF]" />
        </button>
        <div className="text-xl font-medium">{selectedYear}</div>
        <button
          onClick={() => setSelectedYear((prev) => prev + 1)}
          className="text-[#0A5BFF]"
        >
          <LuChevronRight />
        </button>
      </div>
      <div className=" w-[95%] grid grid-cols-12 gap-4">
        {data.map((item, index) => {
          const percentage = calculatePercentage(
            item.target,
            item.clearedAmount
          );
          const barHeight = `${percentage}%`;

          return (
            <div
              key={index}
              className=" flex flex-col gap-2 justify-center items-center text-[#888888]"
            >
              <h1 className=" text-xs font-medium">{item.target}</h1>
              <div className=" w-full h-[20rem] flex flex-col justify-end  bg-[#F8F8F8]">
                {item.clearedAmount > 0 ? (
                  <div
                    className="bg-[#0A5BFF] w-full text-xs xl:text-sm text-white text-center transition-all duration-300 ease-in-out"
                    style={{
                      height: barHeight,
                    }}
                  >
                    {item.clearedAmount}
                  </div>
                ) : (
                  <div className="text-xs xl:text-sm text-gray-400 text-center py-1">
                    0
                  </div>
                )}
              </div>
              <h1 className=" text-center text-xs font-medium">{item.month}</h1>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientGraph;
