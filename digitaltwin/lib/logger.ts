/**
 * Lightweight structured logger for the Digital Twin MCP server.
 * Outputs JSON in production, readable format in development.
 * Set LOG_LEVEL env var to: debug | info | warn | error (default: info)
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): number {
  const env = (process.env.LOG_LEVEL ?? "info").toLowerCase() as LogLevel;
  return LEVELS[env] ?? LEVELS.info;
}

const isDev = process.env.NODE_ENV !== "production";

function formatMessage(
  level: LogLevel,
  component: string,
  message: string,
  data?: Record<string, unknown>
) {
  if (isDev) {
    const tag = `[${component}]`;
    const prefix = `${level.toUpperCase().padEnd(5)} ${tag}`;
    if (data && Object.keys(data).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${message}`;
  }
  // Production: structured JSON
  return JSON.stringify({
    level,
    component,
    message,
    ...data,
    timestamp: new Date().toISOString(),
  });
}

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= getMinLevel();
}

export function createLogger(component: string) {
  return {
    debug(message: string, data?: Record<string, unknown>) {
      if (shouldLog("debug")) console.debug(formatMessage("debug", component, message, data));
    },
    info(message: string, data?: Record<string, unknown>) {
      if (shouldLog("info")) console.info(formatMessage("info", component, message, data));
    },
    warn(message: string, data?: Record<string, unknown>) {
      if (shouldLog("warn")) console.warn(formatMessage("warn", component, message, data));
    },
    error(message: string, data?: Record<string, unknown>) {
      if (shouldLog("error")) console.error(formatMessage("error", component, message, data));
    },
  };
}
