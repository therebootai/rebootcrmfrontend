import axios from "axios";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AiOutlinePlusCircle, AiOutlineDelete } from "react-icons/ai";
import SaveShowInvoicePdf from "./SaveShowInvoicePdf";
import Modal from "react-modal";

const InvoiceEdit = ({
  clientId,
  existingInvoice,
  fetchAllClients,
  setViewClient,
}) => {
  const [bdes, setBdes] = useState([]);
  const [dueDate, setDueDate] = useState(null);
  const [bdeName, setBdeName] = useState("");
  const [items, setItems] = useState([]);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [latestClientData, setLatestClientData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const bdeResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/bde/get`
      );
      setBdes(bdeResponse.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/client/get?clientId=${clientId}`
        );
        const client = response.data.data[0];
        if (client && client.bdeName) {
          setBdeName(client.bdeName._id);
        }
      } catch (error) {
        console.error("Error fetching client:", error);
      }
    };

    fetchClient();
  }, [clientId]);

  useEffect(() => {
    if (existingInvoice) {
      setDueDate(new Date(existingInvoice.dueDate));
      setItems(existingInvoice.invoiceData);
      setBdeName(existingInvoice.bdeName?._id || "");
    }
  }, [existingInvoice]);

  const validDueDate =
    dueDate instanceof Date && !isNaN(dueDate) ? dueDate : new Date();

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        serviceName: "",
        productCode: "",
        quantity: "",
        rate: "",
        amount: "",
        description: "",
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!dueDate || items.length === 0) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/client/update/${clientId}/invoice/${existingInvoice._id}`,
        {
          dueDate: dueDate.toISOString(),
          invoiceData: items,
          savePdf: null,
        }
      );

      if (response.data.success) {
        const updatedClient = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/client/get?clientId=${clientId}`
        );

        setLatestClientData(updatedClient.data.data[0]);
        setShowInvoiceModal(true);
        fetchAllClients();
        setViewClient(response.data.client);
      } else {
        alert("Failed to update invoice");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("Error updating invoice");
    }
  };

  return (
    <div className="xl:px-8 px-6 flex flex-col gap-6">
      <h1 className="border-b pb-2 border-[#cccccc] text-2xl font-medium">
        Edit Invoice
      </h1>
      <form className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label>Select Due Date</label>
            <DatePicker
              selected={validDueDate}
              onChange={(date) => setDueDate(date)}
              className="h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
              dateFormat="dd/MM/yyyy"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              placeholderText="Select Date"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Select Relationship Manager</label>
            <select
              value={bdeName}
              onChange={(e) => setBdeName(e.target.value)}
              className="h-[3.5rem] px-2 border border-[#CCCCCC] outline-none w-full"
            >
              <option value="">Choose BDE</option>
              {bdes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.bdename}
                </option>
              ))}
            </select>
          </div>
        </div>

        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 border p-2 rounded">
            <div className="flex flex-row gap-4">
              <input
                type="text"
                placeholder="Product/Service"
                className="h-[3.5rem] w-[40%] px-2 border border-[#CCCCCC] outline-none"
                value={item.serviceName}
                onChange={(e) =>
                  handleItemChange(index, "serviceName", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="P. Code"
                className="h-[3.5rem] w-[15%] px-2 border border-[#CCCCCC] outline-none"
                value={item.productCode}
                onChange={(e) =>
                  handleItemChange(index, "productCode", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Qty"
                className="h-[3.5rem] w-[15%] px-2 border border-[#CCCCCC] outline-none"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Rate"
                className="h-[3.5rem] w-[15%] px-2 border border-[#CCCCCC] outline-none"
                value={item.rate}
                onChange={(e) =>
                  handleItemChange(index, "rate", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Amount"
                className="h-[3.5rem] w-[15%] px-2 border border-[#CCCCCC] outline-none"
                value={item.amount}
                onChange={(e) =>
                  handleItemChange(index, "amount", e.target.value)
                }
              />
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Description"
                className="h-[3.5rem] w-full px-2 border border-[#CCCCCC] outline-none"
                value={item.description}
                onChange={(e) =>
                  handleItemChange(index, "description", e.target.value)
                }
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="h-[3.5rem] w-[3.5rem] bg-red-100 text-red-500 flex items-center justify-center"
                >
                  <AiOutlineDelete />
                </button>
              )}
              <button
                type="button"
                onClick={handleAddItem}
                className="h-[3.5rem] w-fit text-2xl px-6 bg-[#EFF5FF] text-[#0A5BFF] flex items-center gap-2"
              >
                <AiOutlinePlusCircle />
              </button>
            </div>
          </div>
        ))}

        <div className="flex flex-row gap-4">
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#0A5BFF] w-fit px-10 xl:px-12 h-[4rem] text-white text-lg font-medium"
          >
            Save & Preview
          </button>
          <button
            type="button"
            className="bg-[#EFF5FF] w-fit px-10 xl:px-12 h-[4rem] text-[#0A5BFF] text-lg font-medium"
          >
            Save As Draft
          </button>
        </div>
      </form>

      <Modal
        isOpen={showInvoiceModal}
        onRequestClose={() => setShowInvoiceModal(false)}
        contentLabel="View Client Modal"
        className="modal-content no-scrollbar w-fit"
        overlayClassName="modal-overlay"
      >
        <div className=" flex justify-center items-center">
          {latestClientData && (
            <SaveShowInvoicePdf
              item={latestClientData}
              fetchAllClients={fetchAllClients}
              setViewClient={setViewClient}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default InvoiceEdit;
