// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple possible .env locations
const envPaths = [
  join(__dirname, "../.env"), // backend/.env (when running from backend/src)
  join(process.cwd(), ".env"), // .env (when running from backend/)
  join(process.cwd(), "backend/.env"), // backend/.env (when running from root)
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    console.log(`📄 Loading .env from: ${envPath}`);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn("⚠️  No .env file found in expected locations");
  console.warn("Searched:", envPaths);
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDatabase } from "./config/database.js";
import { connectRedis } from "./config/redis.js";
import admobRoutes from "./routes/admob.routes.js";
import adminAnalyticsRoutes from "./routes/adminAnalytics.routes.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import kycRoutes from "./routes/kyc.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import taskRoutes from "./routes/task.routes.js";
import gamificationRoutes from "./routes/gamification.routes.js";
import referralRoutes from "./routes/referral.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || "v1";

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Detailed status endpoint for debugging
app.get("/api/status", (req, res) => {
  res.status(200).json({
    success: true,
    server: "Earn9ja Backend",
    version: API_VERSION,
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "Check logs for MongoDB connection status",
      redis: "Check logs for Redis connection status",
      email: {
        configured: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER),
        host: process.env.EMAIL_HOST || "Not configured",
        user: process.env.EMAIL_USER || "Not configured",
      },
      sms: {
        configured: !!(
          process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ),
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/admob`, admobRoutes);
app.use(`/api/${API_VERSION}/admin/analytics`, adminAnalyticsRoutes);
app.use(`/api/${API_VERSION}/users`, profileRoutes);
app.use(`/api/${API_VERSION}/kyc`, kycRoutes);
app.use(`/api/${API_VERSION}/wallet`, walletRoutes);
app.use(`/api/${API_VERSION}/webhooks`, webhookRoutes);
app.use(`/api/${API_VERSION}/tasks`, taskRoutes);
app.use(`/api/${API_VERSION}/gamification`, gamificationRoutes);
app.use(`/api/${API_VERSION}/referrals`, referralRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Connect to Redis
    await connectRedis();

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `📡 API available at http://localhost:${PORT}/api/${API_VERSION}`
      );
      console.log(`🏥 Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
