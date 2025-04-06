import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../components/Api";

const VerificationView = ({setIsAuthenticated}) => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const startTime = "Tue Oct 01 00:00:00 IST 2024";
      const endTime = "Tue Oct 08 23:59:59 IST 2024";
      
        const data = await apiService.getTimestampReport(startTime, endTime);
        console.log(data);
        if (!data) {
          throw new Error("No data received from API");
        }
        const registrationList = data.registerResponseDtoList || [];
console.log(registrationList);
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
              issuedCardInfo:initialRequest?.issuedCardInfo || {
                cardPan: initialRequest?.issuedCardInfo.cardPan || "Not available",
                cardCvv:initialRequest?.issuedCardInfo.cardCvv || "Not available",
                expDate: initialRequest?.issuedCardInfo.expDate || "Not available",
                firstName: initialRequest?.issuedCardInfo.firstName || "Not available",
                lastName: initialRequest?.issuedCardInfo.lastName ||  "Not available",
                city: initialRequest?.issuedCardInfo.city || "Not available",
                phoneNo: initialRequest?.issuedCardInfo.phoneNo || "Not available",
              },
            };
          })
          .filter((reg) => reg !== null);
        if (!processedRegistrations.length) {
          throw new Error("No valid registration data found");
        }

        setVerifications(processedRegistrations);
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

  if (loading) {
    return <div className="loading-dark">Loading verification report...</div>;
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    navigate('/');
  };
  return (
    <div className="dark-theme">
      <div className="header-dark">
        <h2 className="header-title">Verification Report</h2>
        <button onClick={handleLogout} className="logout-button">
        Logout
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Request ID</th>
            <th>Number to Verify</th>
            <th>Issuer Code</th>
            <th>Status Message</th>
            <th>Status Code</th>
          </tr>
        </thead>
        <tbody>
          {verifications.length > 0 ? (
            verifications.map((item) => (
              <tr key={item.requestId}>
                <td>{item.timestamp}</td>
                <td>{item.requestId}</td>
                <td>{item.issuedCardInfo.cardPan}</td>
                <td>{item.issuerCode}</td>
                <td>{item.statusMessage}</td>
                <td>{item.statusCode}</td>
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

      <button onClick={handleBackToRegistration} className="back-button">
        ← Back to Registration
      </button>
    </div>
  );
};

export default VerificationView;
