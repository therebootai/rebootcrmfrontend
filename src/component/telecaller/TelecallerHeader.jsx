import React, { useEffect, useState, useRef } from "react";
import { HiViewGrid } from "react-icons/hi";
import { IoNotificationsSharp } from "react-icons/io5";
import { TfiMenuAlt } from "react-icons/tfi";
import { IoIosLogOut } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AiOutlineClose } from "react-icons/ai";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const TelecallerHeader = ({
  toggleMobileSidebar,
  isMobileSidebarOpen,
  hideHeader,
}) => {
  // Correctly destructuring props
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileImageRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const { telecallerId } = useParams();
  const [userName, setUserName] = useState("");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    setUserName(user);
  }, [user]);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
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
                    {userName.name}
                  </span>
                  <span className="block text-sm">{userName.designation}</span>
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

export default TelecallerHeader;
