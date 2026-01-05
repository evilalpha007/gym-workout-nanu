import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // Adjust if deployed
  withCredentials: true, // Enable for cookies
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
      console.error("Network error - Backend server might not be running");
      error.message =
        "Cannot connect to server. Please make sure the backend is running on port 5000.";
    }
    return Promise.reject(error);
  }
);

export default api;
