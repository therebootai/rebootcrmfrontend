import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const AdminSideHeader = ({ isMobileSidebarOpen, closeMobileSidebar }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const location = useLocation();

  const sideheader = [
    {
      icon: "/images/home.svg",
      name: "Dashboard",
      links: [{ name: "Dashboard", link: "/admin/dashboard" }],
    },
    {
      icon: "/images/lead.svg",
      name: "Business",
      links: [
        {
          name: "Add & Manage Business",
          link: "/admin/business/add-manage-business",
        },
        {
          name: "Add & Manage City/Town",
          link: "/admin/business/add-manage-city-town",
        },
        {
          name: "Add & Manage Category",
          link: "/admin/business/add-manage-categories",
        },
        {
          name: "Add & Manage Source",
          link: "/admin/business/add-manage-source",
        },
      ],
    },
    {
      icon: "/images/hricon.svg",
      name: "HR",
      links: [
        {
          name: "Add/Manage Candidate",
          link: "/admin/hr/add-manage-candidate",
        },
        {
          name: "Add/Manage Employee",
          link: "/admin/hr/add-manage-employees",
        },
      ],
    },
    {
      icon: "/images/user.svg",
      name: "User",
      links: [
        { name: "Add & Manage User", link: "/admin/user/add-manage-user" },
        {
          name: "Add & Manage Assign Business",
          link: "/admin/user/add-manage-assign-business",
        },
      ],
    },
    {
      icon: "/images/sales.svg",
      name: "Sales",
      links: [
        { name: "Sales Dashboard", link: "/admin/dashboard" },
        { name: "Proposal", link: "/admin/sales/proposal" },
        {
          name: "Add/Manage Target",
          link: "/admin/sales/add-manage-target",
        },
      ],
    },
    {
      icon: "/images/weblead.svg",
      name: "Weblead",
      links: [{ name: "Website Lead", link: "" }],
    },
    {
      icon: "/images/broadcast.svg",
      name: "Broadcast",
      links: [
        { name: "Marketing", link: "/admin/brodcast/marketing" },
        {
          name: "Single Massage",
          link: "/admin/brodcast/single-massage",
        },
      ],
    },
    {
      icon: "/images/support.svg",
      name: "Support",
      links: [{ name: "Support", link: "" }],
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
              <span className="text-[#777777] cursor-pointer ml-2">
                {item.name}
              </span>
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

export default AdminSideHeader;
