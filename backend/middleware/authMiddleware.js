const jwt = require("../utils/jwt");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const token = req.cookies["accesstoken"];

  if (!token) {
    return res.status(401).json({ success: false, message: "You are not logged in" });
  }

  try {
    jwt.verify(token, process.env.jwt_secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
      } else {
        if (decoded.role !== 'user') {
          return res.status(403).json({ success: false, message: "Unauthorized role" });
        }
        req.user = decoded;
        next();
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};


module.exports = authMiddleware;