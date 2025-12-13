import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashborad from "./pages/Dashborad";
import UserManagement from "./pages/Users";
import Tasks from "./pages/Tasks";
import Withdrawals from "./pages/Withdrawals";
import Disputes from "./pages/Disputes";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
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
        <Route path="users" element={<UserManagement />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/pending" element={<Tasks />} />
        <Route path="withdrawals" element={<Withdrawals />} />
        <Route path="withdrawals/pending" element={<Withdrawals />} />
        <Route path="disputes" element={<Disputes />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="search" element={<Search />} />
        {/* Placeholder pages - to be implemented */}
        <Route
          path="revenue"
          element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">
                Revenue & Payments - Coming Soon
              </h1>
            </div>
          }
        />
        <Route
          path="platform"
          element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">
                Platform Management - Coming Soon
              </h1>
            </div>
          }
        />
        <Route
          path="support"
          element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Support - Coming Soon</h1>
            </div>
          }
        />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
