const jwt = require("../utils/jwt");
require("dotenv").config();

const isDriverLoggedIn = async (req, res, next) => {
  let access_token = req.cookies["accesstoken"];
  
  if (!access_token) {
    return res.status(401).json({ success: false, message: "Driver not logged in" });
  }

  try {
    jwt.verify(access_token, process.env.jwt_secret, (err, decoded) => {
      if (err || decoded.role !== 'driver') {
        return res.status(403).json({ success: false, message: "Unauthorized driver" });
      }
      req.driverId = decoded.id;
      req.role = decoded.role;
      next();
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};

module.exports = {
  isDriverLoggedIn,
};