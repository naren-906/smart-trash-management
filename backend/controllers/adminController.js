const bcrypt = require("bcrypt");
const db = require("../config/db");
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
    try {
        let result = await db.requests.find();
        let driverData = await db.drivers.find();
        let userData = await db.users.find();

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
            total_trucks: driverData.filter((item) => item.vehicle_type && item.vehicle_type.toLowerCase() === "truck").length,
            total_cars: driverData.filter((item) => item.vehicle_type && item.vehicle_type.toLowerCase() === "car").length,
            total_van: driverData.filter((item) => item.vehicle_type && item.vehicle_type.toLowerCase() === "van").length,
            total_motorcycle: driverData.filter((item) => item.vehicle_type && item.vehicle_type.toLowerCase() === "motorcycle").length,
        };

        return res.json({ success: true, stats });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error loading dashboard" });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        let allDrivers = await db.drivers.find();
        let result = await db.requests.find();
        return res.json({ success: true, requests: result, drivers: allDrivers });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error loading requests" });
    }
};

exports.assignDriver = async (req, res) => {
    let { driverId, requestId } = req.query;

    try {
        // Query by id (handles both Mongo and SQLite)
        let driver = await db.drivers.findOne({ id: driverId });
        if (!driver) driver = await db.drivers.findOne({ _id: driverId }); // For Mongo
        
        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }

        await db.requests.updateOne(
            { id: requestId }, // Will handle both ID types if possible
            { assignedDriver: driver.name, assignedDriverId: driverId }
        );
        // Fallback for Mongo if requestId is _id
        if (db.type === 'mongo_db') {
            await db.requests.updateOne({ _id: requestId }, { assignedDriver: driver.name, assignedDriverId: driverId });
        }

        return res.json({
            success: true,
            message: "The driver has been assigned",
            driverName: driver.name,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

exports.unassignDriver = async (req, res) => {
    let requestId = req.query.requestId;
    try {
        await db.requests.updateOne(
            { id: requestId },
            { assignedDriver: null, assignedDriverId: null }
        );
        if (db.type === 'mongo_db') {
            await db.requests.updateOne({ _id: requestId }, { assignedDriver: null, assignedDriverId: null });
        }
        
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
    try {
        await db.requests.updateOne(
            { id: requestId },
            { status: "rejected", assignedDriver: null, assignedDriverId: null }
        );
        if (db.type === 'mongo_db') {
            await db.requests.updateOne({ _id: requestId }, { status: "rejected", assignedDriver: null, assignedDriverId: null });
        }

        return res.json({
            success: true,
            message: "The request has been rejected successfully",
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Something went wrong." });
    }
};

exports.createDriver = async (req, res) => {
    let body = req.body;

    try {
        let isExistingUser = await db.drivers.findOne({ email: body.email });
        if (!isExistingUser) isExistingUser = await db.drivers.findOne({ number: body.number });

        if (isExistingUser) {
            return res.status(400).json({ success: false, message: "Email or phone already registered" });
        } else {
            if (body.password !== body.confirmPassword) {
                return res.status(400).json({ success: false, message: "Passwords don't match" });
            } else {
                let hashedPassword = bcrypt.hashSync(body.password, 10);
                
                await db.drivers.create({
                    name: body.name,
                    email: body.email,
                    number: body.number,
                    password: hashedPassword,
                    vehicle_number: body.vehicle_number,
                    vehicle_type: body.vehicle_type,
                    capacity: body.capacity || 0,
                    status: 'available'
                });
                return res.json({ success: true, message: "Driver Created" });
            }
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Error: " + err.message });
    }
};

exports.getAllDrivers = async (req, res) => {
    try {
        let result = await db.drivers.find();
        return res.json({ success: true, drivers: result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteDriver = async (req, res) => {
    try {
        let driverId = req.query.driverId;
        await db.drivers.deleteOne({ id: driverId });
        if (db.type === 'mongo_db') {
            await db.drivers.deleteOne({ _id: driverId });
        }
        return res.json({ success: true, message: "Driver deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Something went wrong from server side" });
    }
};

exports.logoutAdmin = (req, res) => {
    res.clearCookie("accesstoken");
    return res.json({ success: true, message: "Logged out successfully" });
};