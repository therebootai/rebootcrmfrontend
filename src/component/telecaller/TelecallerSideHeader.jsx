import React, { useEffect, useState } from "react";
import { useLocation, Link, useParams } from "react-router-dom";

const TelecallerSideHeader = ({ isMobileSidebarOpen, closeMobileSidebar }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const location = useLocation();
  const { telecallerId } = useParams();

  const sideheader = [
    {
      icon: "/images/home.svg",
      name: "Dashboard",
      link: `/telecaler/telecaller-dashboard/${telecallerId}`,
      links: [],
    },
    {
      icon: "/images/lead.svg",
      name: "Business",
      link: `/telecaler/business/${telecallerId}`,
      links: [],
    },

    {
      icon: "/images/broadcast.svg",
      name: "Achievements",
      link: `/telecaler/achivement/${telecallerId}`,
      links: [],
    },
    {
      icon: "/images/support.svg",
      name: "Calling Data",
      link: `/telecaler/calling-data/${telecallerId}`,
      links: [],
    },
    {
      icon: "/images/sales.svg",
      name: "Proposal",
      link: ``,
      links: [],
    },
  ];

  const handleIconClick = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null); // Collapse if clicked again
    } else {
      setActiveIndex(index);
    }
  };

  // Reset active index when the sidebar is closed
  useEffect(() => {
    if (!isMobileSidebarOpen) {
      setActiveIndex(null);
    }
  }, [isMobileSidebarOpen]);

  // Handle mouse leave for the entire sidebar
  useEffect(() => {
    const handleMouseLeave = () => {
      setHoveredIndex(null);
      setActiveIndex(null);
      setIsSidebarHovered(false);
    };

    const sidebarElement = document.getElementById("admin-sidebar");
    sidebarElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      sidebarElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      id="admin-sidebar"
      className={`absolute flex flex-col gap-4 h-full bg-gray-200 transition-all duration-300 z-50 ${
        isMobileSidebarOpen ? "block" : "hidden"
      } md:flex ${isSidebarHovered || activeIndex !== null ? "w-64" : "w-16"}`}
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
    >
      {sideheader.map((item, index) => (
        <div
          key={index}
          className="relative flex flex-col items-start"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => handleIconClick(index)}
        >
          <div
            className={`flex items-center p-2 rounded-lg w-full ${
              hoveredIndex === index || activeIndex === index
                ? "bg-gray-300"
                : "bg-transparent"
            }`}
            style={{
              transition: "background-color 0.5s ease, width 0.5s ease",
            }}
          >
            <img
              src={item.icon}
              alt={item.name}
              className="h-[1.3rem] w-[1.3rem] mx-2"
            />
            {(isSidebarHovered || activeIndex !== null) && (
              <Link
                to={item.link}
                className={`text-[#777777] cursor-pointer ml-2 ${
                  location.pathname === item.link
                    ? "text-[#FF2722]"
                    : "text-[#777777]"
                }`}
              >
                {item.name}
              </Link>
            )}
          </div>

          {/* Links Dropdown */}
          <div
            className={`flex flex-col w-full ml-4 overflow-hidden ease-in-out ${
              activeIndex === index ? "max-h-screen" : "max-h-0"
            }`}
            style={{
              transform: activeIndex === index ? "scaleY(1)" : "scaleY(0)",
              transformOrigin: "top",
              transition: "transform 0.5s ease, max-height 0.9s ease",
            }}
          >
            {item.links.map((link, linkIndex) => (
              <Link
                key={linkIndex}
                to={link.link}
                className={`pl-10 py-2 transition-all duration-1000 ease-in-out ${
                  location.pathname === link.link
                    ? "text-[#FF2722]"
                    : "text-[#777777]"
                }`}
                style={{
                  transform:
                    activeIndex === index
                      ? "translateY(0)"
                      : "translateY(-10px)",
                  opacity: activeIndex === index ? 1 : 0,
                  transition:
                    "transform 0.5s ease, opacity 0.5s ease, color 0.3s ease",
                }}
                onClick={closeMobileSidebar} // Close sidebar on link click
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TelecallerSideHeader;
