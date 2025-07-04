import React, { useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { TbEdit } from "react-icons/tb";
import axios from "axios";
import { BiCheckCircle, BiSolidEditAlt } from "react-icons/bi";

const ViewClient = ({ viewClient, setViewClient, fetchAllClients }) => {
  const [amountToEdit, setAmountToEdit] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [monthlyService, setMonthlyService] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [newServiceName, setNewServiceName] = useState("");

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

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-medium text-[#777777] border-b-2 border-[#cccccc]">
        Client Details
      </h2>
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
            <div className=" w-[40%]">
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Enter Cleared amount"
                className="h-[3rem] px-2 border border-[#CCCCCC] outline-none w-full"
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
        <div className="grid grid-cols-4 gap-4">
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
                        <span className="text-3xl font-semibold text-[#00D23B]">
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
                  <div className="text-base font-medium text-[#666666]">
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
          <div className=" w-[40%] ">
            <input
              type="text"
              placeholder="Product/Service"
              value={monthlyService}
              onChange={(e) => setMonthlyService(e.target.value)}
              className="h-[3rem] px-2 border border-[#CCCCCC] outline-none w-full "
            />
          </div>
          <div className="w-[40%] ">
            <input
              type="text"
              placeholder="Amount"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(e.target.value)}
              className="h-[3rem] px-2 border border-[#CCCCCC] outline-none w-full "
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
          <ul className=" grid grid-cols-3  gap-4 ">
            {viewClient.monthlyPaymentAmount.map((item, index) => (
              <div
                key={index}
                className=" p-4 flex flex-col gap-2 border border-[#cccccc]"
              >
                <div className=" flex justify-between items-center">
                  <div className=" text-3xl font-semibold text-[#00D23B]">
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
                      className="h-[3rem] w-[3rem] text-2xl rounded-md flex justify-center items-center bg-[#EFF5FF] text-[#0A5BFF]"
                    >
                      <BiCheckCircle />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditMonthlyPayment(item)}
                      className="h-[3rem] w-[3rem] text-2xl rounded-md flex justify-center items-center bg-[#EFF5FF] text-[#0A5BFF]"
                    >
                      <BiSolidEditAlt />
                    </button>
                  )}
                </div>
                <div className=" text-xl font-medium text-[#333333]">
                  {isEditing && editedItem._id === item._id ? (
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="text-xl font-medium  h-[2.5rem] border border-[#cccccc] text-[#333333] outline-none w-full"
                    />
                  ) : (
                    item.serviceName
                  )}
                </div>

                <div className="text-base font-medium text-[#666666]">
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
  );
};

export default ViewClient;
