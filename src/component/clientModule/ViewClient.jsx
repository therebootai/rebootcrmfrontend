import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { TbEdit } from "react-icons/tb";
import axios from "axios";
import { BiCheckCircle, BiEditAlt, BiSolidEditAlt } from "react-icons/bi";
import SidePopUpSlider from "./SidePopupSlider";
import InvoiceCreate from "./InvoiceCreate";
import { MdDelete } from "react-icons/md";
import InvoiceEdit from "./InvoiceEdit";
import Modal from "react-modal";
import SaveShowInvoicePdf from "./SaveShowInvoicePdf";
import { toast } from "react-toastify";

const ViewClient = ({ viewClient, setViewClient, fetchAllClients }) => {
  const [amountToEdit, setAmountToEdit] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [monthlyService, setMonthlyService] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [newServiceName, setNewServiceName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);

  const [popupKey, setPopupKey] = useState(0);
  const closeModal = () => setIsModalOpen(false);
  const closeModalEdit = () => setIsModalOpenEdit(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  function openModal() {
    setPopupKey((k) => k + 1);
    setIsModalOpen(true);
  }

  function openModalEdit(invoice = null) {
    setSelectedInvoice(invoice);
    setPopupKey((k) => k + 1);
    setIsModalOpenEdit(true);
  }

  function openModalView(invoice = null) {
    setSelectedInvoice(invoice); // Set the selected invoice for viewing

    setShowInvoiceModal(true);
  }

  const calculateTotalClearedAmount = () => {
    return viewClient.cleardAmount.reduce(
      (total, item) => total + item.amount,
      0
    );
  };

  const calculateDueAmount = () => {
    const totalClearedAmount = calculateTotalClearedAmount();
    return viewClient.dealAmount - totalClearedAmount;
  };

  const handleEditAmount = (item) => {
    setAmountToEdit(item);
    setNewAmount(item.amount);
  };

  const handleSaveEditAmount = async () => {
    if (!newAmount) {
      alert("Amount cannot be empty");
      return;
    }

    const updatedClearedAmount = viewClient.cleardAmount.map((item) =>
      item._id === amountToEdit._id ? { ...item, amount: newAmount } : item
    );

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/client/update/${
          viewClient.clientId
        }`,
        { cleardAmount: updatedClearedAmount }
      );
      setViewClient(response.data.client);
      setAmountToEdit(null);
      setNewAmount("");
      fetchAllClients();
    } catch (error) {
      console.error("Error updating amount", error);
      alert("Error updating amount");
    }
  };

  // Handle Add Amount (Plus button)
  const handleAddAmount = async () => {
    const newClearedAmount = {
      amount: newAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingAmount = viewClient.cleardAmount.find(
      (item) => item.amount === newClearedAmount.amount
    );

    if (existingAmount) {
      alert("This amount already exists in the cleared amounts list.");
      return;
    }

    const updatedClearedAmount = [...viewClient.cleardAmount, newClearedAmount];

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/client/update/${
          viewClient.clientId
        }`,
        { cleardAmount: updatedClearedAmount }
      );
      setViewClient(response.data.client);
      setNewAmount("");
      fetchAllClients();
    } catch (error) {
      console.error("Error adding amount", error);
      alert("Error adding amount");
    }
  };

  const handleAddMonthlyPayment = async () => {
    if (!monthlyService || !monthlyAmount) {
      alert("Service and amount are required");
      return;
    }

    const newPayment = {
      serviceName: monthlyService,
      totalAmount: Number(monthlyAmount),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedMonthlyPayments = [
      ...viewClient.monthlyPaymentAmount,
      newPayment,
    ];

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/client/update/${
          viewClient.clientId
        }`,
        { monthlyPaymentAmount: updatedMonthlyPayments }
      );

      setViewClient(response.data.client);
      setMonthlyService("");
      setMonthlyAmount("");
      fetchAllClients();
    } catch (error) {
      console.error("Error saving monthly payment", error);
      alert("Failed to save monthly payment");
    }
  };

  const handleEditMonthlyPayment = (item) => {
    setIsEditing(true);
    setEditedItem(item);
    setNewServiceName(item.serviceName);
    setNewAmount(item.totalAmount);
  };

  const handleSaveEditMonthlyPayment = async () => {
    if (!newServiceName || !newAmount) {
      alert("Service name and amount cannot be empty");
      return;
    }

    const updatedMonthlyPayments = viewClient.monthlyPaymentAmount.map((item) =>
      item._id === editedItem._id
        ? {
            ...item,
            serviceName: newServiceName,
            totalAmount: Number(newAmount),
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        : item
    );

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/client/update/${
          viewClient.clientId
        }`,
        { monthlyPaymentAmount: updatedMonthlyPayments }
      );

      setViewClient(response.data.client);
      setIsEditing(false);
      setEditedItem(null);
      setNewServiceName("");
      setNewAmount("");
      fetchAllClients();
    } catch (error) {
      console.error("Error updating monthly payment", error);
      alert("Error updating monthly payment");
    }
  };

  const deleteInvoice = async (invoiceId) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete"?`);

    if (!confirmDelete) return;
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/client/delete/${
          viewClient.clientId
        }/invoice/${invoiceId}`
      );

      if (response.data.success) {
        fetchAllClients();
        setViewClient(response.data.client);
      } else {
        alert("Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice", error);
      alert("Error deleting invoice");
    }
  };

  const handleShare = async (invoice) => {
    const confirmShare = window.confirm(
      `Are you sure you want to share this invoice?`
    );

    if (!confirmShare) return;
    if (!invoice) {
      console.error("No template selected");
      toast.error("Please select a template before submitting.", {
        position: "bottom-center",
        icon: "❌",
      });
      return;
    }

    const subtotal =
      invoice.invoiceData?.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      ) || 0;

    const previousPayment = invoice.previousPayment
      ? Number(invoice.previousPayment)
      : 0;

    const total = subtotal - previousPayment;

    const formattedPhoneNumber =
      viewClient.businessNameDoc?.mobileNumber.startsWith("91")
        ? viewClient.businessNameDoc?.mobileNumber
        : "91" + viewClient.businessNameDoc?.mobileNumber;

    const payload = {
      "auth-key": "aa61059c453fd7b25e02a9dec860e9c4e23834a61d1d26de4b",
      "app-key": "0f71de7c-53dc-4793-9469-96356a6a2e4a",
      destination_number: formattedPhoneNumber,
      template_id: "1802416130617430",
      device_id: "67599f6c1c50a6c971f41728",
      language: "en",
      variables: [
        viewClient.businessNameDoc?.buisnessname.toString(),
        total.toString(),
      ],
      media: invoice.savePdf.secure_url,
    };

    try {
      const response = await axios.post(
        "https://web.wabridge.com/api/createmessage",
        payload
      );
      if (response.data.status === true) {
        toast.success("Message sent successfully!", {
          position: "bottom-center",
          icon: "✅",
        });
      } else {
        toast.error("Failed to send message.", {
          position: "bottom-center",
          icon: "❌",
        });
      }
    } catch (error) {
      console.error("There was an error sending the message!", error);
      toast.error("An error occurred while sending the message.", {
        position: "bottom-center",
        icon: "❌",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-medium text-[#777777] border-b-2 border-[#cccccc]">
        Client Details
      </h2>
      <div className=" flex flex-row gap-4">
        <div className=" w-[50%] flex flex-col gap-6">
          <p>
            <strong>Client Id:</strong> {viewClient.clientId}
          </p>
          <p>
            <strong>Business Name:</strong>{" "}
            {viewClient.businessNameDoc?.buisnessname ||
              viewClient.businessName?.buisnessname}
          </p>
          <p>
            <strong>Mobile Number:</strong>{" "}
            {viewClient.businessNameDoc?.mobileNumber ||
              viewClient.businessName?.mobileNumber}
          </p>
          <p>
            <strong>Service Taken:</strong> {viewClient.serviceTaken}
          </p>
          <p>
            <strong>Website:</strong> {viewClient.website}
          </p>
          <p>
            <strong>Expire Date:</strong>{" "}
            {viewClient.expiryDate
              ? new Date(viewClient.expiryDate).toLocaleDateString("en-GB")
              : ""}
          </p>
          <p>
            <strong>BDE Name:</strong> {viewClient.bdeName?.bdename}
          </p>
          <p>
            <strong>TME Name:</strong> {viewClient.tmeLeads?.telecallername}
          </p>
          <p>
            <strong>Remarks:</strong> {viewClient.remarks || ""}
          </p>
          <p>
            <strong>Deal Amount:</strong> ₹ {viewClient.dealAmount}
          </p>

          <div className="flex flex-col gap-4">
            <div className=" flex flex-row gap-4 items-center">
              <strong className=" text-nowrap">Cleared:</strong>
              <div className="flex flex-row gap-4 items-center w-full">
                <div className=" w-[80%]">
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Enter Cleared amount"
                    className="h-[3rem] px-2 border border-[#CCCCCC] outline-none w-full text-sm"
                  />
                </div>
                <button
                  onClick={handleAddAmount}
                  className=" h-[3rem] w-[3rem] text-2xl  flex justify-center items-center bg-[#EFF5FF] text-[#0A5BFF]"
                >
                  <AiOutlinePlusCircle />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 xlg:grid-cols-2 gap-4">
              {viewClient.cleardAmount && viewClient.cleardAmount.length > 0
                ? viewClient.cleardAmount.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 flex flex-col gap-2 border border-[#cccccc]"
                    >
                      <div className="flex justify-between items-center">
                        {amountToEdit && amountToEdit._id === item._id ? (
                          <>
                            <input
                              type="number"
                              value={newAmount}
                              onChange={(e) => setNewAmount(e.target.value)}
                              className="text-lg ml-2 font-semibold text-[#00D23B] h-[2.5rem] border border-[#cccccc] outline-none w-[80%]"
                            />
                            <button
                              onClick={handleSaveEditAmount}
                              className="h-[3rem] w-[3rem] text-2xl rounded-md flex justify-center items-center bg-[#EFF5FF] text-[#0A5BFF]"
                            >
                              <BiCheckCircle />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-xl font-semibold text-[#00D23B]">
                              ₹{item.amount}
                            </span>
                            <button
                              onClick={() => handleEditAmount(item)}
                              className="h-[3rem] w-[3rem] text-2xl rounded-md flex justify-center items-center bg-[#EFF5FF] text-[#0A5BFF]"
                            >
                              <TbEdit />
                            </button>{" "}
                          </>
                        )}
                      </div>
                      <div className="text-xs font-medium text-[#666666]">
                        {new Date(item.updatedAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </div>
                  ))
                : ""}
            </div>
          </div>

          <p>
            <strong>Due:</strong> ₹ {calculateDueAmount()}
          </p>

          <p>
            <strong>Total Value:</strong> ₹ {viewClient.totalAmount}
          </p>

          <div className="flex flex-col  gap-4">
            <strong className="text-nowrap">Other Monthly Payments:</strong>
            <div className=" flex flex-row gap-4">
              <div className=" w-[50%] ">
                <input
                  type="text"
                  placeholder="Product/Service"
                  value={monthlyService}
                  onChange={(e) => setMonthlyService(e.target.value)}
                  className="h-[3rem] px-2 border border-[#CCCCCC] outline-none w-full text-sm "
                />
              </div>
              <div className="w-[40%] ">
                <input
                  type="text"
                  placeholder="Amount"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  className="h-[3rem] px-2 border border-[#CCCCCC] outline-none w-full text-sm "
                />
              </div>
              <button
                onClick={handleAddMonthlyPayment}
                className=" h-[3rem] w-[3rem] text-2xl  flex justify-center items-center bg-[#EFF5FF] text-[#0A5BFF]"
              >
                <AiOutlinePlusCircle />
              </button>
            </div>
          </div>
          <div className="pt-2 border-t border-[#cccccc]">
            {viewClient.monthlyPaymentAmount &&
            viewClient.monthlyPaymentAmount.length > 0 ? (
              <ul className=" grid grid-cols-2  gap-4 ">
                {viewClient.monthlyPaymentAmount.map((item, index) => (
                  <div
                    key={index}
                    className=" p-4 flex flex-col gap-2 border border-[#cccccc]"
                  >
                    <div className=" flex justify-between items-center">
                      <div className=" text-xl xlg:text-2xl font-semibold text-[#00D23B]">
                        {isEditing && editedItem._id === item._id ? (
                          <input
                            type="number"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            className="text-lg ml-2 font-semibold text-[#00D23B] h-[2.5rem] border border-[#cccccc] outline-none w-[80%]"
                          />
                        ) : (
                          <span>₹ {item.totalAmount}</span>
                        )}
                      </div>
                      {isEditing && editedItem._id === item._id ? (
                        <button
                          onClick={handleSaveEditMonthlyPayment}
                          className="xlg:size-[3rem] size-[2.5rem] text-xl xlg:text-2xl rounded-md flex justify-center items-center bg-[#EFF5FF] text-[#0A5BFF]"
                        >
                          <BiCheckCircle />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditMonthlyPayment(item)}
                          className="xlg:size-[3rem] size-[2.5rem] text-xl xlg:text-2xl rounded-md flex justify-center items-center bg-[#EFF5FF] text-[#0A5BFF]"
                        >
                          <BiSolidEditAlt />
                        </button>
                      )}
                    </div>
                    <div className=" text-lg font-medium text-[#333333]">
                      {isEditing && editedItem._id === item._id ? (
                        <input
                          type="text"
                          value={newServiceName}
                          onChange={(e) => setNewServiceName(e.target.value)}
                          className="text-lg font-medium  h-[2.5rem] border border-[#cccccc] text-[#333333] outline-none w-full"
                        />
                      ) : (
                        item.serviceName
                      )}
                    </div>

                    <div className="xlg:text-sm text-xs font-medium text-[#666666]">
                      {new Date(item.updatedAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                  </div>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No monthly payments added yet.
              </p>
            )}
          </div>
        </div>
        <div className=" w-[50%] flex flex-col gap-4">
          <div className=" flex justify-end items-end">
            <button
              onClick={openModal}
              className=" h-[2.5rem] w-fit px-4 flex justify-center items-center bg-[#0A5BFF] text-white rounded-md"
            >
              + Add
            </button>
          </div>
          <div className=" grid grid-cols-1 xlg:grid-cols-2 gap-4">
            {viewClient.invoice?.map((inv, index) =>
              inv.savePdf?.secure_url ? (
                <div className=" flex flex-col gap-1 border border-[#cccccc] rounded-md p-3">
                  <iframe
                    key={inv._id || index}
                    src={inv.savePdf.secure_url}
                    title={`Invoice PDF ${index + 1}`}
                    width="100%"
                    className="] rounded h-[12rem]"
                  ></iframe>
                  <div className=" flex justify-between items-center">
                    <div className=" text-[10px] xl:text-xs font-medium text-[#666666]">
                      {inv.invoiceNumber}
                    </div>
                    <div className=" flex flex-row gap-2 items-center">
                      <button
                        onClick={() => openModalEdit(inv)}
                        className=" w-fit px-2 h-[2rem] text-lg flex justify-center items-center bg-[#EFF5FF] text-[#0A5BFF]"
                      >
                        <BiEditAlt />
                      </button>
                      <button
                        onClick={() => deleteInvoice(inv._id)}
                        className=" w-fit px-2 h-[2rem] text-lg flex justify-center items-center bg-red-100 text-red-500"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                  <div className=" grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleShare(inv)}
                      className="  h-[2rem]  rounded-md text-[10px] xl:text-xs flex justify-center items-center bg-[#0A5BFF] text-white"
                    >
                      Share Invoice
                    </button>
                    <button
                      onClick={() => openModalView(inv)}
                      className="  h-[2rem]  rounded-md text-[10px] xl:text-xs flex justify-center items-center bg-[#EFF5FF] text-[#0A5BFF]"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
      <SidePopUpSlider showPopUp={isModalOpen} handleClose={closeModal}>
        <InvoiceCreate
          clientId={viewClient.clientId}
          fetchAllClients={fetchAllClients}
          setViewClient={setViewClient}
          key={popupKey}
        />
      </SidePopUpSlider>

      <SidePopUpSlider showPopUp={isModalOpenEdit} handleClose={closeModalEdit}>
        <InvoiceEdit
          clientId={viewClient.clientId}
          existingInvoice={selectedInvoice}
          fetchAllClients={fetchAllClients}
          setViewClient={setViewClient}
          key={popupKey}
        />
      </SidePopUpSlider>
      <Modal
        isOpen={showInvoiceModal}
        onRequestClose={() => setShowInvoiceModal(false)}
        contentLabel="View Client Modal"
        className="modal-content no-scrollbar w-fit"
        overlayClassName="modal-overlay"
      >
        <div className="flex justify-center items-center">
          {selectedInvoice && (
            <SaveShowInvoicePdf
              item={viewClient}
              invoices={selectedInvoice}
              fetchAllClients={fetchAllClients}
              savePdf={false}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ViewClient;
