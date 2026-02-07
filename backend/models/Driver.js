const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    vehicle_number: { type: String, required: true },
    vehicle_type: { type: String, required: true },
    capacity: { type: Number, default: 0 },
    status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
