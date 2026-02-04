const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", userController.signupUser);
router.post("/login", userController.loginUser);
router.get("/dashboard", authMiddleware, userController.getUserDashboard);
router.get("/logout", authMiddleware, userController.logoutUser);
router.post("/submit-request", authMiddleware, userController.submitRequest);
router.get("/my-requests", authMiddleware, userController.getMyRequests);

module.exports = router;