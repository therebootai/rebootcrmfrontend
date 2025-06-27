import React, { useEffect, useState, useRef } from "react";
import { HiViewGrid } from "react-icons/hi";
import { IoNotificationsSharp, IoSearchSharp } from "react-icons/io5";
import { TfiMenuAlt } from "react-icons/tfi";
import { IoIosLogOut } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AiOutlineClose } from "react-icons/ai";

const DigitalHeader = ({
  toggleMobileSidebar,
  isMobileSidebarOpen,
  hideHeader,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileImageRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const { digitalMarketerId } = useParams();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/digitalmarketer/get/${digitalMarketerId}`
        );

        setUserName(response.data);
      } catch (error) {
        console.error("Error fetching telecaller data:", error);
      }
    };

    fetchLeads();
  }, [digitalMarketerId]);

  const handleLogout = async () => {
    const resp = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/logout`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    console.log(resp.data);
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("digitalMarketerId");
    localStorage.removeItem("role");

    window.location.href = "/";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  return (
    <div className={`relative ${hideHeader ? "hidden" : "block"}`}>
      <div className="md:px-8 sm:px-4  w-full h-[4rem] flex justify-between items-center bg-[#F9F9F9]">
        <div className="w-full flex flex-row gap-2 items-center">
          <div className="">
            <img
              src="/images/logo.svg"
              alt="logo"
              className=" sm:h-[1.5rem] md:h-[2rem]"
            />
          </div>
        </div>
        <div className="flex flex-row gap-4 items-center text-[#777777]">
          <span>
            <HiViewGrid className="text-xl sm:hidden md:block" />
          </span>
          <span>
            <IoNotificationsSharp className="text-xl sm:hidden md:block" />
          </span>
          <span ref={profileImageRef} className="sm:w-[3rem] lg:w-fit">
            <img
              src="/images/profile.svg"
              alt=""
              className="h-[2.3rem] cursor-pointer"
              onClick={toggleProfileDropdown}
            />
            {isProfileDropdownOpen && (
              <div
                ref={profileDropdownRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
              >
                <div className="px-4 py-2 text-gray-700">
                  <span className="block text-sm font-semibold">
                    {userName.digitalMarketername}
                  </span>
                  <span className="block text-sm">
                    {userName.organizationrole}
                  </span>
                </div>
                <div className="border-t border-gray-200"></div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 flex justify-between items-center text-left text-gray-700 hover:bg-gray-100"
                >
                  Logout
                  <IoIosLogOut />
                </button>
              </div>
            )}
          </span>
          <div
            className="text-black text-xl cursor-pointer md:hidden"
            onClick={toggleMobileSidebar}
          >
            {isMobileSidebarOpen ? <AiOutlineClose /> : <TfiMenuAlt />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalHeader;
