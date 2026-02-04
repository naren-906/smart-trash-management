const jwt = require("../utils/jwt");
require("dotenv").config();

const isAdminLoggedIn = (req, res, next) => {
    const token = req.cookies["accesstoken"];

    if (!token) {
        return res.status(401).json({ success: false, message: "Admin not logged in" });
    }

    try {
        jwt.verify(token, process.env.jwt_secret, (err, decoded) => {
            if (err || decoded.role !== 'admin') {
                return res.status(403).json({ success: false, message: "Unauthorized admin" });
            }
            req.admin = decoded;
            next();
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Authentication error" });
    }
};

module.exports = {
    isAdminLoggedIn,
};