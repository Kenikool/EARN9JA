require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const videoRoutes = require("./routes/video.routes");

const app = express();
const PORT = process.env.PORT || 3001;
const APP_VERSION = process.env.APP_VERSION || "pro";

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : "*",
  methods: ["GET", "POST"],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/video", videoRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "VidFlow Backend API",
    version: APP_VERSION,
    endpoints: {
      health: "/health",
      videoInfo: "/api/video/info?url=VIDEO_URL",
      downloadUrl: "/api/video/download-url?url=VIDEO_URL&quality=720p",
      qualities: "/api/video/qualities?url=VIDEO_URL",
      ytdlpHealth: "/api/video/health",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎬 VidFlow Backend API                             ║
║                                                       ║
║   Version: ${APP_VERSION.toUpperCase().padEnd(42)}║
║   Port: ${PORT.toString().padEnd(45)}║
║   Environment: ${
    process.env.NODE_ENV?.padEnd(36) || "development".padEnd(36)
  }║
║                                                       ║
║   API Endpoints:                                      ║
║   • GET  /health                                      ║
║   • GET  /api/video/info                             ║
║   • GET  /api/video/download-url                     ║
║   • GET  /api/video/qualities                        ║
║   • GET  /api/video/health                           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
