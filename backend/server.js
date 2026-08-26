const app = require("./src/app");
const env = require("./src/config/env");
const logger = require("./src/utils/logger");

const { initBackgroundJobs, stopBackgroundJobs } = require("./src/jobs");

// 1. Validate environment configuration
try {
  const envStatus = env.validateEnvironment();
  logger.info(`Environment validated successfully: Mode = ${envStatus.mode}`);
} catch (err) {
  logger.error(err.message);
  process.exit(1);
}

const PORT = env.PORT || 5000;

// 2. Start server
const server = app.listen(PORT, () => {
  logger.info(`==================================================`);
  logger.info(` JeevanSetu Backend API Server Started`);
  logger.info(` Version     : ${env.APP_VERSION} (${env.GIT_COMMIT_SHA})`);
  logger.info(` Environment : ${env.NODE_ENV}`);
  logger.info(` Port        : ${PORT}`);
  logger.info(` API URL     : http://localhost:${PORT}/api/health`);
  logger.info(` Frontend URL: ${env.FRONTEND_URL}`);
  logger.info(`==================================================`);

  // Start background job scheduler
  initBackgroundJobs();
});

// Graceful Shutdown
function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Gracefully shutting down JeevanSetu backend...`);
  stopBackgroundJobs();
  server.close(() => {
    logger.info("HTTP server closed. Exiting process.");
    process.exit(0);
  });

  // Force close after 10s if connections linger
  setTimeout(() => {
    logger.error("Forced termination due to timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Uncaught Exceptions & Unhandled Rejections
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception detected:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", reason);
  process.exit(1);
});
