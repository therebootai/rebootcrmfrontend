import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import Modal from "react-modal";

import AddCandidate from "../component/adminbuisness/AddCandidate";
import ManageCandidate from "../component/adminbuisness/ManageCandidate";

const AddAndManageCandidate = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [city, setCity] = useState("");
  const [interestPost, setInterestPost] = useState("");
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState("");
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueInterestPosts, setUniqueInterestPosts] = useState([]);
  
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [uniqueRatings, setUniqueRatings] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNewCandidates = (newCandidates) => {
    setCandidates((prevCandidates) => [...prevCandidates, newCandidates]);
    closeModal();
  };

  const fetchAllCandidates = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/candidate/get`
      );
      const data = response.data;
      setCandidates(data);
      setFilteredCandidates(data); // Initially show all candidates
      setUniqueFilters(data); // Set unique filter options
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const setUniqueFilters = (data) => {
    const cities = [...new Set(data.map((item) => item.city))];
    const interestPosts = [...new Set(data.map((item) => item.interestPost))];
    const statuses = [...new Set(data.map((item) => item.status))];
    const ratings = [...new Set(data.map((item) => item.rating))];
    setUniqueCities(cities);
    setUniqueInterestPosts(interestPosts);
    setUniqueStatuses(statuses);
    setUniqueRatings(ratings);
  };

  const applyFilters = () => {
    let filteredData = candidates;

    if (city) {
      filteredData = filteredData.filter(
        (candidate) => candidate.city === city
      );
    }
    if (interestPost) {
      filteredData = filteredData.filter(
        (candidate) => candidate.interestPost === interestPost
      );
    }
    if (status) {
      filteredData = filteredData.filter(
        (candidate) => candidate.status === status
      );
    }
    if (rating) {
      filteredData = filteredData.filter(
        (candidate) => candidate.rating === rating
      );
    }

    setFilteredCandidates(filteredData);
  };

  useEffect(() => {
    fetchAllCandidates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [city, interestPost, status, rating]);

  return (
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-4 p-4">
        <div className="py-6 flex border-b border-[#cccccc] items-center flex-wrap gap-6">
          <span className="text-lg font-semibold text-[#777777]">Filter</span>

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
              name="interestPost"
              value={interestPost}
              onChange={(e) => setInterestPost(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Interest Posts</option>
              {uniqueInterestPosts.map((post, index) => (
                <option key={index} value={post}>
                  {post}
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

          <div>
            <select
              name="rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="px-4 p-1 border border-[#cccccc] text-sm rounded-md"
            >
              <option value="">All Ratings</option>
              {uniqueRatings.map((rate, index) => (
                <option key={index} value={rate}>
                  {rate}
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
          <ManageCandidate candidates={filteredCandidates} />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Candidate Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        <AddCandidate onAddCandidates={handleNewCandidates} />
      </Modal>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageCandidate;
