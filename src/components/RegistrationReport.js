import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../components/Api";
import HomeImage from "../assets/Logo.svg";

const RegistrationReport = ({ setIsAuthenticated }) => {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });
  const navigate = useNavigate();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRegistrations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const safeJsonParse = (jsonString) => {
    try {
      if (!jsonString || jsonString === "undefined") return null;
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON parse error:", e);
      return null;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Not available";

    try {
      const cleanedTimestamp = timestamp.replace(" IST", "");
      const date = new Date(cleanedTimestamp);

      const options = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      };

      const datePart = date.toLocaleDateString("en-US", options);
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${datePart} ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return "Invalid date";
    }
  };

  const parseDateFromTimestamp = (timestamp) => {
    if (!timestamp) return null;
    try {
      const cleanedTimestamp = timestamp.replace(" IST", "");
      return new Date(cleanedTimestamp);
    } catch (e) {
      return null;
    }
  };

  const applyDateFilter = () => {
    if (!dateFilter.from && !dateFilter.to) {
      setFilteredRegistrations(registrations);
      setCurrentPage(1);
      return;
    }

    const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
    const toDate = dateFilter.to ? new Date(dateFilter.to) : null;

    const filtered = registrations.filter((item) => {
      const itemDate = parseDateFromTimestamp(
        item.originalTimestamp || item.timestamp
      );
      if (!itemDate) return false;

      if (fromDate && itemDate < fromDate) return false;
      if (toDate && itemDate > new Date(toDate.getTime() + 86400000))
        return false;

      return true;
    });

    setFilteredRegistrations(filtered);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setDateFilter({ from: "", to: "" });
    setFilteredRegistrations(registrations);
    setCurrentPage(1);
  };

  useEffect(() => {
    setFilteredRegistrations(registrations);
    setCurrentPage(1);
  }, [registrations]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getIssuerReport(43);
        if (!data) {
          throw new Error("No data received from API");
        }
        const registrationList = data.registerResponseDtoList || [];
        if (!registrationList.length) {
          throw new Error("No registration data found in response");
        }

        const processedRegistrations = registrationList
          .map((reg) => {
            const finalResponse = safeJsonParse(
              reg.finalResponse
            )?.vkenpayRegistration;
            const initialRequest = safeJsonParse(reg.initialRequest);
            if (!reg.requestId) {
              return null;
            }

            return {
              timestamp: formatTimestamp(reg.timestamp),
              requestId: reg.requestId,
              issuerCode:
                finalResponse?.instInfo?.issuerCode ||
                initialRequest?.instInfo?.issuerCode ||
                "Not available",
              issuerName:
                finalResponse?.instInfo?.issuerName ||
                initialRequest?.instInfo?.issuerName ||
                "Not available",
              emailId:
                finalResponse?.activationDetail?.emailId ||
                initialRequest?.issuedCardInfo?.emailId ||
                "Not available",
              statusMessage: finalResponse?.statusMessage || "Not available",
              statusCode: finalResponse?.statusCode || "Not available",
              activationCode:
                finalResponse?.activationDetail?.activationCode ||
                "Not available",
              passcode1:
                finalResponse?.activationDetail?.pcode1 || "Not available",
              passcode2:
                finalResponse?.activationDetail?.pcode2 || "Not available",
              userProfileID: finalResponse?.userProfileID || "Not available",
              deviceRefID: finalResponse?.deviceRefID || "Not available",
              cardInfo: initialRequest?.issuedCardInfo || {
                cardPan: "Not available",
                cardCvv: "Not available",
                expDate: "Not available",
                firstName: "Not available",
                lastName: "Not available",
                address: "Not available",
                city: "Not available",
                country: "Not available",
                phoneNo: "Not available",
              },
            };
          })
          .filter((reg) => reg !== null);
        if (!processedRegistrations.length) {
          throw new Error("No valid registration data found");
        }

        setRegistrations(processedRegistrations);
        setFilteredRegistrations(processedRegistrations);
        setCurrentPage(1);
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewVerification = () => {
    navigate("/verification/requestId");
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return <div className="loading-dark">Loading registration data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    navigate("/");
  };

  const handleHomeView = () => {
    navigate("/home");
  };

  return (
    <div className="dark-theme">
      <div className="header-dark">
        <button onClick={handleHomeView} className="home-button">
          <img src={HomeImage} alt="Home Visual" className="home-img" />
        </button>
        <h2 className="header-title">Registration Report</h2>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="date-filter-container">
        <div className="date-filter-group">
          <label htmlFor="fromDate">From:</label>
          <input
            type="date"
            id="fromDate"
            name="from"
            value={dateFilter.from}
            onChange={handleDateFilterChange}
            className="date-input"
          />
        </div>
        <div className="date-filter-group">
          <label htmlFor="toDate">To:</label>
          <input
            type="date"
            id="toDate"
            name="to"
            value={dateFilter.to}
            onChange={handleDateFilterChange}
            className="date-input"
          />
        </div>
        <button onClick={applyDateFilter} className="filter-button">
          Filter
        </button>
        <button onClick={handleClearFilter} className="clear-filter-button">
          Clear
        </button>
      </div>
      <div className="table-container-dark">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Request ID</th>
              <th>Issuer Code</th>
              <th>Email ID</th>
              <th>Status Message</th>
              <th>Status Code</th>
              <th>Activation Code</th>
              <th>Passcode 1</th>
              <th>Passcode 2</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr key={item.requestId}>
                  <td>{item.timestamp}</td>
                  <td>{item.requestId}</td>
                  <td>{item.issuerCode}</td>
                  <td>{item.emailId}</td>
                  <td>{item.statusMessage}</td>
                  <td>{item.statusCode}</td>
                  <td>{item.activationCode}</td>
                  <td>{item.passcode1}</td>
                  <td>{item.passcode2}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  No registration data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredRegistrations.length > itemsPerPage && (
        <div className="pagination-controls">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            &laquo; Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => paginate(pageNum)}
                className={`pagination-button ${
                  currentPage === pageNum ? "active" : ""
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="pagination-ellipsis">...</span>
          )}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              onClick={() => paginate(totalPages)}
              className={`pagination-button ${
                currentPage === totalPages ? "active" : ""
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="pagination-button"
          >
            Next &raquo;
          </button>
        </div>
      )}

      <div className="pagination-info">
        Showing {filteredRegistrations.length > 0 ? indexOfFirstItem + 1 : 0}-
        {Math.min(indexOfLastItem, filteredRegistrations.length)} of{" "}
        {filteredRegistrations.length} items
      </div>

      <button onClick={handleViewVerification} className="back-button">
        View Verification Report →
      </button>
    </div>
  );
};

export default RegistrationReport;
