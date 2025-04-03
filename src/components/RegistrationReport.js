import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../components/Api';

const RegistrationReport = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  
//   const mockRegistrations = [
//     {
//       timestamp: "2023-05-15T10:30:00Z",
//       requestId: "REQ12345",
//       issuerCode: "ISS001",
//       emailId: "user1@example.com",
//       statusMessage: "Success",
//       statusCode: "200",
//       activationCode: "ACT123",
//       passcode1: "PASS1",
//       passcode2: "PASS2"
//     },
//     {
//       timestamp: "2023-05-16T11:45:00Z",
//       requestId: "REQ67890",
//       issuerCode: "ISS002",
//       emailId: "user2@example.com",
//       statusMessage: "Pending",
//       statusCode: "202",
//       activationCode: "ACT456",
//       passcode1: "PASS3",
//       passcode2: "PASS4"
//     }
//   ];

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     try {
  //       // setRegistrations(mockRegistrations);
  //       setRegistrations(reportData.registrations || []);
  //       setLoading(false);
  //     } catch (err) {
  //       setError(err.message);
  //       setLoading(false);
  //     }
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getIssuerReport(43);
        setRegistrations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

 
  const handleViewVerification = () => {
    navigate('/verification/requestId');
  };

  if (loading) {
    return <div className="loading-dark">Loading registration data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dark-theme">
      <div className="header-dark">
        <h2>Registration Report</h2>
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
            {registrations.length > 0 ? (
              registrations.map((item) => (
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
                <td colSpan="9" className="no-data">No registration data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button 
          onClick={handleViewVerification}
          className="next-button-dark"
        >
          View Verification Report →
        </button>
    </div>
  );
};

export default RegistrationReport;