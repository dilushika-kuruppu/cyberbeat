const API_BASE =
  "http://vkenpayreport.us-east-2.elasticbeanstalk.com/v1/report";

const logVerification = (action, status, message, metadata = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    status,
    message,
    user: localStorage.getItem("userEmail") || "unknown",
    ...metadata,
  };
};

export const apiService = {
  verify: async (email, verifyCode) => {
    try {
      logVerification("verify_attempt", "started", "Verification initiated", {
        email,
      });

      const response = await fetch(`${API_BASE}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, verifyCode }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Verification failed";

        logVerification("verify_attempt", "failed", errorMessage, {
          email,
          status: response.status,
          response: errorData,
        });

        throw new Error(errorMessage);
      }

      const data = await response.json();
      logVerification("verify_attempt", "success", "Verification successful", {
        email,
        issuers: data.issuers,
        permissions: data.permissionObj?.permissionList,
      });
      if (data.permissionObj?.permissionList) {
        localStorage.setItem(
          "userPermissions",
          JSON.stringify(data.permissionObj.permissionList)
        );
      }
      return data;
    } catch (error) {
      logVerification("verify_attempt", "error", {
        email,
        error: error.message,
      });
      throw error;
    }
  },

  // Report success verification
  verifySuccess: async (email, verifyCode) => {
    try {
      logVerification("verify_success", "success", "verification success", {
        email,
      });

      const response = await fetch(`${API_BASE}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://localhost:3000",
        },
        body: JSON.stringify({ email, verifyCode }),
      });

      if (!response.ok) {
        logVerification("verify_success", "fail", "verification fail", {
          email,
          status: response.status,
        });
        throw new Error("Success verification failed");
      }

      const data = await response.json();
      logVerification("verify_success", "completed", { email });
      return data;
    } catch (error) {
      logVerification("verify_success", "error", {
        email,
        error: error.message,
      });
      throw error;
    }
  },

  // Get issuer report
  getIssuerReport: async (issuerCodes, userId) => {
    try {
      const permissions = JSON.parse(
        localStorage.getItem("userPermissions") || "[]"
      );
      if (
        !permissions.includes("admin") &&
        !permissions.includes("superAdmin")
      ) {
        throw new Error(
          "Unauthorized: You don't have permission to access this report"
        );
      }

      logVerification(
        "fetch_report",
        "started",
        "Fetching registration report",
        {
          issuerCodes,
          userId,
        }
      );
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE}/registrationList`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          issurCode: Array.isArray(issuerCodes)
            ? issuerCodes
            : [String(issuerCodes)],
          userId: userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch issuer report");
      return await response.json();
    } catch (error) {
      logVerification("fetch_issuer", "error", {
        issuerCodes,
        userId,
        error: error.message,
      });
      throw error;
    }
  },

  // Get timestamp report
  getTimestampReport: async (startTime, endTime) => {
    try {
      const permissions = JSON.parse(
        localStorage.getItem("userPermissions") || "[]"
      );
      if (
        !permissions.includes("admin") &&
        !permissions.includes("superAdmin")
      ) {
        throw new Error(
          "Unauthorized: You don't have permission to access this report"
        );
      }

      logVerification(
        "fetch_report",
        "started",
        "Fetching registration report",
        {
          startTime,
          endTime,
        }
      );
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams({ startTime, endTime });
      const response = await fetch(`${API_BASE}/timestamp?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch timestamp report");
      return await response.json();
    } catch (error) {
      logVerification("fetch_timestamp", "error", {
        startTime,
        endTime,
        error: error.message,
      });
      throw error;
    }
  },

  // Get audit report
  getAuditReport: async (email) => {
    try {
      const permissions = JSON.parse(
        localStorage.getItem("userPermissions") || "[]"
      );
      if (
        !permissions.includes("user") &&
        !permissions.includes("superAdmin")
      ) {
        throw new Error(
          "Unauthorized: You don't have permission to access this report"
        );
      }

      logVerification(
        "fetch_report",
        "started",
        "Fetching registration report",
        {
          email,
        }
      );
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE}/activityList`, {
        headers: {
          User: email,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch audit report");
      return await response.json();
    } catch (error) {
      logVerification("fetch_issuer", "error", {
        error: error.message,
      });
      throw error;
    }
  },
};
