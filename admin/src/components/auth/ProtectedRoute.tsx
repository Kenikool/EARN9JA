import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = true,
}) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if admin role is required
  if (requireAdmin && !user.roles.includes("admin")) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

export default ProtectedRoute;
