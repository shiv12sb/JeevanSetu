const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const env = require("./config/env");
const requestIdMiddleware = require("./middleware/requestId.middleware");
const requestLogger = require("./middleware/logger.middleware");
const notFoundHandler = require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/error.middleware");
const { generalApiLimiter } = require("./middleware/rateLimit.middleware");
const apiRoutes = require("./routes");

const app = express();

// 1. Security HTTP Headers (Hardened Helmet Configuration)
app.use(
  helmet({
    contentSecurityPolicy: env.isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", env.FRONTEND_URL || "*"],
            frameAncestors: ["'none'"], // Clickjacking defense
          },
        }
      : false,
    frameguard: { action: "deny" }, // Anti-clickjacking
    xContentTypeOptions: true, // MIME sniffing protection
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hidePoweredBy: true, // Suppress X-Powered-By: Express
  })
);

// 2. Cross-Origin Resource Sharing (CORS)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (env.isDevelopment) {
      // In development, allow localhost / frontend dev server
      return callback(null, true);
    }

    // In production, strictly match configured FRONTEND_URL
    if (origin === env.FRONTEND_URL) {
      return callback(null, true);
    }

    return callback(new Error("CORS origin access denied by policy"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Request-Id"],
  exposedHeaders: ["X-Request-Id"],
};
app.use(cors(corsOptions));

// 3. Request ID Tracing & Structured Logger
app.use(requestIdMiddleware);
app.use(requestLogger);

// 4. Global API Rate Limiting & Abuse Prevention
app.use(generalApiLimiter);

// 5. Body Parsers (Strict Request Size Limits to prevent DoS)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 5. API Routes
app.use("/api", apiRoutes);

// 6. 404 Handler (for unmatched routes)
app.use(notFoundHandler);

// 7. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
