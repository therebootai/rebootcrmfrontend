import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, hasRole } = useContext(AuthContext); // Get hasRole from context

  if (loading) {
    // Still loading user data, show a loader
    return (
      <div className="fullscreen-loader">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login
    return <Navigate to="/" replace />;
  }

  // Check roles only if allowedRoles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userHasRequiredRole = hasRole(allowedRoles);
    if (!userHasRequiredRole) {
      // Authenticated but no permission, redirect to unauthorized page
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has the required role(s), render the child routes/component
  return <Outlet />;
};

export default ProtectedRoute;
