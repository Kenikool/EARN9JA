// Centralized JWT configuration to ensure consistency
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || "your-secret-key",
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};

console.log("🔑 JWT Config loaded:");
console.log("  SECRET:", JWT_CONFIG.SECRET.substring(0, 20) + "...");
console.log(
  "  REFRESH_SECRET:",
  JWT_CONFIG.REFRESH_SECRET.substring(0, 20) + "..."
);
