// src/api/apiClient.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/",
  timeout: 30000,
});

// Request interceptor - Fix for FormData
apiClient.interceptors.request.use(
  (config) => {
    console.log("API Request Interceptor:", {
      url: config.url,
      method: config.method,
      dataType: config.data instanceof FormData ? "FormData" : typeof config.data,
      hasFiles: config.data instanceof FormData,
    });
        
    const accessToken = localStorage.getItem("access");
    const token = localStorage.getItem("access");
    // Use whichever token is available
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    } else if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }

    //  IMPORTANT: Agar FormData hai toh Content-Type header remove karein
    if (config.data instanceof FormData) {

      delete config.headers["Content-Type"];
      // Content-Length bhi remove karein
      delete config.headers["Content-Length"];
    } else {
      //  Agar FormData nahi hai toh default JSON set karein
      if (!config.headers["Content-Type"] && config.data) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    console.log(" Final Headers:", config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(" API Response:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      console.warn("Session expired - 401 detected");
    }
    return Promise.reject(error);
  }
);

export default apiClient;