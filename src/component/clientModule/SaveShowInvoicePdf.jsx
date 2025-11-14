import axios from "axios";
import html2pdf from "html2pdf.js";
import React, { useEffect, useRef, useState } from "react";
import { BiSolidCloudDownload } from "react-icons/bi";
import { FaRegCreditCard } from "react-icons/fa";

const SaveShowInvoicePdf = ({
  item,
  invoices,
  fetchAllClients,
  savePdf = true,
  setViewClient,
}) => {
  const containerRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const invoice = item.invoice?.[item.invoice.length - 1] || invoices;

  const numberToWords = (num) => {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " and " + inWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          inWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + inWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          inWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + inWords(n % 100000) : "")
        );
      return (
        inWords(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + inWords(n % 10000000) : "")
      );
    };

    if (!num || isNaN(num)) return "Zero Rupees Only";
    return inWords(Number(num)) + " Rupees Only";
  };

  const subtotal =
    invoice?.invoiceData?.reduce((sum, item) => sum + Number(item.amount), 0) ||
    0;

  const previousPayment = invoice?.previousPayment
    ? Number(invoice.previousPayment)
    : 0;
  const total = subtotal - previousPayment;
  const totalInWords = numberToWords(total);

  const handleSavePdf = async () => {
    const element = containerRef.current;
    element.classList.add("hide-action");
    setIsSaving(true);

    try {
      const opt = {
        filename: `${item.businessNameDoc?.buisnessname}-invoice.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      const pdfBlob = await html2pdf().from(element).set(opt).outputPdf("blob");

      const file = new File([pdfBlob], "invoice.pdf", {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("savePdf", file);

      const clientId = item.clientId;
      const invoiceId = invoice._id;

      const response = await axios.put(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/client/update/${clientId}/invoice/${invoiceId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setViewClient(response.data.client);
      fetchAllClients();
    } catch (error) {
      console.error("Failed to upload or generate PDF:", error);
    } finally {
      element.classList.remove("hide-action");
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (savePdf && item && invoice && invoice.invoiceData?.length > 0) {
      handleSavePdf();
    }
  }, [savePdf, item, invoice]);

  const handleDownload = () => {
    const element = containerRef.current;
    element.classList.add("hide-action");

    html2pdf()
      .from(element)
      .set({
        filename: `${item.businessNameDoc?.buisnessname}-invoice.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save()
      .finally(() => {
        element.classList.remove("hide-action");
      }, 300);
  };

  return (
    <div className=" flex flex-col gap-4">
      {isSaving && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white px-8 py-4 rounded shadow-lg text-xl font-semibold text-[#0A5BFF] animate-pulse">
            Saving PDF...
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="a4-container flex flex-col gap-2 p-2 px-4 border border-[#cccccc] "
      >
        <div className="flex flex-row justify-between items-center px-4">
          <div className="w-[60%]">
            <img
              src="/images/rebootailogo.png"
              alt="logo"
              className=" h-[5rem] w-fit"
            />
          </div>
          <div className="w-[40%] flex flex-col text-end text-[#777777]">
            <h1 className="text-xs font-medium">REBOOT AI PRIVATE LIMITED</h1>
            <p className=" text-[11px]">
              4th Floor Shib Sankar Market <br /> Bidhan Road Siliguri WB.734001
            </p>
            <div className=" text-[11px]">rebootai.in | info@rebootai.in</div>
          </div>
        </div>

        <div className="flex flex-row gap-1 items-center">
          <div className="w-[60%] h-[0.10rem] bg-[#777777]"></div>
          <h1 className="text-red-900 font-medium text-nowrap w-[20%] text-sm text-center">
            BILLING INVOICE
          </h1>
          <div className="w-[20%] h-[0.10rem] bg-[#777777]"></div>
        </div>

        <div className="flex justify-between text-[11px]">
          <div className="flex flex-col gap-1 flex-1">
            <h3>Bill To</h3>
            <h1 className=" font-medium">
              {item.businessNameDoc?.buisnessname}
            </h1>
            <h2>{item.address}</h2>
            <h2>GSTIN: {item.gstNo}</h2>
          </div>

          <div className="flex-1 flex flex-col gap-1 text-[#444]">
            <div className="flex flex-row">
              <h1 className="w-[50%] font-semibold">Invoice#:</h1>
              <span>{invoice?.invoiceNumber || "-"}</span>
            </div>
            <div className="flex flex-row">
              <h1 className="w-[50%] font-semibold">Due Date:</h1>
              <span>
                {(() => {
                  const date = new Date(invoice?.dueDate);
                  const day = String(date.getDate()).padStart(2, "0");
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const year = date.getFullYear();
                  return `${day}/${month}/${year}`;
                })()}
              </span>
            </div>
            <div className="flex flex-row">
              <h1 className="w-[50%] font-semibold">Relationship Manager:</h1>
              <span>{item?.bdeName?.name || "-"}</span>
            </div>
            <div className="flex flex-row">
              <h1 className="w-[50%] font-semibold">Contact Number:</h1>
              <span>{item.businessNameDoc?.mobileNumber}</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-[#777777]">
          Place Of Supply: West Bengal (19)
        </div>

        <div className="flex flex-col">
          <div className="flex flex-row border border-[#222222] font-medium text-[11px] py-">
            <div className="w-[5%] p-1 py-3 border-r border-[#222222]">
              Sl.No
            </div>
            <div className="w-[25%] p-1 py-3 border-r border-[#222222]">
              Product / Service Name
            </div>
            <div className="w-[40%] p-1 py-3 border-r border-[#222222]">
              Description
            </div>
            <div className="w-[10%] p-1 py-3 border-r border-[#222222]">
              Qty
            </div>
            <div className="w-[10%] p-1 py-3 border-r border-[#222222]">
              Rate
            </div>
            <div className="w-[10%] p-1 py-3">Amount</div>
          </div>

          {invoice?.invoiceData?.map((inv, index) => (
            <div
              key={inv._id}
              className="flex flex-row border-x border-b border-[#222222] text-[11px]"
            >
              <div className="w-[5%] p-1 py-2 border-r border-[#222222]">
                {index + 1}
              </div>
              <div className="w-[25%] p-1 py-2 border-r border-[#222222]">
                {inv.serviceName}
              </div>
              <div className="w-[40%] p-1 py-2 border-r border-[#222222]">
                {inv.description}
              </div>
              <div className="w-[10%] p-1 py-2 border-r border-[#222222]">
                {inv.quantity}
              </div>
              <div className="w-[10%] p-1 py-2 border-r border-[#222222]">
                {inv.rate}
              </div>
              <div className="w-[10%] p-1 py-2">{inv.amount}</div>
            </div>
          ))}
        </div>
        <div className=" flex flex-row gap-4 text-xs">
          <div className="w-[60%] flex flex-col gap-4">
            <p className=" text-[11px]">
              For assistance kindly mail us at help info@rebootai.in or chat
              with our support team on WhatsApp +91 -7044076603. You may also
              visit “rebootai.in” to see all your invoices, payments made, and
              for the complete statement.
            </p>
          </div>
          <div className=" w-[40%] flex flex-col gap-2  items-center  text-[11px]">
            <div className=" flex  flex-col gap-2 border-b border-[#cccccc] w-full justify-center items-center pb-2">
              <div className="flex flex-row  text-[#666666] w-full justify-center items-center ">
                <h1 className="w-[50%] font-semibold">Sub Total:</h1>
                <span>{subtotal}</span>
              </div>
              {invoice.previousPayment ? (
                <div className="flex flex-row  text-[#0d1d39] w-full justify-center items-center">
                  <h1 className="w-[50%] font-semibold">Previous Payment:</h1>
                  <span>{invoice.previousPayment}</span>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="flex flex-row pb-2 text-[#222222] border-b border-[#cccccc] w-full justify-center items-center">
              <h1 className="w-[50%] font-semibold">Total:</h1>
              <span>{total}</span>
            </div>
            <div className="flex flex-row pb-2 text-red-900 border-b border-[#cccccc] w-full  justify-center items-center">
              <h1 className="w-[50%] font-semibold">Balance Due:</h1>
              <span>{total}</span>
            </div>
            <div className="flex flex-row pb-2 text-[#222222] justify-center items-center">
              <span className="">Total In Words: {totalInWords}</span>
            </div>
          </div>
        </div>
      
        <div className=" flex flex-col justify-end items-end h-full w-full">
            <div className=" flex flex-col gap-4 justify-end h-full ">
        <div className=" flex flex-col gap-2 mt-6">
          <h1 className=" text-xs font-medium">Payment Options</h1>
          <div className=" px-2 py-1 flex gap-1 border border-[#222222] rounded-md w-fit">
            <FaRegCreditCard className=" text-sm" />{" "}
            <img src="/images/upi.webp" className=" h-[0.8rem] w-fit" />
          </div>
          <div className=" flex flex-col text-[11px] gap-1">
            <span className=" font-medium">
              Our Bank Details for NEFFT/ RTGS, Online Fund Transfer
            </span>
            <span>Name of bank: HDFC BANK LTD</span>
            <span>Account Name: REBOOT AI PRIVATE LIMITED</span>
            <span>Current Account Number: 50200106804851</span>
            <span>IFSC Code : HDFC0000151 / SWIFT Code: </span>
            <span>
              Link to pay online: https://www.rebootai.in/payment.html
            </span>
          </div>
        </div>
        <div className=" flex flex-col gap-2">
          <h1 className=" font-medium text-xs text-[#222222]">
            Terms & Conditions
          </h1>
          <p className=" text-[11px] text-[#222222]">
            The invoiced amount must be realised to us within its due date,
            failing which an interest of 24% per annum shall be charged until
            the amount in full is realised. For all-purposes only the courts at
            Siliguri shall have exclusive jurisdiction.
          </p>
        </div>
        <div>
          <img src="/images/upireboot.png" className=" size-[10rem]" />
        </div>
        </div>
          <footer className="flex justify-center items-center border-t border-[#cccccc] w-full">
            <div className=" flex flex-col gap-1 justify-center items-center text-[11px] text-center text-[#666666]">
              <p>
                Regd. Office: Siliguri | CIN No: U62012WB2024PTC274361 | PAN No:
                U62012WB2074361 |
              </p>
              <p>
                Complete Address: 4th Floor, Shib Sankar Market, Bidhan Road,
                Ward No. 26, Siliguri, West Bengal, Pincode - 734001 India
              </p>
              <p>
                Email:sales@rebootai.in | Phone No: 0353-2468930 | Mobile No:
                +91-7044076603
              </p>
            </div>
          </footer>
        </div>
      </div>

      <div className=" flex flex-row gap-4 justify-end items-end">
        <button
          onClick={handleDownload}
          className="bg-[#EFF5FF] w-fit flex gap-2 items-center px-8 xl:px-10 h-[4rem] text-[#0A5BFF] text-lg font-medium"
        >
          <BiSolidCloudDownload className=" text-2xl" />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default SaveShowInvoicePdf;
