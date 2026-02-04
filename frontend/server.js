const express = require("express");
const path = require("path");
const app = express();

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes for testing frontend views
app.get("/", (req, res) => {
    res.render("user/homepage");
});

app.get("/login", (req, res) => {
    res.render("user/login");
});

app.get("/signup", (req, res) => {
    res.render("user/signup");
});

app.get("/user-dashboard", (req, res) => {
    res.render("user/userDashboard");
});

app.get("/home", (req, res) => {
    res.render("user/userDashboard");
});

app.get("/raise-a-request", (req, res) => {
    res.render("user/request");
});

app.get("/request", (req, res) => {
    res.render("user/request");
});

app.get("/my-requests", (req, res) => {
    res.render("user/my-requests");
});

// Driver Routes
app.get("/driver-login", (req, res) => {
    res.render("driver/driverLogin");
});

app.get("/driver/login", (req, res) => {
    res.render("driver/driverLogin");
});

app.get("/driver", (req, res) => {
    res.render("driver/driverLogin");
});


app.get("/driver-dashboard", (req, res) => {
    res.render("driver/driverDashboard");
});

app.get("/driver-pending-requests", (req, res) => {
    res.render("driver/pendingRequests");
});

app.get("/driver/pending-requests", (req, res) => {
    res.render("driver/pendingRequests");
});

app.get("/driver-history", (req, res) => {
    res.render("driver/history");
});

app.get("/driver/history", (req, res) => {
    res.render("driver/history");
});

// Admin Routes
app.get("/admin-login", (req, res) => {
    res.render("admin/adminLogin");
});

app.get("/admin/login", (req, res) => {
    res.render("admin/adminLogin");
});

app.get("/admin", (req, res) => {
    res.render("admin/adminLogin");
});

app.get("/admin-dashboard", (req, res) => {

    res.render("admin/adminDashboard");
});

app.get("/admin/dashboard", (req, res) => {
    res.render("admin/adminDashboard");
});

app.get("/all-drivers", (req, res) => {
    res.render("admin/allDrivers");
});

app.get("/admin/all-drivers", (req, res) => {
    res.render("admin/allDrivers");
});

app.get("/all-requests", (req, res) => {
    res.render("admin/all-requests");
});

app.get("/admin/all-requests", (req, res) => {
    res.render("admin/all-requests");
});

app.get("/create-driver", (req, res) => {
    res.render("admin/create-driver");
});

app.get("/admin/create-driver", (req, res) => {
    res.render("admin/create-driver");
});



app.get("*", (req, res) => {
    res.render("404");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Frontend server running on http://localhost:${PORT}`);
});
