//handle booking details before saving them to the DB
const mongoose = require('mongoose');
 
const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pickupLocation: { type: String, required: true },
    dropOffLocation: { type: String, required: true },
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'confirmed', 'completed'], default: 'pending'}
});

module.exports = mongoose.model('Booking', bookingSchema);