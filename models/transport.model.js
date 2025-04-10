//transport schema.
//to store details about available transport options ie trucks, vans.
const mongoose = require('mongoose');

const TransportSchema = new mongoose.Schema({
   vehicleType: { type: String, required: true, index: true },
   capacity: {
     type: Number,
     required: true, 
     validate: [function(value) {
        return value > 0;
     }, 'Capacity must be greater than 0'] 
   },
   availability: { type: [String], default: ['available', 'en-route', 'not-available'] }
});

module.exports = mongoose.model('Transport', TransportSchema);