import axios from "axios";

// Determine the API URL based on environment
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // If running on localhost, use local backend
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:5000/api";
  }

  // Otherwise, use production backend URL
  return "https://gym-workout-nanu.onrender.com/api";
};

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // Enable for cookies
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
