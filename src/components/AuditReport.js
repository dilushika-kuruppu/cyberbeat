import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../components/Api";
import HomeImage from "../assets/Logo.svg";

const AuditReportView = ({ setIsAuthenticated }) => {
  const [audits, setAudits] = useState([]);
  const [filteredAudits, setFilteredAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
   const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: "",
  });
  const navigate = useNavigate();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAudits.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const safeJsonParse = (jsonString) => {
    try {
      if (!jsonString || jsonString === "undefined") return null;
      return JSON.parse(jsonString);
    } catch (e) {
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
      setFilteredAudits(audits);
      setCurrentPage(1);
      return;
    }

    const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
    const toDate = dateFilter.to ? new Date(dateFilter.to) : null;

    const filtered = audits.filter((item) => {
      const itemDate = parseDateFromTimestamp(
        item.originalTimestamp || item.timestamp
      );
      if (!itemDate) return false;

      if (fromDate && itemDate < fromDate) return false;
      if (toDate && itemDate > new Date(toDate.getTime() + 86400000))
        return false;

      return true;
    });

    setFilteredAudits(filtered);
  };

  const handleClearFilter = () => {
    setDateFilter({ from: "", to: "" });
    setFilteredAudits(audits);
    setCurrentPage(1);
  };

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) {
      setUserName(name);
    }
  }, []);

  useEffect(() => {
    setFilteredAudits(audits);
    setCurrentPage(1);
  }, [audits]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiService.getAuditReport();
        if (!data) {
          throw new Error("No data received from API");
        }
        const activityLogs = data.activityLogList || [];
        if (!activityLogs.length) {
          throw new Error("No activity logs found in response");
        }

        const processedActivities = activityLogs.map((log) => {
          return {
            timestamp: formatTimestamp(log.timestamp),
            action: log.action || "Not available",
            user: log.user || "undefined",
          };
        });
        setAudits(processedActivities);
        setFilteredAudits(processedActivities);
        setCurrentPage(1);
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBackToRegistration = () => {
    navigate("/registration-report");
  };

  const handleHomeView = () => {
    navigate("/home");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setIsAuthenticated(false);
    navigate("/");
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return <div className="loading-dark">Loading audit report...</div>;
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dark-theme">
      <div className="header-dark">
        <button onClick={handleHomeView} className="home-button">
          <img src={HomeImage} alt="Home Visual" className="home-img" />
        </button>
        <h2 className="header-title">Vkenpay Audit Report</h2>
        {userName && <span className="username">{userName}</span>}
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
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <tr key={item.requestId}>
                <td>{item.timestamp}</td>
                <td>{item.action}</td>
                <td>{item.user}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="no-data">
                No Audit data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {filteredAudits.length > itemsPerPage && (
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
        Showing {filteredAudits.length > 0 ? indexOfFirstItem + 1 : 0}-
        {Math.min(indexOfLastItem, filteredAudits.length)} of{" "}
        {filteredAudits.length} items
      </div>

      <button onClick={handleBackToRegistration} className="back-button">
        ← Back to Registration
      </button>
    </div>
  );
};

export default AuditReportView;
