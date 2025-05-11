import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/Logo.svg";
import { apiService } from "../components/Api";
import Webcam from "react-webcam";
import { FaQrcode, FaTimes } from "react-icons/fa";
import jsQR from "jsqr";

const Login = ({ setIsAuthenticated }) => {
  const [credentials, setCredentials] = useState({
    email: "prasanna@cyberbeat.com.sg",
    verifyCode: "1200004986510276",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const name = credentials.email.split("@")[0];
    try {
      const verifyResponse = await apiService.verify(
        credentials.email,
        credentials.verifyCode
      );
      if (verifyResponse.status === "success" || verifyResponse.success === true) {
        localStorage.setItem("authToken", verifyResponse.token);
        localStorage.setItem("userEmail", credentials.email);
        localStorage.setItem(
          "userName",
          name.charAt(0).toUpperCase() + name.slice(1)
        );
        await apiService.verifySuccess(
          credentials.email,
          credentials.verifyCode
        );
        setIsAuthenticated(true);
        navigate("/home");
      } else {
        throw new Error("Verification failed: Invalid credentials");
      }
    } catch (err) {
      setError(
        err.message || "Verification failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const captureAndScan = useCallback(() => {
    if (!webcamRef.current || !showScanner) return;

    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      if (!video || video.readyState !== 4) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        setCredentials(prev => ({ ...prev, verifyCode: code.data }));
        setShowScanner(false);
      }
    } catch (err) {
      console.error("QR scan error:", err);
    }
  }, [showScanner]);

  useEffect(() => {
    let interval;
    if (showScanner) {
      interval = setInterval(() => {
        captureAndScan();
      }, 500);
    }
    return () => clearInterval(interval);
  }, [showScanner, captureAndScan]);
  const toggleScanner = () => {
    setShowScanner(!showScanner);
    setCameraError(null);
  };

  const videoConstraints = {
    facingMode: "environment",
    width: { ideal: 1280 },
    height: { ideal: 720 },
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
              <div className="input-with-button">
                <input
                  type="text"
                  name="verifyCode"
                  value={credentials.verifyCode}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      verifyCode: e.target.value,
                    })
                  }
                  required
                  disabled={loading}
                  className="verify-input"
                />
                <button
                  type="button"
                  className="qr-button"
                  onClick={toggleScanner}
                  disabled={loading}
                >
                  {showScanner ? <FaTimes /> : <FaQrcode />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          {showScanner && (
            <div className="qr-scanner-container">
              <Webcam
                audio={false}
                ref={webcamRef}
                videoConstraints={videoConstraints}
                onUserMediaError={(err) => {
                  setCameraError(err.message || "Failed to access camera");
                  setShowScanner(false);
                }}
                className="webcam-element"
              />
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
              {cameraError && (
                <p className="error-message">{cameraError}</p>
              )}
              <p className="scan-instruction">
                Point your camera at the QR code
              </p>
              <div className="scanning-overlay">
                <div className="scanning-line" />
              </div>
            </div>
          )}
        </div>

        <div className="login-image-card">
          <img src={loginImage} alt="Login Visual" className="login-image" />
        </div>
      </div>
    </div>
  );
};

export default Login;