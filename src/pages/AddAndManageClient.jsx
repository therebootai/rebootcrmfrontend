import React, { useEffect, useState } from "react";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import Modal from "react-modal";
import AddClient from "../component/clientModule/AddClient";
import ManageClient from "../component/clientModule/ManageClient";
import axios from "axios";
const AddAndManageClient = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);
  const openModal = () => setIsModalOpen(true);
  const [allClient, setAllClients] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bdes, setBdes] = useState([]);
  const [telecalers, setTelecalers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBde, setSelectedBde] = useState("");
  const [selectedTme, setSelectedTme] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const bdeResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/bde/get`
      );
      setBdes(bdeResponse.data);
      const tmeResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/telecaller/get`
      );
      setTelecalers(tmeResponse.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchAllClients = async () => {
    try {
      setFetchLoading(true);
      const limit = 20;

      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", limit);
      params.append("search", debouncedSearch);

      if (selectedBde) params.append("bdeName", selectedBde);
      if (selectedTme) params.append("tmeLeads", selectedTme);

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/client/get?${params.toString()}`
      );

      const data = response.data;
      setAllClients(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching client:", error);
    } finally {
      setFetchLoading(false);
    }
  };
  useEffect(() => {
    fetchAllClients();
  }, [currentPage, selectedBde, selectedTme, debouncedSearch]);

  return (
    <AdminDashboardTemplate>
      <div className=" flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <div className=" flex flex-row gap-4 w-[80%]">
            <div className=" w-[50%]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Using Mobile & Business name"
                className="h-[3rem] px-2 border border-[#CCCCCC] outline-none text-sm w-full"
              />
            </div>
            <div className="w-[25%]">
              <select
                value={selectedBde}
                onChange={(e) => {
                  setSelectedBde(e.target.value);
                  setCurrentPage(1);
                }}
                className=" h-[3rem] px-2 border border-[#CCCCCC] outline-none text-sm w-full"
              >
                <option value="">Filter BDE</option>
                {bdes.map((item) => (
                  <option value={item._id}>{item.bdename}</option>
                ))}
              </select>
            </div>
            <div className="w-[25%]">
              <select
                value={selectedTme}
                onChange={(e) => {
                  setSelectedTme(e.target.value);
                  setCurrentPage(1);
                }}
                className=" h-[3rem] px-2 border border-[#CCCCCC] outline-none text-sm w-full "
              >
                <option value="">Filter TME</option>
                {telecalers.map((item) => (
                  <option value={item._id}>{item.telecallername}</option>
                ))}
              </select>
            </div>
          </div>
          <div className=" flex flex-row gap-2 items-center">
            <button
              onClick={openModal}
              className=" h-[2.5rem] w-fit px-4 flex justify-center items-center bg-[#0A5BFF] text-white rounded-md"
            >
              + Add
            </button>
          </div>
        </div>
        <div>
          <ManageClient
            allClient={allClient}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            fetchAllClients={fetchAllClients}
            fetchLoading={fetchLoading}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Business Modal"
        className="modal-content no-scrollbar"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        <AddClient closeModal={closeModal} fetchAllClients={fetchAllClients} />
      </Modal>
    </AdminDashboardTemplate>
  );
};

export default AddAndManageClient;
