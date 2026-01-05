import { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (error) {
        // Silently fail - user is not logged in or server is not available
        setUser(null);
        // Only log if it's not a connection error (to avoid spam)
        if (error.code !== "ERR_NETWORK" && error.code !== "ECONNREFUSED") {
          console.error("Auth check error:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await api.post("/auth/login", credentials);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data);
      navigate("/");
    },
    onError: (error) => {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED"
          ? "Cannot connect to server. Please make sure the backend is running."
          : "Login failed. Please try again.");
      alert(errorMessage);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (userData) => {
      const res = await api.post("/auth/signup", userData);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data);
      navigate("/");
    },
    onError: (error) => {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED"
          ? "Cannot connect to server. Please make sure the backend is running on port 5000."
          : "Signup failed. Please try again.");
      alert(errorMessage);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      navigate("/login");
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginMutation.mutate,
        signup: signupMutation.mutate,
        logout: logoutMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        isSigningUp: signupMutation.isPending,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
