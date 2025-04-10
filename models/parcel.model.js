// parcel model
// parcel model linked to booking model
const mongoose = require('mongoose');

const ParcelSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    reciever: { type: String, required: true }, //making sure the field name matches my validation(use 'reciever').
    status: { type: String, default: 'Pending' },
    
    // linking to booking
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
});

module.exports = mongoose.model('Parcel', ParcelSchema);