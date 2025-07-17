import React, { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const SalesCollectionGraph = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const data = [
    { target: "2000", clearedAmount: "100", month: "JAN" },
    { target: "5000", clearedAmount: "500", month: "FEB" },
    { target: "4000", clearedAmount: "100", month: "MARCH" },
    { target: "0", clearedAmount: "0", month: "APRIL" },
    { target: "0", clearedAmount: "0", month: "MAY" },
    { target: "0", clearedAmount: "0", month: "JUNE" },
    { target: "4000", clearedAmount: "200", month: "JULY" },
    { target: "6000", clearedAmount: "1000", month: "AUG" },
    { target: "9000", clearedAmount: "0", month: "SEP" },
    { target: "10000", clearedAmount: "0", month: "OCT" },
    { target: "12000", clearedAmount: "0", month: "NOV" },
    { target: "20000", clearedAmount: "0", month: "DEC" },
  ];
  const calculatePercentage = (target, clearedAmount) => {
    if (!target) return 0;
    const percentage = (clearedAmount / target) * 100;
    return percentage > 100 ? 100 : percentage;
  };
  const formatToShortCurrency = (num) => {
    const n = Number(num);
    if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };
  return (
    <div className=" flex flex-col gap-6">
      <h1 className=" text-3xl font-medium text-[#333333]">
        Sales Vs Collection
      </h1>
      <div className=" flex flex-row gap-4 items-center ">
        <div className=" flex flex-row gap-4 text-lg w-[2%] items-center  rotate-90 ">
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
        <div className=" w-full xlg:w-[90%] grid grid-cols-12 gap-4">
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
                <h1 className=" text-xs font-medium">
                  {formatToShortCurrency(item.target)}
                </h1>
                <div className=" w-full h-[20rem] flex flex-col justify-end  bg-[#F8F8F8]">
                  {item.clearedAmount > 0 ? (
                    <div
                      className="bg-[#0A5BFF] pb-4 w-full text-xs xl:text-sm text-white text-center transition-all duration-300 ease-in-out"
                      style={{
                        height: barHeight,
                      }}
                    >
                      {formatToShortCurrency(item.clearedAmount)}
                    </div>
                  ) : (
                    <div className="text-xs xl:text-sm text-gray-400 text-center py-1">
                      0
                    </div>
                  )}
                </div>
                <h1 className=" text-center text-xs font-medium">
                  {item.month}
                </h1>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SalesCollectionGraph;
