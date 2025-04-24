import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import RegistrationReport from "./components/RegistrationReport";
import Verification from "./components/VerificationReport";
import Audit from "./components/AuditReport";
import Home from "./components/Home";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
             <Route
          path="/home"
          element={
            isAuthenticated ? <Home setIsAuthenticated={setIsAuthenticated} /> :
          <Navigate to="/" />
        }
        />
        <Route
          path="/registration-report"
          element={
            isAuthenticated ? 
            <RegistrationReport setIsAuthenticated={setIsAuthenticated} /> : 
            <Navigate to="/" />
        } 
        />
        <Route
          path="/verification/:requestId"
          element={isAuthenticated ? 
          <Verification setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />}
        />
          <Route
          path="/audit-report"
          element={isAuthenticated ? 
          <Audit setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
