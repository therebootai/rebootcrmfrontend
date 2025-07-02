import React, { useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { TbEdit } from "react-icons/tb";
import axios from "axios";
import EditMonthlyPayment from "./EditMonthlyPayment";

const ViewClient = ({ viewClient, setViewClient, fetchAllClients }) => {
  const [amountToEdit, setAmountToEdit] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [monthlyInput, setMonthlyInput] = useState("");
  const [activePaymentIndex, setActivePaymentIndex] = useState(null);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);
  const [editedAmount, setEditedAmount] = useState("");
  const [editingEmiIndex, setEditingEmiIndex] = useState(null);
  const [editingEmiValues, setEditingEmiValues] = useState({
    amount: "",
    due: "",
  });

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
    const currentDate = new Date();
    const newClearedAmount = {
      month: currentDate.toLocaleString("default", { month: "long" }),
      year: currentDate.getFullYear(),
      amount: newAmount,
    };

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

  const handleMonthlyPaymentCreate = async () => {
    if (!monthlyInput || isNaN(monthlyInput)) {
      alert("Enter a valid amount");
      return;
    }

    const newEntry = {
      totalAmount: Number(monthlyInput),
      emis: [],
    };

    const updatedArray = [...viewClient.monthlyPaymentAmount, newEntry];

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/client/update/${
          viewClient.clientId
        }`,
        { monthlyPaymentAmount: updatedArray }
      );
      setViewClient(response.data.client);
      setMonthlyInput("");
      fetchAllClients();
    } catch (error) {
      console.error("Error adding monthly amount", error);
      alert("Failed to add monthly payment");
    }
  };

  const handleAddEmi = async (emiEntry, monthlyIndex) => {
    const allMonthlyPayments = [...viewClient.monthlyPaymentAmount];

    const selectedPayment = allMonthlyPayments[monthlyIndex];

    emiEntry.installmentNumber = selectedPayment.emis.length + 1;

    selectedPayment.emis.push(emiEntry);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/client/update/${
          viewClient.clientId
        }`,
        { monthlyPaymentAmount: allMonthlyPayments }
      );
      setViewClient(response.data.client);
      setActivePaymentIndex(null);
      fetchAllClients();
    } catch (error) {
      console.error("Error saving EMI", error);
      alert("Failed to save EMI");
    }
  };

  const handleSaveMonthlyAmount = async (index) => {
    const updated = [...viewClient.monthlyPaymentAmount];
    updated[index].totalAmount = Number(editedAmount);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/client/update/${
          viewClient.clientId
        }`,
        { monthlyPaymentAmount: updated }
      );
      setViewClient(response.data.client);
      setEditingPaymentIndex(null);
      setEditedAmount("");
      fetchAllClients();
    } catch (err) {
      console.error("Error updating monthly amount", err);
      alert("Failed to update monthly payment amount");
    }
  };

  const handleEditEmiClick = (emi, emiIndex) => {
    setEditingEmiIndex(emiIndex);
    setEditingEmiValues({
      amount: emi.amount,
      due: emi.due,
    });
  };

  const handleEmiDueChange = (value, totalAmount, originalAmount) => {
    const due = parseFloat(value) || 0;
    let newAmount = parseFloat(originalAmount) || 0;

    if (due === 0 || value === "") {
      newAmount = totalAmount;
    } else {
      newAmount = totalAmount - due;
    }

    setEditingEmiValues({
      amount: Math.floor(newAmount),
      due: value,
    });
  };

  const handleSaveEditedEmi = async (monthlyIndex) => {
    const updated = [...viewClient.monthlyPaymentAmount];
    const selected = updated[monthlyIndex];

    selected.emis[editingEmiIndex].amount = editingEmiValues.amount;
    selected.emis[editingEmiIndex].due = editingEmiValues.due;

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/client/update/${
          viewClient.clientId
        }`,
        { monthlyPaymentAmount: updated }
      );
      setViewClient(response.data.client);
      setEditingEmiIndex(null);
      setEditingEmiValues({ amount: "", due: "" });
      fetchAllClients();
    } catch (err) {
      console.error("Error updating EMI", err);
      alert("Failed to update EMI");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-medium text-[#777777] border-b-2 border-[#cccccc]">
        Client Details
      </h2>
      <p>
        <strong>Business Name:</strong>{" "}
        {viewClient.businessNameDoc.buisnessname}
      </p>
      <p>
        <strong>Mobile Number:</strong>{" "}
        {viewClient.businessNameDoc.mobileNumber}
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
        <strong>Deal Amount:</strong> {viewClient.dealAmount}
      </p>
      <p className="flex flex-row gap-2">
        <strong className=" text-nowrap">Cleared Amount:</strong>
        <div className=" flex flex-wrap gap-2">
          {viewClient.cleardAmount && viewClient.cleardAmount.length > 0 ? (
            viewClient.cleardAmount.map((item, index) => (
              <span key={index} className="flex  items-center gap-2">
                {item.month} {item.year} - ₹{item.amount}{" "}
                <button
                  onClick={() => handleEditAmount(item)}
                  className="text-blue-600 text-lg"
                >
                  <TbEdit />
                </button>{" "}
                <button
                  onClick={handleAddAmount}
                  className="text-green-600 text-lg"
                >
                  <AiOutlinePlusCircle />
                </button>
                ||
              </span>
            ))
          ) : (
            <button
              onClick={handleAddAmount}
              className="text-green-600 text-lg"
            >
              <AiOutlinePlusCircle />
            </button>
          )}
        </div>
      </p>
      {amountToEdit && (
        <div className="flex flex-row gap-4 items-center">
          <input
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Enter Cleared amount"
            className="h-[3rem] px-2 border border-[#CCCCCC] outline-none w-[60%]"
          />
          <button
            onClick={handleSaveEditAmount}
            className=" h-[2rem] px-4 flex justify-center items-center bg-[#0A5BFF] text-white rounded-sm"
          >
            Save
          </button>
        </div>
      )}

      <p className="flex flex-row items-center gap-4">
        <strong className="text-nowrap">New Monthly Payment:</strong>
        <div className="flex flex-row gap-2 items-center w-full">
          <input
            type="number"
            placeholder="Enter Monthly Payment"
            value={monthlyInput}
            onChange={(e) => setMonthlyInput(e.target.value)}
            className="h-[3rem] px-2 border border-[#CCCCCC] outline-none w-[80%]"
          />
          <button
            onClick={handleMonthlyPaymentCreate}
            className="h-[2rem] px-4 flex justify-center items-center bg-[#0A5BFF] text-white rounded-sm"
          >
            Add
          </button>
        </div>
      </p>

      {viewClient.monthlyPaymentAmount?.length > 0 && (
        <div className="flex flex-col gap-6">
          {viewClient.monthlyPaymentAmount.map((mp, index) => (
            <div
              key={index}
              className="p-2 border border-gray-300 rounded-md flex flex-col gap-4 "
            >
              <div className=" flex gap-4 items-center">
                <div>
                  <strong>Monthly Payment {index + 1}:</strong>{" "}
                  {editingPaymentIndex === index ? (
                    <input
                      type="number"
                      value={editedAmount}
                      onChange={(e) => setEditedAmount(e.target.value)}
                      className="px-2 py-1 border border-[#cccccc] rounded w-[120px]"
                    />
                  ) : (
                    <>₹{mp.totalAmount}</>
                  )}
                </div>
                <div className="flex gap-2 text-lg relative">
                  {editingPaymentIndex === index ? (
                    <button
                      className="text-green-600 text-sm px-2 py-1 border border-green-600 rounded"
                      onClick={() => handleSaveMonthlyAmount(index)}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className="text-blue-600"
                      onClick={() => {
                        setEditingPaymentIndex(index);
                        setEditedAmount(mp.totalAmount);
                      }}
                    >
                      <TbEdit />
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setActivePaymentIndex(
                        activePaymentIndex === index ? null : index
                      )
                    }
                    className="text-green-600"
                  >
                    <AiOutlinePlusCircle />
                  </button>
                  {activePaymentIndex === index && (
                    <div className="absolute top-[calc(100%_+_0.75rem)] left-1/2 -translate-x-1/2 z-[100]">
                      <EditMonthlyPayment
                        defaultAmount={mp.totalAmount}
                        onSubmit={(emiEntry) => handleAddEmi(emiEntry, index)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className=" flex flex-col gap-4">
                {mp.emis.length > 0 && (
                  <div className=" flex flex-col gap-4 text-sm text-gray-700">
                    <strong>EMIs Paid:</strong>
                    <div className=" flex flex-col gap-3">
                      {mp.emis.map((emi, emiIndex) => (
                        <div key={emi._id || emiIndex} className="flex gap-4">
                          <span>
                            • <strong>Month:</strong> {emi.month} {emi.year}
                          </span>
                          {editingEmiIndex === emiIndex ? (
                            <>
                              <input
                                type="text"
                                value={editingEmiValues.amount}
                                readOnly
                                className="border px-2 py-1 rounded w-20 bg-gray-100"
                              />
                              <input
                                type="text"
                                value={editingEmiValues.due}
                                onChange={(e) =>
                                  handleEmiDueChange(
                                    e.target.value,
                                    mp.totalAmount,
                                    emi.amount
                                  )
                                }
                                placeholder="Due"
                                className="border px-2 py-1 rounded w-20"
                              />
                              <button
                                onClick={() => handleSaveEditedEmi(index)}
                                className="px-2 py-1 text-sm bg-blue-500 text-white rounded"
                              >
                                Save
                              </button>
                            </>
                          ) : (
                            <>
                              <span>
                                <strong>Amount:</strong> ₹{emi.amount}
                              </span>
                              <span>
                                <strong>Due:</strong> {emi.due || "—"}
                              </span>
                              <button
                                className="text-blue-600"
                                onClick={() =>
                                  handleEditEmiClick(
                                    emi,
                                    emiIndex,
                                    mp.totalAmount
                                  )
                                }
                              >
                                <TbEdit />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewClient;
