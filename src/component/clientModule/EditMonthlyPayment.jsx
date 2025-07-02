import React, { useEffect, useState } from "react";

const EditMonthlyPayment = ({ defaultAmount, onSubmit }) => {
  const [amount, setAmount] = useState(defaultAmount || "");
  const [due, setDue] = useState("");

  useEffect(() => {
    const parsedAmount = parseFloat(amount) || 0;
    const parsedDefault = parseFloat(defaultAmount) || 0;
    const calculatedDue = Math.max(parsedDefault - parsedAmount, 0);

    setDue(Math.floor(calculatedDue));
  }, [amount, defaultAmount]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const now = new Date();
    const emiEntry = {
      installmentNumber: null,
      amount: Number(amount),
      due,
      month: now.toLocaleString("default", { month: "long" }),
      year: now.getFullYear(),
    };

    onSubmit(emiEntry);
  };
  return (
    <div className="relative bg-white rounded-2xl px-3 py-5 border border-[#eeeeee] z-[100]">
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-l border-t border-gray-300 rotate-45 z-0" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="number"
          name="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter Amount"
          className="px-3 py-2 border border-[#eeeeee] rounded outline-none"
        />
        <input
          type="text"
          name="due"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          placeholder="Due"
          className="px-3 py-2 border border-[#eeeeee] rounded outline-none"
        />

        <button
          type="submit"
          className="px-3 py-2 bg-[#0A5BFF] text-white text-center text-xs rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default EditMonthlyPayment;
