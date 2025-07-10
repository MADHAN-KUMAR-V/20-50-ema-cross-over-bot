require("dotenv").config();

const express = require("express");
const cors = require("cors");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;

    // Setup
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
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
  }

  // Start Server
  async start() {
    try {
      // Start Express Server
      this.app.listen(this.port, "0.0.0.0", () => {
        console.log(`Server started on port ${this.port}`);
        console.log(`Health check: http://localhost:${this.port}/health`);
        console.log(`Base URL: http://localhost:${this.port}/api`);
      });
    } catch (error) {
      console.error("Failed to Start server: ", error.message);
      process.exit(1);
    }
  }
}

const server = new Server();

server.start().catch((error) => {
  console.log(`Failed to start server: ${error.message}`);
  process.exit(1);
});
