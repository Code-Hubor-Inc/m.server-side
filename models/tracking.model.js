//tracking schema.
//to track the status and location of goods.
//implement this section later once the basic flow is functional.

const mongoose = require ('mongoose');
// const { validate } = require("./user.model"); 

const TrackingSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    status: { type: String, enum: ['in transit', 'delivered', 'cancelled'], required: true, index: true },
    currentLocation: { 
        type: String, 
        required: true,
         validate: [function(value) {
          return value.trim() !== '';
      }, 'Current location cannot be empty'] 
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tracking', TrackingSchema);