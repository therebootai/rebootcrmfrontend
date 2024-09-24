import React, { useState, useEffect } from "react";
import axios from "axios";

import Modal from "react-modal";
import TelecallerDashboardTemplate from "../../template/TelecallerDashboardTemplate";
import AddBuisness from "../../component/adminbuisness/AddBuisness";
import ManageBusiness from "../../component/adminbuisness/ManageBusiness";

const TelecallerBusiness = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNewBusiness = (newBusinessResponse) => {
    const newBusiness = newBusinessResponse.newBusiness;

    // Update the allBusinesses state with the new business
    const updatedBusinesses = [...allBusinesses, newBusiness];

    // Update states with the new business data and reapply filters
    setAllBusinesses(updatedBusinesses);
    setFilteredBusinesses(applyFilters(updatedBusinesses));
    setUniqueFilters(updatedBusinesses);

    closeModal();
  };

  const fetchAllBusinesses = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/business/get`
      );
      const data = response.data;
      setAllBusinesses(data);
      setFilteredBusinesses(data);
      setUniqueFilters(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  const setUniqueFilters = (data) => {
    const cities = [...new Set(data.map((item) => item.city))];
    const categories = [...new Set(data.map((item) => item.category))];
    const statuses = [...new Set(data.map((item) => item.status))];
    setUniqueCities(cities);
    setUniqueCategories(categories);
    setUniqueStatuses(statuses);
  };

  const applyFilters = (data) => {
    let filteredData = data;

    if (mobileNumber) {
      filteredData = filteredData.filter((business) =>
        business.mobileNumber.includes(mobileNumber)
      );
    }
    if (city) {
      filteredData = filteredData.filter((business) => business.city === city);
    }
    if (category) {
      filteredData = filteredData.filter(
        (business) => business.category === category
      );
    }
    if (status) {
      filteredData = filteredData.filter(
        (business) => business.status === status
      );
    }

    return filteredData;
  };

  // Fetch all businesses when the component mounts
  useEffect(() => {
    fetchAllBusinesses();
  }, []);

  // Apply filters when the filter values or allBusinesses data changes
  useEffect(() => {
    setFilteredBusinesses(applyFilters(allBusinesses));
    setCurrentPage(1);
  }, [mobileNumber, city, category, status, allBusinesses]);

  return (
    <TelecallerDashboardTemplate>
      <div className="flex flex-col gap-4 p-4">
        <div className="py-6 flex border-b border-[#cccccc] items-center flex-wrap gap-6">
          <span className="text-lg font-semibold text-[#777777]">Filter</span>
          <div>
            <input
              type="number"
              placeholder="Search using number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md text-[#FF2722]"
            />
          </div>
          <div>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Cities</option>
              {uniqueCities.map((cty, index) => (
                <option key={index} value={cty}>
                  {cty}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map((sts, index) => (
                <option key={index} value={sts}>
                  {sts}
                </option>
              ))}
            </select>
          </div>
          <div
            className="px-2 p-1 bg-[#FF2722] text-white rounded-md text-sm font-medium cursor-pointer"
            onClick={openModal}
          >
            ADD
          </div>
        </div>
        <div>
          <ManageBusiness businesses={filteredBusinesses} showdelete={true} />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Business Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        <AddBuisness onAddBusiness={handleNewBusiness} />
      </Modal>
    </TelecallerDashboardTemplate>
  );
};

export default TelecallerBusiness;
