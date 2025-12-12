import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashborad from "./pages/Dashborad";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import useAuthStore from "./stores/authStore";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashborad />} />
        {/* Additional protected routes will be added here */}
        <Route path="analytics" element={<div>Analytics Page</div>} />
        <Route path="users" element={<div>User Management Page</div>} />
        <Route path="tasks" element={<div>Task Management Page</div>} />
        <Route
          path="withdrawals"
          element={<div>Withdrawal Management Page</div>}
        />
        <Route path="disputes" element={<div>Dispute Resolution Page</div>} />
        <Route path="revenue" element={<div>Revenue & Payments Page</div>} />
        <Route path="platform" element={<div>Platform Management Page</div>} />
        <Route path="support" element={<div>Support Page</div>} />
        <Route path="settings" element={<div>Settings Page</div>} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
