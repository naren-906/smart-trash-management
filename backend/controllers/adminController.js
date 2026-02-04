const bcrypt = require("bcrypt");
const _db = require("../config/db");
const jwt = require("../utils/jwt");
require("dotenv").config();

exports.loginAdmin = (req, res) => {
    let { email, password } = req.body;
    let mail = "admin@example.com";
    let hashed_pass = "$2b$10$MmYRPyzFDEUjaEp1iYSdveyvR.v1n.jfoS6qSDQHx3GUEVWs4x8z6"; // Admin@123

    if (email === mail && bcrypt.compareSync(password, hashed_pass)) {
        let access_token = jwt.sign({ email, role: 'admin' }, process.env.jwt_secret, { expiresIn: "5h" });
        res.cookie("accesstoken", access_token, { httpOnly: true });
        return res.json({ success: true, message: "Admin login successful" });
    } else {
        return res.status(401).json({ success: false, message: "Email or Password is wrong" });
    }
};

exports.getAdminDashboard = async (req, res) => {
    let db = _db.getDb();

    try {
        let result = await db.all("SELECT request_type, status, assignedDriver FROM requests");
        let driverData = await db.all("SELECT vehicle_type FROM drivers");
        let userData = await db.all("SELECT name FROM users");

        const stats = {
            total_requests: result.length,
            total_pending: result.filter((item) => item.status === "pending").length,
            total_resolved: result.filter((item) => item.status === "resolved").length,
            total_pickup_request: result.filter((item) => item.request_type === "Pickup").length,
            total_complaint_request: result.filter((item) => item.request_type === "Complaint").length,
            total_recycling_request: result.filter((item) => item.request_type === "Recycling").length,
            total_other_request: result.filter((item) => item.request_type === "Other").length,
            total_unassigned_driver_requests: result.filter((item) => !item.assignedDriver || item.assignedDriver === "").length,
            total_users: userData.length,
            total_drivers: driverData.length,
            total_trucks: driverData.filter((item) => item.vehicle_type.toLowerCase() === "truck").length,
            total_cars: driverData.filter((item) => item.vehicle_type.toLowerCase() === "car").length,
            total_van: driverData.filter((item) => item.vehicle_type.toLowerCase() === "van").length,
            total_motorcycle: driverData.filter((item) => item.vehicle_type.toLowerCase() === "motorcycle").length,
        };

        return res.json({ success: true, stats });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error loading dashboard" });
    }
};

exports.getAllRequests = async (req, res) => {
    let db = _db.getDb();

    try {
        let allDrivers = await db.all("SELECT id, name FROM drivers");
        let result = await db.all("SELECT * FROM requests");
        return res.json({ success: true, requests: result.reverse(), drivers: allDrivers });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error loading requests" });
    }
};

exports.assignDriver = async (req, res) => {
    let { driverId, requestId } = req.query;
    let db = _db.getDb();

    try {
        let driver = await db.get("SELECT name FROM drivers WHERE id = ?", [driverId]);
        
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }

        await db.run(
            "UPDATE requests SET assignedDriver = ?, assignedDriverId = ? WHERE id = ?",
            [driver.name, driverId, requestId]
        );

        return res.json({
            success: true,
            message: "The driver has been assigned",
            driverName: driver.name,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

exports.unassignDriver = async (req, res) => {
    let requestId = req.query.requestId;
    let db = _db.getDb();
    try {
        await db.run(
            "UPDATE requests SET assignedDriver = NULL, assignedDriverId = NULL WHERE id = ?",
            [requestId]
        );
        
        return res.json({
            success: true,
            message: "The driver has been unassigned successfully.",
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Something went wrong." });
    }
};

exports.rejectRequest = async (req, res) => {
    let requestId = req.query.requestId;
    let db = _db.getDb();
    try {
        await db.run(
            "UPDATE requests SET status = ?, assignedDriver = NULL, assignedDriverId = NULL WHERE id = ?",
            ["rejected", requestId]
        );

        return res.json({
            success: true,
            message: "The request has been rejected successfully",
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Something went wrong." });
    }
};

exports.createDriver = async (req, res) => {
    let db = _db.getDb();
    let body = req.body;

    try {
        let isExistingUser = await db.get(
            "SELECT id FROM drivers WHERE email = ? OR number = ?",
            [body.email, body.number]
        );

        if (isExistingUser) {
            return res.status(400).json({ success: false, message: "Email or phone already registered" });
        } else {
            if (body.password !== body.confirmPassword) {
                return res.status(400).json({ success: false, message: "Passwords don't match" });
            } else {
                let hashedPassword = bcrypt.hashSync(body.password, 10);
                
                await db.run(
                    "INSERT INTO drivers (name, email, number, password, vehicle_number, vehicle_type, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [body.name, body.email, body.number, hashedPassword, body.vehicle_number, body.vehicle_type, body.capacity || 0]
                );
                return res.json({ success: true, message: "Driver Created" });
            }
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Error: " + err.message });
    }
};

exports.getAllDrivers = async (req, res) => {
    try {
        let db = _db.getDb();
        let result = await db.all("SELECT id, name, email, number, vehicle_number, vehicle_type, capacity, status FROM drivers");
        return res.json({ success: true, drivers: result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteDriver = async (req, res) => {
    try {
        let driverId = req.query.driverId;
        let db = _db.getDb();
        await db.run("DELETE FROM drivers WHERE id = ?", [driverId]);
        return res.json({ success: true, message: "Driver deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Something went wrong from server side" });
    }
};

exports.logoutAdmin = (req, res) => {
    res.clearCookie("accesstoken");
    return res.json({ success: true, message: "Logged out successfully" });
};