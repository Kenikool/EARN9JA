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
import Notifications from "./pages/Notifications";
import Revenue from "./pages/Revenue";
import Platform from "./pages/Platform";
import Support from "./pages/Support";
import PlatformSettings from "./pages/PlatformSettings";
import MessagingCenter from "./pages/MessagingCenter";
import VersionManager from "./pages/VersionManager";
import KYC from "./pages/KYC";
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

        {/* User Management Routes */}
        <Route path="users" element={<UserManagement />} />
        <Route path="users/active" element={<UserManagement />} />
        <Route path="users/suspended" element={<UserManagement />} />

        {/* Task Management Routes */}
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/pending" element={<Tasks />} />
        <Route path="tasks/approved" element={<Tasks />} />
        <Route path="tasks/rejected" element={<Tasks />} />

        {/* Withdrawal Management Routes */}
        <Route path="withdrawals" element={<Withdrawals />} />
        <Route path="withdrawals/pending" element={<Withdrawals />} />
        <Route path="withdrawals/approved" element={<Withdrawals />} />
        <Route path="withdrawals/rejected" element={<Withdrawals />} />

        {/* Dispute Routes */}
        <Route path="disputes" element={<Disputes />} />
        <Route path="disputes/pending" element={<Disputes />} />
        <Route path="disputes/resolved" element={<Disputes />} />

        {/* Other Routes */}
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Settings />} />
        <Route path="search" element={<Search />} />
        <Route path="notifications" element={<Notifications />} />

        {/* Revenue & Payments Routes */}
        <Route path="revenue" element={<Revenue />} />
        <Route path="revenue/payments" element={<Revenue />} />
        <Route path="revenue/commission" element={<Revenue />} />

        {/* Platform Management Routes */}
        <Route path="platform" element={<Platform />} />
        <Route path="platform/status" element={<Platform />} />
        <Route path="platform/security" element={<Platform />} />
        <Route path="platform/config" element={<Platform />} />
        <Route path="platform/settings" element={<PlatformSettings />} />

        {/* Messaging Routes */}
        <Route path="messaging" element={<MessagingCenter />} />

        {/* Version Management Routes */}
        <Route path="versions" element={<VersionManager />} />

        {/* KYC Routes */}
        <Route path="kyc" element={<KYC />} />
        <Route path="kyc/pending" element={<KYC />} />
        <Route path="kyc/approved" element={<KYC />} />
        <Route path="kyc/rejected" element={<KYC />} />

        {/* Support Routes */}
        <Route path="support" element={<Support />} />
        <Route path="support/tickets" element={<Support />} />
        <Route path="support/faqs" element={<Support />} />
        <Route path="support/messages" element={<Support />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
