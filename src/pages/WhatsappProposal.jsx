import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTemplate from "../template/AdminDashboardTemplate";
import { ToastContainer, toast } from "react-toastify";

const WhatsappProposal = () => {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [headerFileUrls, setHeaderFileUrls] = useState({});
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [error, setError] = useState({});
  const [allMobileNumbers, setAllMobileNumbers] = useState([]);

  useEffect(() => {
    const fetchAllSelectData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/business/marketingget`,
          {
            params: {
              category: selectedCategory,
              city: selectedCity,
              status: selectedStatus,
            },
          }
        );

        const data = response.data;

        setBusinesses(data.businesses || []);
        setAllMobileNumbers(data.mobileNumbers || []);
        setCategories(data.categories || []);
        setCities(data.cities || []);
        setStatuses(data.statuses || []);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };
    fetchAllSelectData();
    fetchTemplates();
  }, [selectedCategory, selectedCity, selectedStatus]);

  useEffect(() => {
    if (allMobileNumbers.length > 0) {
      const phoneNumbersString = allMobileNumbers.join(", ");

      setPhoneNumbers(phoneNumbersString);
    }
  }, [allMobileNumbers]);

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

  useEffect(() => {
    if (selectedCategory || selectedCity || selectedStatus) {
      const filteredBusinesses = (businesses || []).filter((b) => {
        const matchesCategory = selectedCategory
          ? b.category === selectedCategory
          : true;
        const matchesCity = selectedCity ? b.city === selectedCity : true;
        const matchesStatus = selectedStatus
          ? b.status === selectedStatus
          : true;

        return matchesCategory && matchesCity && matchesStatus;
      });

      if (filteredBusinesses.length > 0) {
        const phoneNumbers = filteredBusinesses.map((b) => b.mobileNumber);
        setPhoneNumbers(phoneNumbers.join(", "));
        setError({});
      }
    } else {
      setPhoneNumbers("");
      setError({
        message:
          "Please select at least one filter (category, city, or status).",
      });
    }
  }, [selectedCategory, selectedCity, selectedStatus, businesses]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSubmit = async () => {
    const errors = {};
    if (!selectedCategory) errors.category = "Please select a category.";
    if (!selectedCity) errors.city = "Please select a city.";
    if (!selectedStatus) errors.status = "Please select a status.";

    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }

    if (!selectedTemplate) {
      setError((prevError) => ({
        ...prevError,
        template: "Please select a template.",
      }));
      return;
    }

    setError({});

    try {
      const phoneNumberArray = phoneNumbers
        .split(",")
        .map((number) =>
          number.trim().startsWith("91") ? number.trim() : "91" + number.trim()
        );

      const concatenatedPhoneNumbers = phoneNumberArray.join(",");

      const payload = {
        "auth-key": "aa61059c453fd7b25e02a9dec860e9c4e23834a61d1d26de4b",
        "app-key": "0f71de7c-53dc-4793-9469-96356a6a2e4a",
        destination_number: concatenatedPhoneNumbers,
        template_id: selectedTemplate,
        device_id: "67599f6c1c50a6c971f41728",
        variables: [],
        media: "",
      };

      const response = await axios.post(
        "https://web.wabridge.com/api/createmessage",
        payload
      );

      if (response.data.status === true) {
        toast.success("Messages sent successfully!", {
          position: "bottom-center",
          icon: "✅",
        });
      } else {
        toast.error("Failed to send some messages.", {
          position: "bottom-center",
          icon: "❌",
        });
      }

      // Clear fields after successful submission
      setSelectedCategory("");
      setSelectedCity("");
      setSelectedStatus("");
      setSelectedTemplate(null);
      setPhoneNumbers("");
    } catch (error) {
      console.error("There was an error sending the messages!", error);
      toast.error("An error occurred while sending messages.", {
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
            <label htmlFor="category">Select Category*</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full h-[3.5rem] p-2 focus:outline-none bg-[white] text-black rounded-sm border"
            >
              <option value="">Choose a category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="city">Select City*</label>
            <select
              id="city"
              value={selectedCity}
              onChange={handleCityChange}
              className="w-full h-[3.5rem] p-2 focus:outline-none bg-[white] text-black rounded-sm border"
            >
              <option value="">Choose a city</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status">Select Status*</label>
            <select
              id="status"
              value={selectedStatus}
              onChange={handleStatusChange}
              className="w-full h-[3.5rem] p-2 focus:outline-none bg-[white] text-black rounded-sm border"
            >
              <option value="">Choose a status</option>
              {statuses.map((status, index) => (
                <option key={index} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error.message && <p className="text-red-500">{error.message}</p>}

        <div className="flex flex-col gap-2 mt-4">
          <div className="flex flex-col gap-2 mt-4">
            <label htmlFor="phoneNumbers">Selected Phone Numbers</label>
            <textarea
              id="phoneNumbers"
              value={phoneNumbers}
              readOnly
              rows={4}
              className="w-full p-2 focus:outline-none bg-[white] text-black rounded-sm border"
            ></textarea>
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
              onClick={() => setSelectedTemplate(template.id)}
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
                <div className="flex-1">
                  {template.components.map((component, index) => {
                    if (
                      component.type === "HEADER" &&
                      component.format === "TEXT"
                    ) {
                      return (
                        <div key={index}>
                          <h3 className="font-bold text-lg">
                            {component.text}
                          </h3>
                        </div>
                      );
                    }
                    if (component.type === "BODY") {
                      return (
                        <div key={index} className="mt-2">
                          <p className="text-sm">{component.text}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {template.components.map((component, index) => {
                  if (component.type === "FOOTER") {
                    return (
                      <div key={index} className="mt-4">
                        <p className="text-gray-500">{component.text}</p>
                      </div>
                    );
                  }
                  if (component.type === "BUTTONS") {
                    return (
                      <div key={index} className="grid grid-cols-3 gap-2">
                        {component.buttons.map((button, btnIndex) => (
                          <button
                            key={btnIndex}
                            className="bg-[#FF27221A] rounded-sm text-sm text-[#FF2722] p-2"
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

export default WhatsappProposal;
