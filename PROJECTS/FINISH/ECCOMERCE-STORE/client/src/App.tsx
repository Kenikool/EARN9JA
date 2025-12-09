import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";
import InstallPrompt from "./components/InstallPrompt";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmailSent from "./pages/VerifyEmailSent";
import VerifyEmail from "./pages/VerifyEmail";
import TwoFactorSetup from "./pages/TwoFactorSetup";
import TwoFactorVerify from "./pages/TwoFactorVerify";
import Sessions from "./pages/Sessions";
import TrustedDevices from "./pages/TrustedDevices";
import PrivacySettings from "./pages/PrivacySettings";
import AccountManagement from "./pages/AccountManagement";
import SocialAccounts from "./pages/SocialAccounts";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import AccountSettings from "./pages/AccountSettings";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminCoupons from "./pages/admin/Coupons";
import AdminShipping from "./pages/admin/Shipping";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminSupportChats from "./pages/admin/SupportChats";
import AdminFlashSales from "./pages/admin/FlashSales";
import VendorLayout from "./components/vendor/VendorLayout";
import VendorRegister from "./pages/vendor/VendorRegister";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProducts from "./pages/vendor/VendorProducts";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorPayouts from "./pages/vendor/VendorPayouts";
import Referrals from "./pages/Referrals";
import LoyaltyPoints from "./pages/LoyaltyPoints";
import FlashSales from "./pages/FlashSales";
import Deals from "./pages/Deals";
import Subscriptions from "./pages/Subscriptions";
import WalletPro from "./pages/WalletPro";
import GlobalSettings from "./pages/GlobalSettings";
import ChatWidget from "./components/ChatWidget";
import NewsletterPopup from "./components/NewsletterPopup";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <InstallPrompt />
      <ChatWidget />
      <NewsletterPopup />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="verify-email-sent" element={<VerifyEmailSent />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="2fa-verify" element={<TwoFactorVerify />} />

          {/* Protected Routes */}
          <Route
            path="2fa-setup"
            element={
              <ProtectedRoute>
                <TwoFactorSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="sessions"
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="trusted-devices"
            element={
              <ProtectedRoute>
                <TrustedDevices />
              </ProtectedRoute>
            }
          />
          <Route
            path="privacy-settings"
            element={
              <ProtectedRoute>
                <PrivacySettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="account-management"
            element={
              <ProtectedRoute>
                <AccountManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="social-accounts"
            element={
              <ProtectedRoute>
                <SocialAccounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="account-settings"
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="referrals"
            element={
              <ProtectedRoute>
                <Referrals />
              </ProtectedRoute>
            }
          />
          <Route
            path="loyalty-points"
            element={
              <ProtectedRoute>
                <LoyaltyPoints />
              </ProtectedRoute>
            }
          />
          <Route path="flash-sales" element={<FlashSales />} />
          <Route path="deals" element={<Deals />} />
          <Route
            path="subscriptions"
            element={
              <ProtectedRoute>
                <Subscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="wallet"
            element={
              <ProtectedRoute>
                <WalletPro />
              </ProtectedRoute>
            }
          />
          <Route
            path="global-settings"
            element={
              <ProtectedRoute>
                <GlobalSettings />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Auth Routes (No Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Admin Routes (With Layout) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="flash-sales" element={<AdminFlashSales />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="shipping" element={<AdminShipping />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="support-chats" element={<AdminSupportChats />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Vendor Routes */}
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route
          path="/vendor"
          element={
            <ProtectedRoute>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="payouts" element={<VendorPayouts />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
