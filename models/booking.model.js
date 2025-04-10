//booking schema.
//to handle customer bookings.
const mongoose = require('mongoose');
 
const BookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transport: { type: mongoose.Schema.Types.ObjectId, ref: 'Transport', required: true },
    pickupLocation: {
         type: String,
         required: true, 
         validate: [function(value) {
            return value.trim() !== '';
         }, 'Pickup location cannot be empty'] 
      },
    dropoffLocation: {
         type: String,
         required: true,
         validate: [function(value) {
            return value.trim() !== '';
         }, 'Dropoff location cannot be empty'] 
      },
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending', index: true },
    parcel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Parcel' }] 
});

module.exports = mongoose.model('Booking', BookingSchema);