const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdminLoggedIn } = require("../middleware/adminAuthMiddleware");
const requestMiddleware = require("../middleware/requestMiddleware");

router.post("/login", adminController.loginAdmin);
router.get("/dashboard", isAdminLoggedIn, adminController.getAdminDashboard);
router.get("/all-requests", isAdminLoggedIn, adminController.getAllRequests);
router.get("/assign-driver", isAdminLoggedIn, requestMiddleware.isRequestRejected, adminController.assignDriver);
router.get("/unassign-driver", isAdminLoggedIn, requestMiddleware.isRequestRejected, adminController.unassignDriver);
router.get("/reject-request", isAdminLoggedIn, requestMiddleware.isRequestRejected, adminController.rejectRequest);
router.post("/create-driver", isAdminLoggedIn, adminController.createDriver);
router.get("/all-drivers", isAdminLoggedIn, adminController.getAllDrivers);
router.get("/delete-driver", isAdminLoggedIn, adminController.deleteDriver);
router.get("/logout", isAdminLoggedIn, adminController.logoutAdmin);

module.exports = router;