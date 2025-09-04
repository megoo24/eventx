import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import LoadingSpinner from "./LoadingSpinner.js";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (!isInitialized || loading) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement if specified
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on user's actual role
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
