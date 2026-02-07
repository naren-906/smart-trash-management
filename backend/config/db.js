require("dotenv").config();
const mongoose = require("mongoose");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_TYPE = process.env.DB_TYPE || "sql_lite";
const dbPath = path.join(__dirname, "../local_database.sqlite");

// MongoDB Models
const MongoUser = require("../models/User");
const MongoDriver = require("../models/Driver");
const MongoRequest = require("../models/Request");

let sqliteDb;
if (DB_TYPE === "sql_lite") {
    sqliteDb = new sqlite3.Database(dbPath);
}

// Help resolve the differences between SQL and Mongo
const db = {
    type: DB_TYPE,
    connectToServer: async () => {
        if (DB_TYPE === "mongo_db") {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log("✅ Connected to MongoDB");
        } else {
            console.log("✅ Connected to SQLite");
        }
    },

    // Unified Data Access Layer
    users: {
        findOne: async (query) => {
            if (DB_TYPE === "mongo_db") return await MongoUser.findOne(query);
            
            // Basic query mapping for SQLite (email or number)
            const key = Object.keys(query)[0];
            const val = query[key];
            const row = await new Promise((res, rej) => {
                sqliteDb.get(`SELECT * FROM users WHERE ${key} = ?`, [val], (err, row) => {
                    if (err) rej(err);
                    else res(row);
                });
            });
            return row;
        },
        find: async (query = {}) => {
            if (DB_TYPE === "mongo_db") return await MongoUser.find(query);
            
            let sql = "SELECT * FROM users";
            const params = [];
            const keys = Object.keys(query);
            if (keys.length > 0) {
                sql += " WHERE " + keys.map(k => `${k} = ?`).join(" AND ");
                params.push(...Object.values(query));
            }
            
            return await new Promise((res, rej) => {
                sqliteDb.all(sql, params, (err, rows) => {
                    if (err) rej(err);
                    else res(rows);
                });
            });
        },
        create: async (data) => {
            if (DB_TYPE === "mongo_db") return await MongoUser.create(data);
            
            const keys = Object.keys(data).join(", ");
            const placeholders = Object.keys(data).map(() => "?").join(", ");
            const values = Object.values(data);
            return await new Promise((res, rej) => {
                sqliteDb.run(`INSERT INTO users (${keys}) VALUES (${placeholders})`, values, function(err) {
                    if (err) rej(err);
                    else res({ id: this.lastID, ...data });
                });
            });
        }
    },
    
    requests: {
        find: async (query = {}) => {
            if (DB_TYPE === "mongo_db") return await MongoRequest.find(query).sort({ createdAt: -1 });
            
            let sql = "SELECT * FROM requests";
            const params = [];
            const keys = Object.keys(query);
            if (keys.length > 0) {
                sql += " WHERE " + keys.map(k => `${k} = ?`).join(" AND ");
                params.push(...Object.values(query));
            }
            sql += " ORDER BY id DESC";
            
            return await new Promise((res, rej) => {
                sqliteDb.all(sql, params, (err, rows) => {
                    if (err) rej(err);
                    else res(rows);
                });
            });
        },
        create: async (data) => {
            if (DB_TYPE === "mongo_db") return await MongoRequest.create(data);
            
            const keys = Object.keys(data).join(", ");
            const placeholders = Object.keys(data).map(() => "?").join(", ");
            const values = Object.values(data);
            return await new Promise((res, rej) => {
                sqliteDb.run(`INSERT INTO requests (${keys}) VALUES (${placeholders})`, values, function(err) {
                    if (err) rej(err);
                    else res({ id: this.lastID, ...data });
                });
            });
        },
        updateOne: async (query, update) => {
            if (DB_TYPE === "mongo_db") return await MongoRequest.updateOne(query, { $set: update });
            
            const updateKeys = Object.keys(update).map(k => `${k} = ?`).join(", ");
            const updateValues = Object.values(update);
            const queryKeys = Object.keys(query).map(k => `${k} = ?`).join(" AND ");
            const queryValues = Object.values(query);
            
            return await new Promise((res, rej) => {
                sqliteDb.run(`UPDATE requests SET ${updateKeys} WHERE ${queryKeys}`, [...updateValues, ...queryValues], function(err) {
                    if (err) rej(err);
                    else res({ changes: this.changes });
                });
            });
        }
    },

    drivers: {
        findOne: async (query) => {
            if (DB_TYPE === "mongo_db") return await MongoDriver.findOne(query);
            const key = Object.keys(query)[0];
            const val = query[key];
            return await new Promise((res, rej) => {
                sqliteDb.get(`SELECT * FROM drivers WHERE ${key} = ?`, [val], (err, row) => {
                    if (err) rej(err);
                    else res(row);
                });
            });
        },
        find: async (query = {}) => {
            if (DB_TYPE === "mongo_db") return await MongoDriver.find(query);
            let sql = "SELECT * FROM drivers";
            const params = [];
            const keys = Object.keys(query);
            if (keys.length > 0) {
                sql += " WHERE " + keys.map(k => `${k} = ?`).join(" AND ");
                params.push(...Object.values(query));
            }
            return await new Promise((res, rej) => {
                sqliteDb.all(sql, params, (err, rows) => {
                    if (err) rej(err);
                    else res(rows);
                });
            });
        },
        create: async (data) => {
            if (DB_TYPE === "mongo_db") return await MongoDriver.create(data);
            const keys = Object.keys(data).join(", ");
            const placeholders = Object.keys(data).map(() => "?").join(", ");
            const values = Object.values(data);
            return await new Promise((res, rej) => {
                sqliteDb.run(`INSERT INTO drivers (${keys}) VALUES (${placeholders})`, values, function(err) {
                    if (err) rej(err);
                    else res({ id: this.lastID, ...data });
                });
            });
        },
        deleteOne: async (query) => {
            if (DB_TYPE === "mongo_db") return await MongoDriver.deleteOne(query);
            const key = Object.keys(query)[0];
            const val = query[key];
            return await new Promise((res, rej) => {
                sqliteDb.run(`DELETE FROM drivers WHERE ${key} = ?`, [val], function(err) {
                    if (err) rej(err);
                    else res({ changes: this.changes });
                });
            });
        }
    },

    // Legacy support for raw queries (still works for SQLite, will throw for Mongo)
    getDb: () => {
        if (DB_TYPE === "mongo_db") {
            return {
                get: async (sql, params) => { throw new Error("Raw SQL 'get' not supported in MongoDB mode. Please use db.users, db.requests, etc.") },
                run: async (sql, params) => { throw new Error("Raw SQL 'run' not supported in MongoDB mode. Please use db.users, db.requests, etc.") },
                all: async (sql, params) => { throw new Error("Raw SQL 'all' not supported in MongoDB mode. Please use db.users, db.requests, etc.") },
            }
        }
        return {
            get: (sql, params) => new Promise((res, rej) => sqliteDb.get(sql, params, (err, r) => err ? rej(err) : res(r))),
            run: (sql, params) => new Promise((res, rej) => sqliteDb.run(sql, params, function(err) { err ? rej(err) : res(this) })),
            all: (sql, params) => new Promise((res, rej) => sqliteDb.all(sql, params, (err, r) => err ? rej(err) : res(r))),
        }
    }
};

module.exports = db;