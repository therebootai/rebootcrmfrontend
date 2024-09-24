import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Proposal = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [headerFileUrls, setHeaderFileUrls] = useState({});

  useEffect(() => {
    // Fetch templates
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(
          "https://web.wabridge.com/api/gettemplate",
          {
            params: {
              "auth-key": "aa61059c453fd7b25e02a9dec860e9c4e23834a61d1d26de4b",
              "app-key": "0f71de7c-53dc-4793-9469-96356a6a2e4a",
              limit: 20,
              device_id: "66cecb0dfcac514dad358e64",
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

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedTemplate) {
        console.error("No template selected");
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
        device_id: "66cecb0dfcac514dad358e64",
        variables: [],
        media: "",
      };

      const response = await axios.post(
        "https://web.wabridge.com/api/createmessage",
        payload
      );

      // Check if the response was successful
      if (response.data.status === true) {
        toast.success("Message sent successfully!", {
          position: "bottom-center",
          icon: "✅",
        });

        setPhoneNumber("");
        setSelectedTemplate(null);
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
    <AdminDashboardTemplate>
      <div className="flex flex-col gap-8 mt-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="phone">Enter Mobile number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="w-full h-[3.5rem] p-2 focus:outline-none outline-[#191919] bg-[white] text-black rounded-sm border border-[#CCCCCC]"
              id="phone"
              placeholder="Enter phone number"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border flex flex-col gap-4 rounded-sm cursor-pointer ${
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
                        break;
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

        <button
          type="submit"
          onClick={handleSubmit}
          className="xl:w-[15%] lg:w-[25%] sm:w-[30%] h-[3.5rem] bg-[#FF27221A] rounded-sm text-lg text-[#FF2722] hover:bg-[#FF2722] hover:text-white font-medium flex justify-center items-center"
        >
          Submit
        </button>

        <ToastContainer />
      </div>
    </AdminDashboardTemplate>
  );
};

export default Proposal;
