const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const env = require("./config/env");
const requestIdMiddleware = require("./middleware/requestId.middleware");
const requestLogger = require("./middleware/logger.middleware");
const notFoundHandler = require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/error.middleware");
const { generalApiLimiter } = require("./middleware/rateLimit.middleware");
const { getHealth, getLiveness, getReadiness } = require("./controllers/health.controller");
const apiRoutes = require("./routes");

const app = express();

// 1. Security HTTP Headers (Hardened Helmet Configuration)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
    frameguard: { action: "deny" },
    xContentTypeOptions: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hidePoweredBy: true,
  })
);

// 2. Cross-Origin Resource Sharing (CORS)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow Capacitor Android & iOS native schemes
    if (origin === "https://localhost" || origin === "capacitor://localhost" || origin.includes("jeevansetu.app")) {
      return callback(null, true);
    }

    // Allow localhost and loopback interfaces for development
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return callback(null, true);
    }

    // Allow all Vercel production and preview domains
    if (origin.endsWith(".vercel.app") || origin.includes("vercel.app")) {
      return callback(null, true);
    }

    // Allow configured FRONTEND_URL
    if (env.FRONTEND_URL) {
      const cleanOrigin = origin.replace(/\/$/, "");
      const cleanFrontend = env.FRONTEND_URL.replace(/\/$/, "");
      if (cleanOrigin === cleanFrontend || cleanFrontend === "*") {
        return callback(null, true);
      }
    }

    // Allow Render internal / external domains
    if (origin.includes("onrender.com")) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Request-Id"],
  exposedHeaders: ["X-Request-Id"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// 3. Request ID Tracing & Structured Logger
app.use(requestIdMiddleware);
app.use(requestLogger);

// 4. Global API Rate Limiting & Abuse Prevention
app.use(generalApiLimiter);

// 5. Body Parsers (Strict Request Size Limits to prevent DoS)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 6. Top-Level Health & Orchestrator Probes (Requirement 4)
app.get("/health", getHealth);
app.get("/live", getLiveness);
app.get("/ready", getReadiness);

// 7. API Routes
app.use("/api", apiRoutes);

// 6. 404 Handler (for unmatched routes)
app.use(notFoundHandler);

// 7. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
