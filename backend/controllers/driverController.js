const db = require("../config/db");
const bcrypt = require("../utils/bcrypt");
const jwt = require("../utils/jwt");
require("dotenv").config();

exports.loginDriver = async (req, res) => {
  let { email, password } = req.body;
  
  try {
    let result = await db.drivers.findOne({ email });

    if (!result) {
      return res.status(401).json({ success: false, message: "Wrong email or password" });
    } else {
      let isPasswordOk = bcrypt.comparePassword(password, result.password);

      if (isPasswordOk) {
        let driverId = result.id || result._id;
        let access_token = jwt.sign({ id: driverId, role: "driver", email: email }, process.env.jwt_secret);
        res.cookie("accesstoken", access_token, { httpOnly: true });
        return res.json({ 
          success: true, 
          message: "Driver login successful",
          driver: { name: result.name, email }
        });
      } else {
        return res.status(401).json({ success: false, message: "Wrong email or password" });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error during login" });
  }
};

exports.getDriverDashboard = async (req, res) => {
  try {
    let result = await db.requests.find({ assignedDriverId: req.driverId });

    let stats = {
      total_requests: result.length,
      total_pending: result.filter((item) => item.status === "pending").length,
      total_resolved: result.filter((item) => item.status === "resolved").length,
      total_rejected: result.filter((item) => item.status === "rejected").length,
      total_pickup_request: result.filter((item) => item.request_type === "Pickup").length,
      total_complaint_request: result.filter((item) => item.request_type === "Complaint").length,
      total_recycling_request: result.filter((item) => item.request_type === "Recycling").length,
      total_other_request: result.filter((item) => item.request_type === "Other").length,
    };

    return res.json({ success: true, stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    let result = await db.requests.find({ assignedDriverId: req.driverId, status: "pending" });
    return res.json({ success: true, requests: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.resolveRequest = async (req, res) => {
  let requestId = req.query.requestId;

  try {
    await db.requests.updateOne(
      { id: requestId, assignedDriverId: req.driverId },
      { status: "resolved" }
    );
    // Fallback for Mongo
    if (db.type === 'mongo_db') {
        await db.requests.updateOne({ _id: requestId, assignedDriverId: req.driverId }, { status: "resolved" });
    }
    return res.json({ success: true, message: "Request resolved successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.rejectRequest = async (req, res) => {
  let requestId = req.query.requestId;

  try {
    await db.requests.updateOne(
      { id: requestId, assignedDriverId: req.driverId },
      { status: "rejected" }
    );
    // Fallback for Mongo
    if (db.type === 'mongo_db') {
        await db.requests.updateOne({ _id: requestId, assignedDriverId: req.driverId }, { status: "rejected" });
    }
    return res.json({ success: true, message: "Request rejected successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getRequestHistory = async (req, res) => {
  try {
    let result = await db.requests.find({ assignedDriverId: req.driverId });
    return res.json({ success: true, requests: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.logoutDriver = (req, res) => {
  res.clearCookie("accesstoken");
  return res.json({ success: true, message: "Logged out successfully" });
};