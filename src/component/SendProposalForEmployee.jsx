import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SendProposalForEmployee = ({ business, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState(business?.mobileNumber || "");
  const [businessName, setBusinessName] = useState(
    business?.buisnessname || ""
  );
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [headerFileUrls, setHeaderFileUrls] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(true); // This assumes modal should open immediately when the component mounts

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(
          "https://web.wabridge.com/api/gettemplate",
          {
            params: {
              "auth-key": "aa61059c453fd7b25e02a9dec860e9c4e23834a61d1d26de4b",
              "app-key": "0f71de7c-53dc-4793-9469-96356a6a2e4a",
              limit: 20,
              device_id: "67599f6c1c50a6c971f41728",
            },
          }
        );
        const templatesData = response.data.data;
        setTemplates(templatesData);

        const urls = {};
        templatesData.forEach((template) => {
          const headerComponent = template.components.find(
            (component) =>
              component.type === "HEADER" &&
              (component.format === "IMAGE" || component.format === "DOCUMENT")
          );
          if (headerComponent?.example?.header_handle?.length > 0) {
            urls[template.id] = headerComponent.example.header_handle[0];
          }
        });
        setHeaderFileUrls(urls);
      } catch (error) {
        console.error("There was an error fetching the templates!", error);
      }
    };

    fetchTemplates();
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    if (onClose) {
      onClose(); // Optionally handle any additional closure logic
    }
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) {
      console.error("No template selected");
      toast.error("Please select a template before submitting.", {
        position: "bottom-center",
        icon: "❌",
      });
      return;
    }

    const formattedPhoneNumber = phoneNumber.startsWith("91")
      ? phoneNumber
      : "91" + phoneNumber;
    const payload = {
      "auth-key": "aa61059c453fd7b25e02a9dec860e9c4e23834a61d1d26de4b",
      "app-key": "0f71de7c-53dc-4793-9469-96356a6a2e4a",
      destination_number: formattedPhoneNumber,
      template_id: selectedTemplate,
      device_id: "67599f6c1c50a6c971f41728",
      variables: [],
      media: "",
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
    <div>
      <h2 className="text-lg font-bold mb-4">Send Proposal</h2>
      <div className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label htmlFor="phone">Mobile number</label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#191919] bg-[white] text-red-600 font-medium rounded-sm border border-[#CCCCCC]"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label htmlFor="businessName">Business Name</label>
            <input
              type="text"
              id="businessName"
              value={businessName}
              readOnly
              className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#191919] bg-[white] text-red-600 font-medium rounded-sm border border-[#CCCCCC]"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4  border flex flex-col gap-4 rounded-sm cursor-pointer ${
                selectedTemplate === template.id
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div className="text-xl font-semibold text-[#FF2722]">
                {template.name}
              </div>
              <div className="flex flex-row gap-4">
                {/* Image on the left */}
                <div className="w-[30%]">
                  {template.components.find(
                    (c) =>
                      c.type === "HEADER" &&
                      (c.format === "IMAGE" || c.format === "DOCUMENT")
                  ) ? (
                    template.components.find((c) => c.format === "IMAGE") ? (
                      <img
                        src={headerFileUrls[template.id]}
                        alt="Header Image"
                        className="w-full h-auto"
                        onError={() => console.error("Image failed to load.")}
                      />
                    ) : (
                      <iframe
                        src={headerFileUrls[template.id]}
                        title="PDF Preview"
                        width="100%"
                        height="100px"
                      ></iframe>
                    )
                  ) : null}
                </div>

                {/* Text content on the right */}
                <div className="flex-1">
                  {template.components.map((component, index) => {
                    switch (component.type) {
                      case "HEADER":
                        if (component.format === "TEXT") {
                          return (
                            <div key={index}>
                              <h3 className="font-bold text-lg">
                                {component.text}
                              </h3>
                            </div>
                          );
                        }
                      case "BODY":
                        return (
                          <div key={index} className="mt-2">
                            <p className="text-sm">{component.text}</p>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>

              {/* Footer below the content but above the buttons */}
              <div className="mt-4 flex flex-col gap-3">
                {template.components.map((component, index) => {
                  if (component.type === "FOOTER") {
                    return (
                      <div key={index} className="mt-4">
                        <p className="text-gray-500">{component.text}</p>
                      </div>
                    );
                  }

                  // Render buttons below the footer
                  if (component.type === "BUTTONS") {
                    return (
                      <div key={index} className="grid grid-cols-3 gap-2">
                        {component.buttons.map((button, btnIndex) => (
                          <button
                            key={btnIndex}
                            className="bg-[#FF27221A] rounded-sm text-sm text-[#FF2722] p-2 "
                          >
                            {button.text}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={closeModal}
            className="bg-gray-300 text-black px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#FF2722] text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SendProposalForEmployee;
