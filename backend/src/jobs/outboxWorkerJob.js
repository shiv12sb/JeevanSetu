const eventService = require("../services/automation/event.service");

/**
 * Scheduled Outbox Processing Worker Job
 * Dispatches pending events, handles exponential backoff, and marks dead-letter abandoned states
 */
const runOutboxWorkerSweep = async () => {
  try {
    const result = await eventService.processPendingEvents({ batchSize: 25 });
    if (result.processed > 0) {
      console.log(`[OutboxWorkerJob] Processed ${result.processed} events: ${result.succeeded} sent, ${result.retried} retrying, ${result.abandoned} abandoned.`);
    }
    return result;
  } catch (err) {
    console.error("[OutboxWorkerJob] Execution notice:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  runOutboxWorkerSweep,
};
