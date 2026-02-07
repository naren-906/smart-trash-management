const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    user_number: { type: String, required: true },
    request_type: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    address: { type: String, required: true },
    status: { type: String, default: 'pending' },
    assignedDriver: { type: String, default: null },
    assignedDriverId: { type: String, default: null },
    time_stamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
