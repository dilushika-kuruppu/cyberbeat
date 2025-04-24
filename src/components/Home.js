import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleViewRegistration = () => {
    navigate("/registration-report");
  };

  const handleViewVerification = () => {
    navigate("/verification/requestId");
  };

 const  handleViewAudit = () => {
navigate("/audit-report")
 };
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <div className="dark-theme home-page">
      <div className="header-dark">
        <h1 className="header-title">Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="cards-container">
        <div className="dashboard-card" onClick={handleViewRegistration}>
          <div className="card-icon">
            <i className="fas fa-user-plus"></i>
          </div>
          <h2>Registration Report</h2>
          <button className="card-button">View Report</button>
        </div>

        <div className="dashboard-card" onClick={handleViewVerification}>
          <div className="card-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Verification Report</h2>
          <button className="card-button">View Report</button>
        </div>
      </div>
      <div className="cards-container">
        <div className="dashboard-card" onClick={handleViewAudit}>
          <div className="card-icon">
            <i className="fas fa-check"></i>
          </div>
          <h2>Audit Report</h2>
          <button className="card-button">View Audit Report</button>
        </div>
        </div>
    </div>
  );
};

export default Home;
