const winston = require("winston");
const path = require("path");
const fs = require("fs");
const DailyRotateFile = require("winston-daily-rotate-file");

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, "./logs");
    this.ensureLogDirectory();
    this.logger = this.createLogger();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Create Winston logger instance
   */
  createLogger() {
    const logLevel = process.env.LOG_LEVEL || "info";

    // JSON format for file logs
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    // Pretty format for console
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(
        ({ timestamp, level, message, module, ...meta }) => {
          let output = `${timestamp} [${level}]`;
          if (module) output += ` [${module}]`;
          output += `: ${message}`;
          if (Object.keys(meta).length > 0) {
            output += ` ${JSON.stringify(meta)}`;
          }
          return output;
        }
      )
    );

    const transports = [
      // Console (dev only)
      new winston.transports.Console({
        level: logLevel,
        format: consoleFormat,
      }),

      // Combined log (rotated daily)
      new DailyRotateFile({
        filename: path.join(this.logDir, "combined-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "100m",
        maxFiles: "14d",
        level: logLevel,
        format: logFormat,
        options: {
          flags: "a",
          highWaterMark: 16 * 1024, // Buffered writes
        },
      }),

      // Error log (rotated daily)
      new DailyRotateFile({
        filename: path.join(this.logDir, "error-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "50m",
        maxFiles: "30d",
        level: "error",
        format: logFormat,
        options: {
          flags: "a",
          highWaterMark: 16 * 1024,
        },
      }),
    ];

    return winston.createLogger({
      level: logLevel,
      transports,
      exitOnError: false,
    });
  }

  /**
   * Info log
   */
  info(message, module = "general", meta = {}) {
    this.logger.info(message, { module, ...meta });
  }

  /**
   * Error log
   */
  error(message, module = "general", meta = {}) {
    this.logger.error(message, { module, ...meta });
  }

  /**
   * Warning log
   */
  warn(message, module = "general", meta = {}) {
    this.logger.warn(message, { module, ...meta });
  }

  /**
   * Debug log
   */
  debug(message, module = "general", meta = {}) {
    this.logger.debug(message, { module, ...meta });
  }
}

// Export singleton instance
const logger = new Logger();
module.exports = logger;
