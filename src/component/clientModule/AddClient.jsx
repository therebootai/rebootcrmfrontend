import axios from "axios";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddClient = ({ closeModal, existingData = null, fetchAllClients }) => {
  const [bdes, setBdes] = useState([]);
  const [telecalers, setTelecalers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [clearedAmountInput, setClearedAmountInput] = useState("");

  const [formData, setFormData] = useState({
    businessName: "",
    serviceTaken: "",
    website: "",
    expiryDate: "",
    address: "",
    pincode: "",
    gstNo: "",
    bdeName: "" || null,
    tmeLeads: "" || null,
    dealAmount: "",
    cleardAmount: [],
  });

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
    if (searchQuery.length > 1) {
      const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/api/business/getsearch?search=${searchQuery}`
          );
          setSuggestions(response.data);
        } catch (error) {
          console.error("Error fetching businesses:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (existingData) {
      setFormData({
        businessName: existingData.businessNameDoc._id || "",
        serviceTaken: existingData.serviceTaken || "",
        website: existingData.website || "",
        expiryDate: existingData.expiryDate
          ? new Date(existingData.expiryDate)
          : "",
        address: existingData.address || "",
        pincode: existingData.pincode || "",
        gstNo: existingData.gstNo || "",
        bdeName: existingData.bdeName?._id || "",
        tmeLeads: existingData.tmeLeads?._id || "",
        dealAmount: existingData.dealAmount || "",
        cleardAmount: existingData.cleardAmount || [],
      });
      setSearchQuery(
        `${existingData.businessNameDoc.buisnessname} - ${existingData.businessNameDoc.mobileNumber}`
      );
    }
  }, [existingData]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(`${suggestion.buisnessname} - ${suggestion.mobileNumber}`);
    setFormData((prevData) => ({
      ...prevData,
      businessName: suggestion._id,
    }));
    setSu;
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "cleardAmount") {
      setClearedAmountInput(value);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalFormData = { ...formData };

    if (clearedAmountInput && clearedAmountInput > 0) {
      const currentDate = new Date();
      const newClearedAmount = {
        amount: Number(clearedAmountInput),
        month: currentDate.toLocaleString("default", { month: "long" }),
        year: currentDate.getFullYear(),
      };

      finalFormData = {
        ...formData,
        cleardAmount: [...formData.cleardAmount, newClearedAmount],
      };
    }

    try {
      if (existingData) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/client/update/${
            existingData.clientId
          }`,
          formData
        );
        alert("Client updated successfully!");
      } else {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/client/create`,
          finalFormData
        );
        alert("Client created successfully!");
      }

      setFormData({
        businessName: "",
        serviceTaken: "",
        website: "",
        expiryDate: "",
        address: "",
        pincode: "",
        gstNo: "",
        bdeName: "",
        tmeLeads: "",
        dealAmount: "",
        cleardAmount: [],
      });
      setClearedAmountInput("");
      closeModal();
      fetchAllClients();
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Error creating client!");
    }
  };
  return (
    <div className="p-4 flex flex-col w-full gap-6">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className=" grid grid-cols-2 gap-4">
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="" className=" text-sm text-[#333333] font-medium">
              Search Name / Mobile Number
            </label>
            <div className=" flex flex-col">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                id="searchQuery"
                className="h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
              />
              {suggestions.length > 0 && (
                <div className="suggestions-list shadow-lg rounded-b-md bg-slate-50 p-2  max-h-40 overflow-y-auto">
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : (
                    suggestions.map((item) => (
                      <div
                        key={item._id}
                        className="suggestion-item p-2 cursor-pointer"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        {item.buisnessname} - {item.mobileNumber}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="" className=" text-sm text-[#333333] font-medium">
              Service Taken
            </label>
            <input
              type="text"
              id="serviceTaken"
              name="serviceTaken"
              value={formData.serviceTaken}
              onChange={handleInputChange}
              className=" h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
            />
          </div>{" "}
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="" className=" text-sm text-[#333333] font-medium">
              Website
            </label>
            <input
              type="text"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className=" h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
            />
          </div>{" "}
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="" className=" text-sm text-[#333333] font-medium">
              Expiry Date
            </label>
            <DatePicker
              id="expiryDate"
              name="expiryDate"
              selected={formData.expiryDate}
              onChange={(date) =>
                handleInputChange({
                  target: { name: "expiryDate", value: date },
                })
              }
              className="h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
              dateFormat="dd/MM/yyyy"
              showMonthDropdown={true}
              showYearDropdown={true}
              dropdownMode="select"
              placeholderText="Select Date"
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-1">
          <label htmlFor="" className=" text-sm text-[#333333] font-medium">
            Adress
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className=" h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
          />
        </div>
        <div className=" grid grid-cols-2 gap-4">
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="" className=" text-sm text-[#333333] font-medium">
              Pin Code
            </label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              className=" h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
            />
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="" className=" text-sm text-[#333333] font-medium">
              GST No
            </label>
            <input
              type="text"
              id="gstNo"
              name="gstNo"
              value={formData.gstNo}
              onChange={handleInputChange}
              className=" h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
            />
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="" className=" text-sm text-[#333333] font-medium">
              BDE Name
            </label>
            <select
              id="bdeName"
              name="bdeName"
              value={formData.bdeName}
              onChange={handleInputChange}
              className=" h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
            >
              <option value="">Choose BDE</option>
              {bdes.map((item) => (
                <option value={item._id}>{item.bdename}</option>
              ))}
            </select>
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="" className=" text-sm text-[#333333] font-medium">
              TME Name
            </label>
            <select
              id="tmeLeads"
              name="tmeLeads"
              value={formData.tmeLeads}
              onChange={handleInputChange}
              className=" h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
            >
              <option value="">Choose TME</option>
              {telecalers.map((item) => (
                <option value={item._id}>{item.telecallername}</option>
              ))}
            </select>
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="" className=" text-sm text-[#333333] font-medium">
              Deal Amount
            </label>
            <input
              type="text"
              id="dealAmount"
              name="dealAmount"
              value={formData.dealAmount}
              onChange={handleInputChange}
              className=" h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
            />
          </div>
          {existingData ? (
            ""
          ) : (
            <div className="w-full flex flex-col gap-1">
              <label htmlFor="" className=" text-sm text-[#333333] font-medium">
                Cleared
              </label>
              <input
                type="text"
                id="cleardAmount"
                name="cleardAmount"
                value={clearedAmountInput}
                onChange={handleInputChange}
                className="h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded mt-4"
        >
          {existingData ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
};

export default AddClient;
