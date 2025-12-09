require("dotenv").config();

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    packagerHostname:
      process.env.EXPO_PUBLIC_PACKAGER_HOSTNAME || "10.107.148.25",
    VIDFLOW_API_URL:
      process.env.EXPO_PUBLIC_VIDFLOW_API_URL || "http://10.107.148.25:3001",
    APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || "pro",
  },
});
