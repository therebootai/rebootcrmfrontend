import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null); // Initialize with null

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores the full user object from the backend
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Derived state
  const [loading, setLoading] = useState(true);

  // Function to set user and authentication status
  const setAuthData = (userData) => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("token", localStorage.getItem("token")); // Keep existing token
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  // Helper function to check user roles
  const hasRole = (requiredRoles) => {
    // Ensure user and user.role exist before checking
    if (!user || !user.designation) return false;
    // Assuming user.role is a single string (e.g., "admin", "telecaller")
    return requiredRoles.includes(user.designation.toLowerCase());
  };

  // Function to fetch current user data from the backend using the /check-me endpoint
  const fetchCurrentUser = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      setAuthData(null); // No token or user data, so not authenticated
      setLoading(false);
      return;
    }

    try {
      // Use the general check-me endpoint to re-validate and get all user details
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/auth/check-me`, // Using your new endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.user) {
        // Backend successfully returned validated user data
        setAuthData(response.data.user);
        // hasRole(response.data.user.designation.toLowerCase());
      } else {
        // Token might be invalid or expired, or backend returned success: false
        console.warn("Authentication check failed with token. Clearing data.");
        setAuthData(null); // Clear data
      }
    } catch (error) {
      console.error(
        "Failed to fetch current user (check-me API error):",
        error
      );
      // If API call fails (e.g., network error, 401 Unauthorized), clear data
      setAuthData(null);
    } finally {
      setLoading(false);
    }
  };

  // Function for handling user login
  const login = async (token, userData) => {
    // This function should be called by your login page after successful authentication
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData)); // Store the full user object
    setAuthData(userData); // Update state
  };

  // Function for handling user logout
  const logout = () => {
    setAuthData(null); // This clears both token and user from localStorage
    // Any navigation after logout should be handled by the component that calls logout.
  };

  // Effect hook to fetch user data on component mount
  useEffect(() => {
    fetchCurrentUser();
  }, []); // Empty dependency array means this runs only once on mount

  // Display a loader while authentication status is being determined
  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="spinner"></div> {/* Your spinner CSS */}
      </div>
    );
  }

  // Provide the user object, authentication status, and helper functions to children
  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
