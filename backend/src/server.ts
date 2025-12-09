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
import { createServer } from "http";
import { connectDatabase } from "./config/database.js";
import { initSentry, Sentry } from "./config/sentry.js";
import { connectRedis } from "./config/redis.js";
import { initializeSocket } from "./config/socket.js";
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
import supportRoutes from "./routes/support.routes.js";
import securityRoutes from "./routes/security.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import escrowRoutes from "./routes/escrow.routes.js";
import financialRoutes from "./routes/financial.routes.js";
import launchRoutes from "./routes/launch.routes.js";
import sponsorRoutes from "./routes/sponsor.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import draftRoutes from "./routes/draft.routes.js";
import validationRoutes from "./routes/validation.routes.js";
import templateRoutes from "./routes/template.routes.js";
import targetingRoutes from "./routes/targeting.routes.js";
import previewRoutes from "./routes/preview.routes.js";
import requirementRoutes from "./routes/requirement.routes.js";
import bulkRoutes from "./routes/bulk.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import abtestRoutes from "./routes/abtest.routes.js";
import postbackRoutes from "./routes/postback.routes.js";
import offerwallRoutes from "./routes/offerwall.routes.js";
import currencyRoutes from "./routes/currency.routes.js";
import providerRoutes from "./routes/provider.routes.js";
import fraudRoutes from "./routes/fraud.routes.js";
import offerwallAnalyticsRoutes from "./routes/offerwall-analytics.routes.js";
import { setupDraftCleanupJob } from "./jobs/draftCleanup.job.js";
import { startTaskExpiryJob } from "./jobs/taskExpiry.job.js";
import { startScheduleExecutionJob } from "./jobs/scheduleExecution.job.js";
import { startBudgetMonitoringJob } from "./jobs/budgetMonitoring.job.js";
import { startExchangeRateUpdateJob } from "./jobs/exchangeRateUpdate.job.js";
import { startProviderHealthCheckJob } from "./jobs/providerHealthCheck.job.js";

// Initialize Sentry
initSentry();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || "v1";

// Middleware
// Sentry integration (optional - configure if needed)
// if (process.env.SENTRY_DSN) {
//   app.use(Sentry.Handlers.requestHandler());
// }
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
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
// Register draft routes BEFORE task routes to avoid conflict with /:taskId
app.use(`/api/${API_VERSION}/tasks/drafts`, draftRoutes);
app.use(`/api/${API_VERSION}/tasks`, taskRoutes);
app.use(`/api/${API_VERSION}/gamification`, gamificationRoutes);
app.use(`/api/${API_VERSION}/referrals`, referralRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/support`, supportRoutes);
app.use(`/api/${API_VERSION}/security`, securityRoutes);
app.use(`/api/${API_VERSION}/analytics`, analyticsRoutes);
app.use(`/api/${API_VERSION}`, escrowRoutes);
app.use(`/api/${API_VERSION}`, financialRoutes);
app.use(`/api/${API_VERSION}`, launchRoutes);
app.use(`/api/${API_VERSION}/sponsors`, sponsorRoutes);
app.use(`/api/${API_VERSION}/upload`, uploadRoutes);
app.use(`/api/${API_VERSION}/validation`, validationRoutes);
app.use(`/api/${API_VERSION}/templates`, templateRoutes);
app.use(`/api/${API_VERSION}/targeting`, targetingRoutes);
app.use(`/api/${API_VERSION}/preview`, previewRoutes);
app.use(`/api/${API_VERSION}/requirements`, requirementRoutes);
app.use(`/api/${API_VERSION}/bulk`, bulkRoutes);
app.use(`/api/${API_VERSION}/schedules`, scheduleRoutes);
app.use(`/api/${API_VERSION}/budgets`, budgetRoutes);
app.use(`/api/${API_VERSION}/abtests`, abtestRoutes);
app.use(`/api/${API_VERSION}/postback`, postbackRoutes);
app.use(`/api/${API_VERSION}/offerwalls`, offerwallRoutes);
app.use(`/api/${API_VERSION}/currency`, currencyRoutes);
app.use(`/api/${API_VERSION}/providers`, providerRoutes);
app.use(`/api/${API_VERSION}/fraud`, fraudRoutes);
app.use(`/api/${API_VERSION}/offerwall-analytics`, offerwallAnalyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Sentry error handler is set up with setupExpressErrorHandler above

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    Sentry.captureException(err);
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

    // Initialize Socket.io
    initializeSocket(httpServer);
    console.log("✅ Socket.io initialized");

    // Setup cron jobs
    setupDraftCleanupJob();
    startTaskExpiryJob();
    startScheduleExecutionJob();
    startBudgetMonitoringJob();
    startExchangeRateUpdateJob();
    startProviderHealthCheckJob();

    // Start listening
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `📡 API available at http://localhost:${PORT}/api/${API_VERSION}`
      );
      console.log(`🏥 Health check at http://localhost:${PORT}/health`);
      console.log(`🔌 WebSocket available at ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
