const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const { isDriverLoggedIn } = require("../middleware/driverAuthMiddleware");

router.post("/login", driverController.loginDriver);
router.get("/dashboard", isDriverLoggedIn, driverController.getDriverDashboard);
router.get("/pending-requests", isDriverLoggedIn, driverController.getPendingRequests);
router.get("/resolve-request", isDriverLoggedIn, driverController.resolveRequest);
router.get("/reject-request", isDriverLoggedIn, driverController.rejectRequest);
router.get("/history", isDriverLoggedIn, driverController.getRequestHistory);
router.get("/logout", isDriverLoggedIn, driverController.logoutDriver);

module.exports = router;