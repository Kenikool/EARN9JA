import { Request, Response } from "express";

interface FrontendLog {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  userAgent?: string;
  url?: string;
  userId?: string;
}

/**
 * Log frontend events to backend console
 */
export const logFrontendEvent = async (req: Request, res: Response) => {
  try {
    const log: FrontendLog = req.body;
    const user = (req as any).user;

    // Format log message
    const prefix = `[FRONTEND ${log.level.toUpperCase()}]`;
    const userInfo = user ? `User: ${user.email} (${user._id})` : "Anonymous";
    const urlInfo = log.url ? `URL: ${log.url}` : "";
    const contextInfo = log.context
      ? `Context: ${JSON.stringify(log.context)}`
      : "";

    const fullMessage = `${prefix} ${log.message}
${userInfo}
${urlInfo}
${contextInfo}
User-Agent: ${log.userAgent || req.get("user-agent") || "Unknown"}
Timestamp: ${log.timestamp}`;

    // Log to console based on level
    switch (log.level) {
      case "error":
        console.error(fullMessage);
        break;
      case "warn":
        console.warn(fullMessage);
        break;
      case "debug":
        console.debug(fullMessage);
        break;
      default:
        console.log(fullMessage);
    }

    res.json({ success: true });
  } catch (error: unknown) {
    console.error("Failed to log frontend event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to log event",
    });
  }
};

/**
 * Batch log multiple frontend events
 */
export const logFrontendBatch = async (req: Request, res: Response) => {
  try {
    const logs: FrontendLog[] = req.body.logs || [];
    const user = (req as any).user;

    console.log(
      `[FRONTEND BATCH] Received ${logs.length} logs from ${
        user?.email || "Anonymous"
      }`
    );

    logs.forEach((log) => {
      const prefix = `[FRONTEND ${log.level.toUpperCase()}]`;
      const message = `${prefix} ${log.message} | ${log.url || ""} | ${
        log.timestamp
      }`;

      switch (log.level) {
        case "error":
          console.error(message, log.context || "");
          break;
        case "warn":
          console.warn(message, log.context || "");
          break;
        default:
          console.log(message, log.context || "");
      }
    });

    res.json({ success: true, logged: logs.length });
  } catch (error: unknown) {
    console.error("Failed to log frontend batch:", error);
    res.status(500).json({
      success: false,
      message: "Failed to log batch",
    });
  }
};
