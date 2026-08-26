const { Router } = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const profileRoutes = require("./profile.routes");
const casesRoutes = require("./cases.routes");
const referralsRoutes = require("./referrals.routes");
const inventoryRoutes = require("./inventory.routes");
const resourcesRoutes = require("./resources.routes");
const notificationsRoutes = require("./notifications.routes");
const feedbackRoutes = require("./feedback.routes");
const doctorsRoutes = require("./doctors.routes");
const facilitiesRoutes = require("./facilities.routes");
const adminRoutes = require("./admin.routes");
const aiRoutes = require("./ai.routes");
const earlyWarningRoutes = require("./earlyWarning.routes");
const ivrRoutes = require("./ivr.routes");
const doctorPresenceRoutes = require("./doctorPresence.routes");
const attendanceRoutes = require("./attendance.routes");
const automationRoutes = require("./automation.routes");
const observabilityRoutes = require("./observability.routes");

const router = Router();

// Mount API sub-routers
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/cases", casesRoutes);
router.use("/referrals", referralsRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/resources", resourcesRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/doctors", doctorsRoutes);
router.use("/facilities", facilitiesRoutes);
router.use("/admin", adminRoutes);
router.use("/ai", aiRoutes);
router.use("/early-warning", earlyWarningRoutes);
router.use("/ivr", ivrRoutes);
router.use("/doctor-presence", doctorPresenceRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/automation", automationRoutes);
router.use("/operations", observabilityRoutes);

module.exports = router;

