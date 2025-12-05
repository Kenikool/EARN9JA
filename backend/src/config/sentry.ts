import * as Sentry from "@sentry/node";

export const initSentry = () => {
  if (process.env.SENTRY_DSN) {
    const integrations: any[] = [];

    // Try to load profiling integration if available
    try {
      const { nodeProfilingIntegration } = require("@sentry/profiling-node");
      integrations.push(nodeProfilingIntegration());
    } catch (error) {
      console.warn(
        "Sentry profiling not available - this is normal in development or with Node.js v23+"
      );
    }

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      integrations,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    });
  }
};

export { Sentry };
