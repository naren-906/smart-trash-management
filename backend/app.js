const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const _db = require("./config/db");
const indexRoutes = require("./routes/index");

_db.connectToServer();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // Adjusted to match frontend port 3000
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", indexRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Waste Management System API" });
});

app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});


