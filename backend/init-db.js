const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "./local_database.sqlite");

// Create and initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err);
        process.exit(1);
    }
});

// Helper functions to run SQL
const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

const allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Initialize database
async function initializeDatabase() {
    try {
        console.log("🚀 Starting database initialization...");

        // 1. Create users table IF NOT EXISTS
        await runAsync(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                number TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                address TEXT,
                time_stamp TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Create drivers table IF NOT EXISTS
        await runAsync(`
            CREATE TABLE IF NOT EXISTS drivers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                number TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                vehicle_number TEXT UNIQUE NOT NULL,
                vehicle_type TEXT NOT NULL,
                capacity INTEGER NOT NULL,
                status TEXT DEFAULT 'available',
                time_stamp TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Create requests table IF NOT EXISTS
        await runAsync(`
            CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                user_number TEXT NOT NULL,
                request_type TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                address TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                assignedDriver TEXT,
                assignedDriverId INTEGER,
                time_stamp TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("✅ Tables verified/created.");

        // --- SEED DATA (Only if empty) ---

        // Check for existing users
        const existingUsers = await allAsync("SELECT id FROM users LIMIT 1");
        if (existingUsers.length === 0) {
            const users = [
                {
                    name: "John Doe",
                    email: "user1@example.com",
                    number: "9876543210",
                    password: bcrypt.hashSync("user123", 10),
                    address: "123 Main St, City"
                },
                {
                    name: "Jane Smith",
                    email: "user2@example.com",
                    number: "9123456789",
                    password: bcrypt.hashSync("user123", 10),
                    address: "456 Oak Ave, City"
                }
            ];
            for (const user of users) {
                await runAsync(
                    "INSERT INTO users (name, email, number, password, address) VALUES (?, ?, ?, ?, ?)",
                    [user.name, user.email, user.number, user.password, user.address]
                );
            }
            console.log("✅ Sample users seeded.");
        }

        // Check for existing drivers
        const existingDrivers = await allAsync("SELECT id FROM drivers LIMIT 1");
        if (existingDrivers.length === 0) {
            const drivers = [
                {
                    name: "Driver One",
                    email: "driver1@example.com",
                    number: "9111111111",
                    password: bcrypt.hashSync("driver123", 10),
                    vehicle_number: "AB1CD2345",
                    vehicle_type: "Truck",
                    capacity: 1000
                },
                {
                    name: "Driver Two",
                    email: "driver2@example.com",
                    number: "9222222222",
                    password: bcrypt.hashSync("driver123", 10),
                    vehicle_number: "XY9ZW1234",
                    vehicle_type: "Van",
                    capacity: 500
                }
            ];
            for (const driver of drivers) {
                await runAsync(
                    "INSERT INTO drivers (name, email, number, password, vehicle_number, vehicle_type, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [driver.name, driver.email, driver.number, driver.password, driver.vehicle_number, driver.vehicle_type, driver.capacity]
                );
            }
            console.log("✅ Sample drivers seeded.");
        }

        console.log("\n📦 Database is ready!");
        console.log("Database file: local_database.sqlite");
        console.log("\nDefault Credentials (if newly created):");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("👤 User:   user1@example.com / user123");
        console.log("🚗 Driver: driver1@example.com / driver123");
        console.log("👨‍💼 Admin:  admin@example.com / Admin@123");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        db.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Error initializing database:", err);
        db.close();
        process.exit(1);
    }
}

initializeDatabase();
