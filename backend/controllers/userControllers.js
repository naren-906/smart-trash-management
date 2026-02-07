const jwt = require("../utils/jwt");
const bcrypt = require("../utils/bcrypt");
const db = require("../config/db");
require("dotenv").config();


exports.signupUser = async (req, res) => {
  let entered_data = req.body;
  let { name, number, password, email, address } = entered_data;

  try {
    let number_in_db = await db.users.findOne({ number });
    let mail_in_db = await db.users.findOne({ email });

    if (number_in_db || mail_in_db) {
      return res.status(400).json({ success: false, message: "Number or Email already exists." });
    } else {
      let hashedPassword = bcrypt.hashPassword(password);
      await db.users.create({
        name,
        email,
        number,
        password: hashedPassword,
        address: address || ""
      });
      return res.json({ success: true, message: "Signup successful" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Error during signup" });
  }
};

exports.loginUser = async (req, res) => {
  let { email, password } = req.body;

  try {
    let data_in_db = await db.users.findOne({ email });

    if (!data_in_db) {
      return res.status(401).json({ success: false, message: "Email or password is wrong" });
    } else {
      let is_password_right = bcrypt.comparePassword(password, data_in_db.password);

      if (!is_password_right) {
        return res.status(401).json({ success: false, message: "Email or password is wrong" });
      } else {
        let userId = data_in_db.id || data_in_db._id;
        let access_token = jwt.sign({ email, id: userId, role: 'user' }, process.env.jwt_secret, { expiresIn: "5h" });
        res.cookie("accesstoken", access_token, { httpOnly: true });
        return res.json({ 
          success: true, 
          message: "Login successful",
          user: { name: data_in_db.name, email }
        });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error during login" });
  }
};

exports.getUserDashboard = async (req, res) => {
  let token = req.cookies["accesstoken"];
  let decoded = jwt.decode(token, process.env.jwt_secret);
  let email = decoded.email;

  try {
    let result = await db.requests.find({ email });

    let stats = {
      total_requests: result.length,
      total_pending: result.filter((item) => item.status === "pending").length,
      total_resolved: result.filter((item) => item.status === "resolved").length,
      total_pickup_request: result.filter((item) => item.request_type === "Pickup").length,
      total_complaint_request: result.filter((item) => item.request_type === "Complaint").length,
      total_recycling_request: result.filter((item) => item.request_type === "Recycling").length,
      total_other_request: result.filter((item) => item.request_type === "Other").length,
      total_unassigned_driver_requests: result.filter((item) => !item.assignedDriver || item.assignedDriver === "").length,
    };

    return res.json({ success: true, stats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error loading dashboard" });
  }
};

exports.logoutUser = (req, res) => {
  res.clearCookie("accesstoken");
  return res.json({ success: true, message: "Logged out successfully" });
};

exports.submitRequest = async (req, res) => {
  let token = req.cookies["accesstoken"];
  let email = jwt.decode(token, process.env.jwt_secret).email;
  let { request_type, quantity, address } = req.body;

  try {
    // Get user details for the request record
    let user = await db.users.findOne({ email });
    
    await db.requests.create({
      name: user.name,
      email: email,
      user_number: user.number,
      request_type: request_type,
      quantity: quantity || 0,
      address: address,
      status: "pending",
      time_stamp: new Date().toISOString()
    });

    return res.json({ success: true, message: "Your request has been submitted." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error submitting request" });
  }
};

exports.getMyRequests = async (req, res) => {
  let email = jwt.decode(req.cookies["accesstoken"], process.env.jwt_secret).email;

  try {
    let result = await db.requests.find({ email });
    return res.json({ success: true, requests: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error fetching requests" });
  }
};