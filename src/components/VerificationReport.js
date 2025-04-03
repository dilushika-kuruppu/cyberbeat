import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../components/Api';

const VerificationView = () => {
    const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  
  
//    const mockRegistrations = [
//     {
//       timestamp: "2023-05-15T10:30:00Z",
//       requestId: "REQ12345",
//       issuerCode: "ISS001",
//       numbertoverify: "12",
//       statusMessage: "Success",
//       statusCode: "200",

//     },
//     {
//       timestamp: "2023-05-16T11:45:00Z",
//       requestId: "REQ67890",
//       issuerCode: "ISS002",
//       numbertoverify: "2",
//       statusMessage: "Pending",
//       statusCode: "202",
//       activationCode: "ACT456",
     
//     }
//   ];
  

   useEffect(() => {
    const fetchData = async () => {
      try {
        // Using issuer ID 43 as shown in your Postman collection
        const data = await apiService.getIssuerReport(43);
        setVerifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    //   const timer = setTimeout(() => {
    //     try {
    //       const data = await apiService.getIssuerReport(43);
    //       setReportData(data);
    //         // setVerifications(mockRegistrations);
    //       setLoading(false);
    //     } catch (err) {
    //       setError(err.message);
    //       setLoading(false);
    //     }
    //   }, 500);
  
    //   return () => clearTimeout(timer);
    // }, []);
    const handleBackToRegistration = () => {
      navigate('/registration-report');
    };
  
    if (loading) {
      return <div className="loading-dark">Loading verification report...</div>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }
  
    return (
        <div className="dark-theme">
      <div className="header-dark">
        <h2>Verification Report</h2>
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
                  <td>{item.numberToVerify}</td>
                  <td>{item.issuerCode}</td>
                  <td>{item.statusMessage}</td>
                  <td>{item.statusCode}</td>
                </tr>
            ))
        ) : (
          <tr>
            <td colSpan="9" className="no-data">No registration data available</td>
          </tr>
        )}
            </tbody>
          </table>
    
          <button 
            onClick={handleBackToRegistration}
            className="back-button"
          >
            ← Back to Registration
          </button>
        </div>
      );
    };
    
    export default VerificationView;  