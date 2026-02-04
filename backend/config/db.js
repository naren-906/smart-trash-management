require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../local_database.sqlite");

// Create/open database
let _db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.log("Error opening database:", err);
    }
});

// Promisify database operations
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        _db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        _db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        _db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = {
    connectToServer: async function () {
        try {
            console.log("SQLite Database Connected at:", dbPath);
        } catch (err) {
            console.log("Database Connection Error:", err);
        }
    },
    getDb: function () {
        return {
            run,
            get,
            all,
        };
    },
    close: function () {
        return new Promise((resolve, reject) => {
            _db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },
};