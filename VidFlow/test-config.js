// Quick test to verify environment variables are loaded
const Constants = require("expo-constants").default;

console.log("=== VidFlow Configuration Test ===");
console.log("API URL:", Constants.expoConfig?.extra?.VIDFLOW_API_URL);
console.log("App Version:", Constants.expoConfig?.extra?.APP_VERSION);
console.log(
  "Full Extra Config:",
  JSON.stringify(Constants.expoConfig?.extra, null, 2)
);
console.log("================================");
