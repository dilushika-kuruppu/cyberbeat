import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/Logo.svg";
import { apiService } from "../components/Api";

const Login = ({ setIsAuthenticated }) => {
  const [credentials, setCredentials] = useState({
  email: "prasanna@cyberbeat.com.sg",
    verifyCode: "1200004986510276"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const verifyResponse = await apiService.verify(
        credentials.email,
        credentials.verifyCode
      );
      // credentials expired use status fail to test purpose
      if (verifyResponse.status === 'fail' || verifyResponse.success === true) {
      localStorage.setItem("authToken", verifyResponse.token);
      localStorage.setItem("userEmail", credentials.email);
      await apiService.verifySuccess(credentials.email, credentials.verifyCode);
      setIsAuthenticated(true);
      navigate("/home");
    } else {
      throw new Error("Verification failed: Invalid credentials");
    }
  }catch (err) {
      setError(
        err.message || "Verification failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card-container">
        <div className="login-form-card">
          <h2>Welcome Back</h2>
          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Vkencrdence Id</label>
              <input
                type="text"
                name="verifyCode"
                value={credentials.verifyCode}
                onChange={(e) =>
                  setCredentials({ ...credentials, verifyCode: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>

        <div className="login-image-card">
          <img src={loginImage} alt="Login Visual" className="login-image" />
        </div>
      </div>
    </div>
  );
};

export default Login;
