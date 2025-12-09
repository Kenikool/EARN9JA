import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import connectDB from "./config/database.js";
import { initRedis } from "./config/redis.js";
import { startSessionCleanupScheduler } from "./jobs/sessionCleanup.js";
import { startPasswordExpiryCheck } from "./jobs/passwordExpiryCheck.js";
import { startAccountDeletionJob } from "./jobs/accountDeletion.js";
import { startExportCleanup } from "./jobs/exportCleanup.js";
import { scheduleStockChecks } from "./utils/inventoryMonitor.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Initialize Redis (optional - app will work without it)
initRedis().catch((err) => {
  console.warn("⚠️  Redis not available. Rate limiting will use memory store.");
});

// Start background jobs
startSessionCleanupScheduler();
startPasswordExpiryCheck();
startAccountDeletionJob();
startExportCleanup();
scheduleStockChecks();

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:8001",
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Import routes
import authRoutes from "./routes/authRoutes.js";
import twoFactorRoutes from "./routes/twoFactorRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import deviceTrustRoutes from "./routes/deviceTrustRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import privacyRoutes from "./routes/privacyRoutes.js";
import emailChangeRoutes from "./routes/emailChangeRoutes.js";
import clerkRoutes from "./routes/clerkRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import socialRoutes from "./routes/socialRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import giftCardRoutes from "./routes/giftCardRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/2fa", twoFactorRoutes);
app.use("/api/auth/security", securityRoutes);
app.use("/api/auth/sessions", sessionRoutes);
app.use("/api/auth/trusted-devices", deviceTrustRoutes);
app.use("/api/auth/account", accountRoutes);
app.use("/api/auth/privacy", privacyRoutes);
app.use("/api/auth/email", emailChangeRoutes);
app.use("/api/auth/clerk", clerkRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin/coupons", couponRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/gift-cards", giftCardRoutes);
app.use("/api", questionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";

  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health\n`);
});
