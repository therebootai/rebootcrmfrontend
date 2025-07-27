import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { DateRangePicker } from "react-date-range";
import { format } from "date-fns";
import Modal from "react-modal";
import { GoDotFill } from "react-icons/go";
import InfiniteScroll from "../InfiniteScroll";
import DataDisplayTable from "../../ui/DataDisplayTable";
import { FaMapLocationDot } from "react-icons/fa6";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-IN", options) + " ";
};

const toUTCISOStringForQuery = (date, isEndDate = false) => {
  if (!date) return null;
  const d = new Date(date);
  if (isEndDate) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
};

const DashboardEmployeeSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalPage, setModalPage] = useState(1);
  const [openFor, setOpenFor] = useState("");
  const [allModalPages, setAllModalPages] = useState(1);
  const [bdeData, setBdeData] = useState([]);
  const [telecallerData, setTelecallerData] = useState([]);
  const [digitalMarketerData, setDigitalMarketerData] = useState([]);

  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(true);

  const fetchBusinessCountsForEmployee = useCallback(
    async (employeeId, currentComponentDateRange) => {
      try {
        // Prepare base date parameters, which will be the same for all three calls
        const baseDateParams = {
          createdstartdate: toUTCISOStringForQuery(
            currentComponentDateRange.startDate
          ),
          createdenddate: toUTCISOStringForQuery(
            currentComponentDateRange.endDate,
            true
          ),
          appointmentstartdate: toUTCISOStringForQuery(
            currentComponentDateRange.startDate
          ),
          appointmentenddate: toUTCISOStringForQuery(
            currentComponentDateRange.endDate,
            true
          ),
          followupstartdate: toUTCISOStringForQuery(
            currentComponentDateRange.startDate
          ),
          followupenddate: toUTCISOStringForQuery(
            currentComponentDateRange.endDate,
            true
          ),
        };

        // Helper function to create cleaned parameters for each request
        const getCleanedParams = (additionalFilter) => {
          const params = { ...baseDateParams, ...additionalFilter };
          const cleaned = {};
          for (const key in params) {
            if (params[key] !== null) {
              // Only include parameters that are not null
              cleaned[key] = params[key];
            }
          }
          return cleaned;
        };

        const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/business/get`;

        // --- 1. Fetch for `createdBy` ---
        const createdByParams = getCleanedParams({ createdBy: employeeId });
        console.log(
          `[Counts] CreatedBy Request for ${employeeId}. Params:`,
          createdByParams
        );
        const createdByResponsePromise = axios.get(baseUrl, {
          params: createdByParams,
        });

        // --- 2. Fetch for `leadBy` ---
        const leadByParams = getCleanedParams({ leadBy: employeeId });
        console.log(
          `[Counts] LeadBy Request for ${employeeId}. Params:`,
          leadByParams
        );
        const leadByResponsePromise = axios.get(baseUrl, {
          params: leadByParams,
        });

        // --- 3. Fetch for `assignedTo` ---
        const assignedToParams = getCleanedParams({ assignedTo: employeeId });
        console.log(
          `[Counts] AssignedTo Request for ${employeeId}. Params:`,
          assignedToParams
        );
        const assignedToResponsePromise = axios.get(baseUrl, {
          params: assignedToParams,
        });

        // Wait for all three requests to complete, using Promise.allSettled to handle individual failures
        const [createdByRes, leadByRes, assignedToRes] =
          await Promise.allSettled([
            createdByResponsePromise,
            leadByResponsePromise,
            assignedToResponsePromise,
          ]);

        // Initialize aggregated status counts and a sum for the final totalCount
        let aggregatedStatusCount = {
          FollowupCount: 0,
          appointmentCount: 0,
          visitCount: 0,
          dealCloseCount: 0,
          created_business_count: 0, // This count will specifically come from the 'createdBy' endpoint
        };
        let totalSumOfCounts = 0; // The sum of all relevant individual counts

        // Process createdBy response
        if (
          createdByRes.status === "fulfilled" &&
          createdByRes.value.data.success
        ) {
          const data = createdByRes.value.data;
          console.log(`[Counts] CreatedBy Response for ${employeeId}:`, data);
          // As per your requirement, created_business_count comes from this endpoint's totalCount or statusCount
          aggregatedStatusCount.created_business_count =
            data.statusCount?.created_business_count || data.totalCount || 0;

          // Also add other status counts from this call if applicable (e.g., if a created lead can also be an appointment for this user)
          aggregatedStatusCount.FollowupCount +=
            data.statusCount?.FollowupCount || 0;
          aggregatedStatusCount.appointmentCount +=
            data.statusCount?.appointmentCount || 0;
          aggregatedStatusCount.visitCount += data.statusCount?.visitCount || 0;
          aggregatedStatusCount.dealCloseCount +=
            data.statusCount?.dealCloseCount || 0;
        } else if (createdByRes.status === "rejected") {
          console.error(
            `[Counts] Failed to fetch createdBy counts for ${employeeId}:`,
            createdByRes.reason
          );
        }

        // Process leadBy response (typically for Telecallers/Digital Marketers)
        if (leadByRes.status === "fulfilled" && leadByRes.value.data.success) {
          const data = leadByRes.value.data;
          console.log(`[Counts] LeadBy Response for ${employeeId}:`, data);
          aggregatedStatusCount.FollowupCount +=
            data.statusCount?.FollowupCount || 0;
          aggregatedStatusCount.appointmentCount +=
            data.statusCount?.appointmentCount || 0;
          aggregatedStatusCount.visitCount += data.statusCount?.visitCount || 0;
          aggregatedStatusCount.dealCloseCount +=
            data.statusCount?.dealCloseCount || 0;
        } else if (leadByRes.status === "rejected") {
          console.error(
            `[Counts] Failed to fetch leadBy counts for ${employeeId}:`,
            leadByRes.reason
          );
        }

        // Process assignedTo response (typically for BDEs)
        if (
          assignedToRes.status === "fulfilled" &&
          assignedToRes.value.data.success
        ) {
          const data = assignedToRes.value.data;
          console.log(`[Counts] AssignedTo Response for ${employeeId}:`, data);
          aggregatedStatusCount.FollowupCount +=
            data.statusCount?.FollowupCount || 0;
          aggregatedStatusCount.appointmentCount +=
            data.statusCount?.appointmentCount || 0;
          aggregatedStatusCount.visitCount += data.statusCount?.visitCount || 0;
          aggregatedStatusCount.dealCloseCount +=
            data.statusCount?.dealCloseCount || 0;
        } else if (assignedToRes.status === "rejected") {
          console.error(
            `[Counts] Failed to fetch assignedTo counts for ${employeeId}:`,
            assignedToRes.reason
          );
        }

        // Calculate the final totalCount by summing all aggregated status counts
        totalSumOfCounts =
          aggregatedStatusCount.created_business_count +
          aggregatedStatusCount.FollowupCount +
          aggregatedStatusCount.appointmentCount +
          aggregatedStatusCount.visitCount +
          aggregatedStatusCount.dealCloseCount;

        console.log(
          `[Counts] Final Aggregated Status Counts for ${employeeId}:`,
          aggregatedStatusCount
        );
        console.log(
          `[Counts] Final Total Sum of Counts for ${employeeId}:`,
          totalSumOfCounts
        );

        return {
          totalCount: totalSumOfCounts,
          statusCount: aggregatedStatusCount,
        };
      } catch (error) {
        console.error(
          `[Counts] Critical error in fetchBusinessCountsForEmployee for ${employeeId}:`,
          error
        );
        return {
          totalCount: 0,
          statusCount: {
            FollowupCount: 0,
            appointmentCount: 0,
            visitCount: 0,
            dealCloseCount: 0,
            created_business_count: 0,
          },
        };
      }
    },
    [] // Dependencies remain empty as it relies on arguments and internal helpers
  );

  const fetchEmployeeBusinessData = useCallback(
    async (
      role,
      employeeId,
      status,
      currentDateRange,
      page = 1,
      leadByUserId
    ) => {
      try {
        setModalData([]);
        setModalPage(1);

        const formattedStartDate = currentDateRange.startDate
          ? new Date(
              currentDateRange.startDate.getTime() -
                currentDateRange.startDate.getTimezoneOffset() * 60000
            ).toISOString()
          : "";
        const formattedEndDate = currentDateRange.endDate
          ? new Date(
              currentDateRange.endDate.getTime() -
                currentDateRange.endDate.getTimezoneOffset() * 60000
            ).toISOString()
          : "";

        let url = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?page=${page}`;

        if (status === "New Data") {
          url += `&createdBy=${leadByUserId}&createdstartdate=${formattedStartDate}&createdenddate=${formattedEndDate}`;
        } else {
          url += `&status=${status}`;

          if (role === "telecaller") {
            url += `&leadBy=${employeeId}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
          } else if (role === "digitalmarketer") {
            url += `&leadBy=${employeeId}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
          } else if (role === "bde") {
            url += `&assignedTo=${employeeId}&appointmentstartdate=${formattedStartDate}&appointmentenddate=${formattedEndDate}`;
            url += `&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
            // REMOVED: &byTagAppointment=true
          }
        }

        const response = await axios.get(url);

        if (response.data.success) {
          setModalData(response.data.businesses);
          setModalPage(response.data.currentPage);
          setAllModalPages(response.data.totalPages);
        } else {
          console.error(
            "Failed to fetch business data:",
            response.data.message
          );
          setModalData([]);
          setModalPage(1);
          setAllModalPages(1);
        }
      } catch (error) {
        console.error("Error fetching business data:", error);
        setModalData([]);
        setModalPage(1);
        setAllModalPages(1);
      }
    },
    []
  );

  const loadMoreModalData = useCallback(async () => {
    if (modalPage < allModalPages) {
      const nextPage = modalPage + 1;
      try {
        const formattedStartDate = dateRange.startDate
          ? new Date(
              dateRange.startDate.getTime() -
                dateRange.startDate.getTimezoneOffset() * 60000
            ).toISOString()
          : "";
        const formattedEndDate = dateRange.endDate
          ? new Date(
              dateRange.endDate.getTime() -
                dateRange.endDate.getTimezoneOffset() * 60000
            ).toISOString()
          : "";

        let url = `${
          import.meta.env.VITE_BASE_URL
        }/api/business/get?page=${nextPage}`;
        if (openFor === "New Data") {
          url += `&createdBy=${selectedEmployee._id}`;
        } else {
          url += `&status=${openFor}`;
          if (selectedEmployee.role.toLowerCase() === "telecaller") {
            url += `&assignedTo=${selectedEmployee._id}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
          } else if (
            selectedEmployee.role.toLowerCase() === "digitalmarketer"
          ) {
            url += `&assignedTo=${selectedEmployee._id}&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
          } else if (selectedEmployee.role.toLowerCase() === "bde") {
            url += `&assignedTo=${selectedEmployee._id}&appointmentstartdate=${formattedStartDate}&appointmentenddate=${formattedEndDate}`;
            url += `&followupstartdate=${formattedStartDate}&followupenddate=${formattedEndDate}`;
            // REMOVED: &byTagAppointment=true
          }
        }

        console.log("Loading more modal data URL (corrected):", url);
        const response = await axios.get(url);
        if (response.data.success) {
          setModalData((prevData) => [
            ...prevData,
            ...response.data.businesses,
          ]);
          setModalPage(response.data.currentPage);
          setAllModalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error loading more business data:", error);
      }
    }
  }, [modalPage, allModalPages, dateRange, openFor, selectedEmployee]);

  const openModal = (emp, openForStatus) => {
    setSelectedEmployee(emp);
    setOpenFor(openForStatus);
    setIsModalOpen(true);
    fetchEmployeeBusinessData(
      emp.role.toLowerCase(),
      emp._id,
      openForStatus,
      dateRange,
      1,
      emp._id
    );
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
    setModalData([]);
    setModalPage(1);
    setAllModalPages(1);
    setOpenFor("");
  };

  const fetchEmployeeData = useCallback(async () => {
    console.log("[fetchEmployeeData] Initiated. Current dateRange:", dateRange);
    try {
      // Set loading state before fetching
      // Assuming you have an isLoading state, otherwise add one
      // setIsLoading(true); // Uncomment if you have an isLoading state

      const [telecallersResponse, bdesResponse, digitalMarketersResponse] =
        await Promise.all([
          axios.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/api/users/get?designation=Telecaller`
          ),
          axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/users/get?designation=BDE`
          ),
          axios.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/api/users/get?designation=digital%20marketer`
          ),
        ]);

      const processEmployees = async (users, role) => {
        const employeesWithRole = users.map((item) => ({
          ...item,
          id: item._id,
          role: role,
          name: item.name,
        }));

        const employeesWithCountsPromises = employeesWithRole.map(
          async (employee) => {
            const counts = await fetchBusinessCountsForEmployee(
              employee.id,
              dateRange // This is the dateRange that `fetchEmployeeData` depends on
            );
            return {
              ...employee,
              totalCount: counts.totalCount,
              statuscount: counts.statusCount,
            };
          }
        );
        return Promise.all(employeesWithCountsPromises);
      };

      const [telecallersWithData, bdesWithData, digitalMarketersWithData] =
        await Promise.all([
          processEmployees(telecallersResponse.data.users, "Telecaller"),
          processEmployees(bdesResponse.data.users, "BDE"),
          processEmployees(
            digitalMarketersResponse.data.users,
            "Digital Marketer"
          ),
        ]);

      setBdeData(bdesWithData);
      setTelecallerData(telecallersWithData);
      setDigitalMarketerData(digitalMarketersWithData);
      console.log("[fetchEmployeeData] Employee data states updated.");
    } catch (error) {
      console.error("[fetchEmployeeData] Error fetching employee data:", error);
    } finally {
      // setIsLoading(false); // Uncomment if you have an isLoading state
      console.log("[fetchEmployeeData] Finished.");
    }
  }, [dateRange, fetchBusinessCountsForEmployee]); // Correct dependencies

  // --- useEffect to trigger fetchEmployeeData ---
  useEffect(() => {
    // This effect runs on mount and whenever fetchEmployeeData (or its dependencies) changes.
    // Since fetchEmployeeData depends on dateRange, this effect will re-run when dateRange is updated.
    console.log("[useEffect] Triggered. Calling fetchEmployeeData...");
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData, dateRange]);

  const handleDateRangeChange = (ranges) => {
    setDateRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: "selection",
    });
    setIsDateFilterApplied(false);
  };

  const applyDateFilter = () => {
    setIsDateFilterApplied(true);
    setShowDatePicker(false);
    fetchEmployeeData();
  };

  const clearDateFilter = () => {
    setDateRange({
      startDate: null,
      endDate: null,
      key: "selection",
    });
    setIsDateFilterApplied(false);
    fetchEmployeeData();
  };

  const handleViewDetails = (id, role) => {
    const roleSlug = role.toLowerCase().replace(/\s+/g, "");
    navigate(`/employee-details/${roleSlug}/${id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="py-4 border-b border-[#cccccc] w-full flex flex-row gap-4 items-center relative flex-wrap">
        <h1 className="text-[#777777] text-lg font-semibold">Filter</h1>
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <input
              type="text"
              value={
                dateRange.startDate && dateRange.endDate
                  ? `${format(dateRange.startDate, "dd/MM/yyyy")} - ${format(
                      dateRange.endDate,
                      "dd/MM/yyyy"
                    )}`
                  : "Select Date Range"
              }
              onClick={() => setShowDatePicker(!showDatePicker)}
              readOnly
              className="md:px-2 md:py-1 sm:p-1 flex justify-center items-center text-sm rounded-lg border border-[#CCCCCC]"
            />

            {showDatePicker && (
              <div className="absolute z-10">
                <DateRangePicker
                  ranges={[dateRange]}
                  onChange={handleDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  rangeColors={["#ff2722"]}
                />
              </div>
            )}
          </div>

          <div className=" flex items-center gap-2">
            {!isDateFilterApplied ? (
              <button
                className="px-2 py-1 bg-[#FF2722] text-white rounded-md text-sm font-medium cursor-pointer"
                onClick={() => {
                  setIsDateFilterApplied(true);
                  setShowDatePicker(false);
                }}
              >
                Show
              </button>
            ) : (
              <button
                className="px-2 py-1 bg-gray-300 text-black rounded-md text-sm font-medium cursor-pointer"
                onClick={clearDateFilter}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <DataDisplayTable
          headers={[
            "BDE Name",
            "Login",
            "Logout",
            "Day Count",
            "Total Data",
            "Appointments",
            "Followup",
            "Visit",
            "Deal Close",
            "New Data",
            "Target",
            "Achievement",
            "Action",
          ]}
          filteredData={bdeData}
          openModal={openModal}
          handleViewDetails={handleViewDetails}
          dateRange={dateRange}
        />
        <hr className="border border-[#CCCCCC]" />
        <DataDisplayTable
          headers={[
            "Telecaller Name",
            "Login",
            "Logout",
            "Day Count",
            "Total Data",
            "Appointments",
            "Followup",
            "Deal Close",
            "New Data",
            "Target",
            "Achievement",
            "Action",
          ]}
          filteredData={telecallerData}
          openModal={openModal}
          handleViewDetails={handleViewDetails}
          dateRange={dateRange}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Business Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="close-button">
          &times;
        </button>
        <div className="grid place-items-stretch justify-items-stretch gap-4">
          {modalData && modalData.length > 0 ? (
            modalData.map((data) => (
              <div
                key={data._id}
                className="bg-white text-[#2F2C49] rounded-lg border border-[#CCCCCC] text-sm font-medium flex justify-between p-4"
              >
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex justify-between w-full items-center">
                    <div className="flex items-center gap-2">
                      <span>
                        <GoDotFill />
                      </span>
                      <span className="line-clamp-2">{data.buisnessname}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      <GoDotFill />
                    </span>
                    <a href={`tel:${data.mobileNumber}`}>{data.mobileNumber}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      <GoDotFill />
                    </span>
                    <span className=" flex flex-row items-center gap-2">
                      {data.status} - (
                      {formatDate(
                        data.followUpDate || data.visit_result?.visit_time || ""
                      )}
                      )
                      <span>
                        {data.visit_result?.update_location ? (
                          <Link
                            to={`https://maps.google.com/?q=${data.visit_result.update_location.latitude},${data.visit_result.update_location.longitude}`}
                            target="_blank"
                          >
                            <FaMapLocationDot className=" text-green-800 text-lg" />
                          </Link>
                        ) : (
                          ""
                        )}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      <GoDotFill />
                    </span>
                    <span>{data.category.categoryname}</span>
                  </div>
                  <div className="flex  justify-between w-full items-center ">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span>
                          <GoDotFill />
                        </span>
                        <span>{data.city.cityname}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex gap-2 p-2 items-center justify-center font-semibold text-lg">
              <h1>No Data Found</h1>
            </div>
          )}
          <InfiniteScroll
            modalPage={modalPage}
            fn={() =>
              fetchEmployeeBusinessData(
                selectedEmployee.designation.toLowerCase(),
                selectedEmployee._id,
                openFor,
                dateRange,
                modalPage + 1,
                selectedEmployee._id
              )
            }
            allModalPages={allModalPages}
          />
        </div>
      </Modal>
    </div>
  );
};

export default DashboardEmployeeSection;
