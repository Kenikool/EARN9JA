// PM2 Configuration for Production
module.exports = {
  apps: [
    {
      name: "ecommerce-api",
      script: "./src/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 8000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      max_memory_restart: "1G",
      exp_backoff_restart_delay: 100,
      watch: false,
      ignore_watch: ["node_modules", "logs"],
      max_restarts: 10,
      min_uptime: "10s",
      listen_timeout: 3000,
      kill_timeout: 5000,
      wait_ready: true,
      autorestart: true,
      cron_restart: "0 0 * * *", // Restart daily at midnight
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    {
      name: "subscription-processor",
      script: "./scripts/processSubscriptions.js",
      cron_restart: "0 */6 * * *", // Run every 6 hours
      autorestart: false,
      watch: false,
    },
  ],
};
