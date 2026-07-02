// axiosInstance.ts
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// ✅ Request Interceptor - Token attach करें
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    
    console.log("🔐 Axios Request Interceptor:");
    console.log("   URL:", config.url);
    console.log("   Token exists:", !!token);
    
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("   ✅ Token attached");
    } else {
      console.log("   ❌ No token found");
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor - Auto logout on 401
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Axios Response:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log("❌ Axios Error:", error.response?.status, error.config?.url);
    
    // ✅ Auto logout on 401
    if (error.response?.status === 401) {
      console.log("🔐 Token expired/invalid - Redirecting to login");
      
      // Clear storage
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      
      // Redirect to login
      window.location.href = '/superadmin/login';
      
      // Show message
      if (typeof window !== 'undefined') {
        alert("Your session has expired. Please login again.");
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;