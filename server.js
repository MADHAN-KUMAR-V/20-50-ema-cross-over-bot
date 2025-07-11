require("dotenv").config();

const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger.js");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;

    // Setup
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Request Logger Middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.originalUrl}`, `${req.method}`, {
        ip: req.ip,
        body: req?.body ?? {},
        query: req?.query ?? {},
        user: req?.user ?? {},
      });
      next();
    });

    // CORS
    this.app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST"],
      })
    );

    // Body Parser
    this.app.use(express.json({ limit: "10m" }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Root endpoint
    this.app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "20-50 EMA Cross Over Bot",
        version: "0.1",
        timestamp: new Date(),
        endPoints: {
          rootEndpoint: "/",
          healthCheck: "/health",
          baseURL: "/api",
        },
      });
    });

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({
        success: true,
        message: "UP",
        uptime: `${process.uptime()}s`,
        timestamp: new Date(),
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Endpoint not available",
      });
    });

    // Unhandle Rejection
    this.app.use((error, req, res, next) => {
      logger.error(`Unhandle rejection`, "http", { errorMsg: error });
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    });
  }

  // Start Server
  async start() {
    try {
      // Start Express Server
      this.app.listen(this.port, "0.0.0.0", () => {
        logger.info(`Server started on port ${this.port}`, "http", {});
        logger.info(
          `Health check: http://localhost:${this.port}/health`,
          "http",
          {}
        );
        logger.info(`Base URL: http://localhost:${this.port}/api`, "http", {});
      });
    } catch (error) {
      logger.error("Failed to Start server :", "http", {
        errorMsg: error.message,
      });
      process.exit(1);
    }
  }
}

const server = new Server();

server.start().catch((error) => {
  logger.error("Failed to Start server :", "http", {
    errorMsg: error.message,
  });
  process.exit(1);
});
