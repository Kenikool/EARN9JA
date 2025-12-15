import api from "./authService";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  url?: string;
  userAgent?: string;
  platform?: "web" | "mobile";
}

class LoggerService {
  private logQueue: LogEntry[] = [];
  private flushInterval: number = 5000; // Flush every 5 seconds
  private maxQueueSize: number = 50;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private platform: "web" | "mobile" = "web";

  constructor() {
    // Detect platform
    this.platform = typeof window !== "undefined" ? "web" : "mobile";

    // Start auto-flush timer
    this.startAutoFlush();

    // Flush on page unload (web only)
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.flush();
      });
    }
  }

  private startAutoFlush() {
    this.flushTimer = setInterval(() => {
      if (this.logQueue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async sendToBackend(log: LogEntry) {
    try {
      await api.post("/logs", log);
    } catch (error) {
      // Silently fail - don't want logging to break the app
      console.error("Failed to send log to backend:", error);
    }
  }

  private async sendBatch(logs: LogEntry[]) {
    try {
      await api.post("/logs/batch", { logs });
    } catch (error) {
      console.error("Failed to send log batch to backend:", error);
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      platform: this.platform,
    };
  }

  private addToQueue(log: LogEntry) {
    this.logQueue.push(log);

    // Flush immediately if queue is full
    if (this.logQueue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.logQueue.length === 0) return;

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    await this.sendBatch(logsToSend);
  }

  info(message: string, context?: Record<string, unknown>) {
    const log = this.createLogEntry("info", message, context);
    console.log(`[INFO] ${message}`, context);
    this.addToQueue(log);
  }

  warn(message: string, context?: Record<string, unknown>) {
    const log = this.createLogEntry("warn", message, context);
    console.warn(`[WARN] ${message}`, context);
    this.addToQueue(log);
  }

  error(message: string, context?: Record<string, unknown>) {
    const log = this.createLogEntry("error", message, context);
    console.error(`[ERROR] ${message}`, context);
    // Send errors immediately
    this.sendToBackend(log);
  }

  debug(message: string, context?: Record<string, unknown>) {
    const log = this.createLogEntry("debug", message, context);
    console.debug(`[DEBUG] ${message}`, context);
    this.addToQueue(log);
  }

  // Log page views
  pageView(pageName: string) {
    this.info(`Page view: ${pageName}`, {
      page: pageName,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
  }

  // Log user actions
  userAction(action: string, details?: Record<string, unknown>) {
    this.info(`User action: ${action}`, details);
  }

  // Log API calls
  apiCall(method: string, endpoint: string, status: number, duration?: number) {
    this.debug(`API ${method} ${endpoint}`, {
      method,
      endpoint,
      status,
      duration,
    });
  }

  // Log API errors
  apiError(
    method: string,
    endpoint: string,
    error: Error | string,
    status?: number
  ) {
    this.error(`API Error: ${method} ${endpoint}`, {
      method,
      endpoint,
      error: error instanceof Error ? error.message : error,
      status,
    });
  }
}

export const logger = new LoggerService();
export default logger;
