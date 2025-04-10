//tracks status of location of goods
//validates tracking updtes
const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'booking', required: true },
    currentLocation: { type: String, required: true },
    status: { type: String, enum: ['in-transit', 'delivered', 'delayed'], default: 'in-trasnit' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('tracking', trackingSchema);
