import React, { useEffect, useState } from "react";
import TelecallerHeader from "../component/telecaller/TelecallerHeader";
import TelecallerSideHeader from "../component/telecaller/TelecallerSideHeader";
import BdeHeader from "../component/bde/BdeHeader";
import BdeSideHeader from "../component/bde/BdeSideHeader";

const BdeDashboardTemplate = ({ children }) => {
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsTokenVerified(false);
      setTimeout(() => {
        alert("You are not logged in");
        window.location.href = "/";
      }, 0);
      return;
    }
    setIsTokenVerified(true);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  if (!isTokenVerified) {
    return <div></div>;
  }

  return (
    <div className="flex flex-col w-full h-full  bg-[white] overflow-hidden">
      <div>
        <BdeHeader
          toggleMobileSidebar={toggleMobileSidebar}
          isMobileSidebarOpen={isMobileSidebarOpen}
          hideHeader={hideHeader}
        />
      </div>

      <div className="flex flex-row h-screen sm:w-full relative">
        <BdeSideHeader
          isMobileSidebarOpen={isMobileSidebarOpen}
          closeMobileSidebar={closeMobileSidebar}
        />
        <div className="w-full p-4 overflow-auto no-scrollbar md:ml-[3rem] lg:ml-[4rem] xlg:ml-[5rem] xl:ml-[6rem]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BdeDashboardTemplate;
