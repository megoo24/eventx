// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (token && userData) {
          // Verify token is still valid by making a request
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          
          try {
            const response = await api.get("/api/auth/profile");
            setUser(response.data);
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            delete api.defaults.headers.common["Authorization"];
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log("Login attempt with:", { email, password });
      const response = await api.post("/api/auth/login", { email, password });

      const { token, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Set auth header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response data:", error.response?.data);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          "Login failed. Please check your credentials.";
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = "user") => {
    try {
      setLoading(true);
      const response = await api.post("/api/auth/register", { name, email, password, role });
      const { token, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Set auth header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          "Registration failed. Please try again.";
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token and user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Remove auth header
    delete api.defaults.headers.common["Authorization"];
    
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const response = await api.get("/api/auth/profile");
      setUser(response.data);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      updateUser, 
      refreshToken,
      loading,
      isInitialized,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
